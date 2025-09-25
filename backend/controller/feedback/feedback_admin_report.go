package feedback

import (
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ====== Types for responses ======

type kpiBlock struct {
	TotalSubmissions  int      `json:"total_submissions"`
	Respondents       int      `json:"respondents"`
	OverallRating     *float64 `json:"overall_rating,omitempty"` // ค่าเฉลี่ย "คำถามเรตติ้งเว็บโดยรวม" เท่านั้น
	AvgRatingAll      *float64 `json:"avg_rating_all,omitempty"` // ไว้ดูอ้างอิง (ไม่ใช้แทน Overall)
	TextFeedbackCount int      `json:"text_feedback_count"`
}

type optionStat struct {
	ID    uint    `json:"id"`
	Label string  `json:"label"`
	Count int     `json:"count"`
	Pct   float64 `json:"pct"`
}

type questionOverview struct {
	ID        uint         `json:"id"`
	Key       string       `json:"key"`
	Label     string       `json:"label"`
	Type      string       `json:"type"` // rating | text | choice_single | choice_multi
	Responses int          `json:"responses"`
	AvgRating *float64     `json:"avg_rating,omitempty"`
	Options   []optionStat `json:"options,omitempty"`
	Samples   []string     `json:"samples,omitempty"`
}

type overviewOut struct {
	Period    string             `json:"period"`
	KPIs      kpiBlock           `json:"kpis"`
	Questions []questionOverview `json:"questions"`
}

// ===== helpers =====

func isYYYYMM(s string) bool {
	if len(s) != 7 || s[4] != '-' {
		return false
	}
	_, err := time.Parse("2006-01", s)
	return err == nil
}

func monthRangeFromYYYYMM(yyyyMM string) (start, end time.Time) {
	t, err := time.Parse("2006-01", yyyyMM)
	if err != nil {
		now := time.Now().UTC()
		t = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	}
	start = time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
	end = start.AddDate(0, 1, 0)
	return
}

// ==== Admin: Overview ====
// GET /admin/feedback/overview?period=YYYY-MM&limit=5&offset=0
func AdminFeedbackOverview(c *gin.Context) {
	db := config.DB()

	period := c.Query("period")
	if !isYYYYMM(period) {
		period = time.Now().Format("2006-01")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit <= 0 {
		limit = 5
	}
	if offset < 0 {
		offset = 0
	}

	out := overviewOut{Period: period}

	// ---- KPIs (ระดับเดือน) ----
	var totalSubs int64
	if err := db.
		Model(&entity.FeedbackSubmission{}).
		Where("period_key = ?", period).
		Count(&totalSubs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "count submissions failed"})
		return
	}

	var respondents int64
	if err := db.
		Model(&entity.FeedbackSubmission{}).
		Select("COUNT(DISTINCT uid)").
		Where("period_key = ?", period).
		Count(&respondents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "count respondents failed"})
		return
	}

	// avg ของทุกเรตติ้งในเดือนนี้ (อ้างอิง)
	type rowAvg struct{ Avg *float64 }
	var avgAllRow rowAvg
	if err := db.
		Table("feedback_answers AS fa").
		Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
		Where("fs.period_key = ? AND fa.rating IS NOT NULL", period).
		Select("AVG(fa.rating)::float8 AS avg").
		Scan(&avgAllRow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "compute avg rating failed"})
		return
	}
	avgAll := avgAllRow.Avg

	// Overall Rating: ใช้เฉพาะ "คำถามคีย์" ที่กำหนดไว้เท่านั้น (ไม่มีคีย์ = ไม่คำนวณ)
	var overall *float64
	if key := os.Getenv("OVERALL_RATING_KEY"); key != "" {
		var overallQ entity.FeedbackQuestion
		q := db.Select("id").Where("key = ? AND is_active = true", key).Limit(1).Find(&overallQ)
		if q.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "load overall key failed"})
			return
		}
		if q.RowsAffected > 0 {
			type rowOverall struct{ Avg *float64 }
			var r rowOverall
			if err := db.
				Table("feedback_answers AS fa").
				Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
				Where("fs.period_key = ? AND fa.rating IS NOT NULL AND fa.question_id = ?", period, overallQ.ID).
				Select("AVG(fa.rating)::float8 AS avg").
				Scan(&r).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "compute overall rating failed"})
				return
			}
			overall = r.Avg
		}
	}

	// นับ text ทั้งหมดในเดือนนี้
	var textCount int64
	if err := db.
		Table("feedback_answers AS fa").
		Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
		Joins("JOIN feedback_questions fq ON fq.id = fa.question_id").
		Where("fs.period_key = ? AND fq.type = ? AND fa.text IS NOT NULL AND fa.text <> ''", period, "text").
		Count(&textCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "count text failed"})
		return
	}

	out.KPIs = kpiBlock{
		TotalSubmissions:  int(totalSubs),
		Respondents:       int(respondents),
		OverallRating:     overall, // จะเป็น nil ถ้าไม่ตั้ง OVERALL_RATING_KEY หรือหาไม่เจอ
		AvgRatingAll:      avgAll,  // ไว้โชว์ประกอบ/ดีบักเท่านั้น
		TextFeedbackCount: int(textCount),
	}

	// ---- Questions overview (ของใครของมัน) ----
	type qRow struct {
		ID    uint
		Key   string
		Label string
		Type  string
		Sort  int
	}
	var qs []qRow
	if err := db.
		Table("feedback_questions").
		Where("is_active = true").
		Order("sort ASC, id ASC").
		Select("id, key, label, type, sort").
		Scan(&qs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "load questions failed"})
		return
	}

	for _, q := range qs {
		item := questionOverview{
			ID:    q.ID,
			Key:   q.Key,
			Label: q.Label,
			Type:  q.Type,
		}

		// จำนวนคำตอบของ "คำถามนี้" ในเดือนนั้น
		var responses int64
		if err := db.
			Table("feedback_answers fa").
			Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
			Where("fs.period_key = ? AND fa.question_id = ?", period, q.ID).
			Count(&responses).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "count responses failed"})
			return
		}
		item.Responses = int(responses)

		// ค่าเฉลี่ย (เฉพาะคำถามนี้) ถ้าเป็น rating
		if q.Type == "rating" {
			type rA struct{ Avg *float64 }
			var r rA
			if err := db.
				Table("feedback_answers fa").
				Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
				Where("fs.period_key = ? AND fa.question_id = ? AND fa.rating IS NOT NULL", period, q.ID).
				Select("AVG(fa.rating)::float8 AS avg").
				Scan(&r).Error; err != nil && err != gorm.ErrRecordNotFound {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "avg rating by question failed"})
				return
			}
			item.AvgRating = r.Avg
		}

		// ตัวเลือก (เฉพาะคำถามนี้)
		if q.Type == "choice_single" || q.Type == "choice_multi" {
			type opt struct{ ID uint; Label string; Sort int }
			var opts []opt
			if err := db.
				Table("feedback_options").
				Where("question_id = ?", q.ID).
				Order("sort ASC, id ASC").
				Select("id, label, sort").
				Scan(&opts).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "load options failed"})
				return
			}

			counts := map[uint]int64{}

			// single
			type pair struct{ OptionID uint; Count int64 }
			var singles []pair
			if err := db.
				Table("feedback_answers fa").
				Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
				Where("fs.period_key = ? AND fa.question_id = ? AND fa.option_id IS NOT NULL", period, q.ID).
				Select("fa.option_id AS option_id, COUNT(*) AS count").
				Group("fa.option_id").
				Scan(&singles).Error; err == nil {
				for _, p := range singles {
					counts[p.OptionID] += p.Count
				}
			}

			// multi
			var multis []pair
			if err := db.
				Table("feedback_answer_options kao").
				Joins("JOIN feedback_answers fa ON fa.id = kao.answer_id").
				Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
				Where("fs.period_key = ? AND fa.question_id = ?", period, q.ID).
				Select("kao.option_id AS option_id, COUNT(*) AS count").
				Group("kao.option_id").
				Scan(&multis).Error; err == nil {
				for _, p := range multis {
					counts[p.OptionID] += p.Count
				}
			}

			total := float64(responses)
			for _, o := range opts {
				cnt := counts[o.ID]
				pct := 0.0
				if total > 0 {
					pct = float64(cnt) * 100.0 / total
				}
				item.Options = append(item.Options, optionStat{
					ID:    o.ID,
					Label: o.Label,
					Count: int(cnt),
					Pct:   pct,
				})
			}

			sort.Slice(item.Options, func(i, j int) bool {
				if item.Options[i].Count == item.Options[j].Count {
					return strings.Compare(item.Options[i].Label, item.Options[j].Label) < 0
				}
				return item.Options[i].Count > item.Options[j].Count
			})
		}

		// text samples (เฉพาะคำถามนี้)
		if q.Type == "text" && limit > 0 {
			var texts []string
			if err := db.
				Table("feedback_answers fa").
				Joins("JOIN feedback_submissions fs ON fs.id = fa.submission_id").
				Where("fs.period_key = ? AND fa.question_id = ? AND fa.text IS NOT NULL AND fa.text <> ''", period, q.ID).
				Order("fa.created_at DESC").
				Offset(offset).Limit(limit).
				Pluck("fa.text", &texts).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "load text samples failed"})
				return
			}
			item.Samples = texts
		}

		out.Questions = append(out.Questions, item)
	}

	c.JSON(http.StatusOK, out)
}

// ==== Admin: User Report ====
// GET /admin/feedback/users/:uid
// (เวอร์ชันนี้ดึง **ทุก submission** ของผู้ใช้ ไม่สน from/to)
func AdminFeedbackUserReport(c *gin.Context) {
	db := config.DB()

	uid := c.Param("uid")
	if uid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "uid required"})
		return
	}

	type answerRow struct {
		QuestionID   uint     `json:"question_id"`
		Type         string   `json:"type"`
		Label        string   `json:"label"`
		Rating       *int     `json:"rating,omitempty"`
		Text         *string  `json:"text,omitempty"`
		OptionID     *uint    `json:"option_id,omitempty"`
		OptionLabel  *string  `json:"option_label,omitempty"`
		OptionIDs    []uint   `json:"option_ids,omitempty"`
		OptionLabels []string `json:"option_labels,omitempty"`
	}
	type submissionItem struct {
		SubmissionID uint        `json:"submission_id"`
		PeriodKey    *string     `json:"period_key"`
		SubmittedAt  time.Time   `json:"submitted_at"`
		Source       *string     `json:"source"`
		Answers      []answerRow `json:"answers"`
	}

	out := struct {
		UID         string           `json:"uid"`
		Submissions []submissionItem `json:"submissions"`
	}{UID: uid}

	// load **all** submissions for user (latest first)
	var subs []entity.FeedbackSubmission
	if err := db.
		Where("uid = ?", uid).
		Order("submitted_at DESC, id DESC").
		Find(&subs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "load submissions failed"})
		return
	}

	for _, s := range subs {
		item := submissionItem{
			SubmissionID: s.ID,
			PeriodKey:    s.PeriodKey,
			SubmittedAt:  s.SubmittedAt,
			Source:       s.Source,
		}

		// answers with question info and single option label
		type aRow struct {
			ID         uint
			QuestionID uint
			Type       string
			Label      string
			Rating     *int
			Text       *string
			OptionID   *uint
			OptLabel   *string
		}
		var ars []aRow
		if err := db.
			Table("feedback_answers fa").
			Joins("JOIN feedback_questions fq ON fq.id = fa.question_id").
			Joins("LEFT JOIN feedback_options fo ON fo.id = fa.option_id").
			Where("fa.submission_id = ?", s.ID).
			Select("fa.id, fa.question_id, fq.type, fq.label, fa.rating, fa.text, fa.option_id, fo.label AS opt_label").
			Order("fa.id ASC").
			Scan(&ars).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "load answers failed"})
			return
		}

		// multi options per answer
		type multiRow struct {
			AnswerID uint
			OptionID uint
			Label    string
		}
		var multimap = map[uint][]multiRow{}
		var multiRows []multiRow
		if err := db.
			Table("feedback_answer_options kao").
			Joins("JOIN feedback_options fo ON fo.id = kao.option_id").
			Where("kao.answer_id IN (?)",
				db.Table("feedback_answers").Select("id").Where("submission_id = ?", s.ID),
			).
			Select("kao.answer_id, kao.option_id, fo.label").
			Order("kao.answer_id ASC, kao.option_id ASC").
			Scan(&multiRows).Error; err == nil {
			for _, m := range multiRows {
				multimap[m.AnswerID] = append(multimap[m.AnswerID], m)
			}
		}

		for _, a := range ars {
			row := answerRow{
				QuestionID: a.QuestionID,
				Type:       a.Type,
				Label:      a.Label,
				Rating:     a.Rating,
				Text:       a.Text,
				OptionID:   a.OptionID,
			}
			if a.OptLabel != nil {
				row.OptionLabel = a.OptLabel
			}
			if ms, ok := multimap[a.ID]; ok && len(ms) > 0 {
				for _, m := range ms {
					row.OptionIDs = append(row.OptionIDs, m.OptionID)
					row.OptionLabels = append(row.OptionLabels, m.Label)
				}
			}
			item.Answers = append(item.Answers, row)
		}

		out.Submissions = append(out.Submissions, item)
	}

	c.JSON(http.StatusOK, out)
}
