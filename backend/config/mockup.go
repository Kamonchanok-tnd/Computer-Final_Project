package config

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"sukjai_project/entity"
	"gorm.io/gorm"
)

/*
สคริปต์ mock ข้อมูลตามไทม์ไลน์ใหม่:
- 1 Jul : (onLogin + afterChat) ในวันเดียวกัน
- ต่อจากนั้น: วน (interval + afterChat) ทุกๆ +14 วัน
- วนจนวันสุดท้าย = 16 วันก่อน 1 Oct ของปีปัจจุบัน (เช่น 2025-09-15)
- ทำให้ผู้ใช้ 4 คน: Andy / Marry / Bell + UID=2 ถ้ามี (ถ้าไม่มีก็สร้าง)
- คะแนน/Result อิง criteria+calculations จริง (fallback "แนวโน้ม..." ถ้าไม่เจอ mapping)
*/

func SetupMockUpData(db *gorm.DB) error {
	rand.Seed(time.Now().UnixNano())

	// ---------- 1) สร้างผู้ใช้ 3 คน (FirstOrCreate) ----------
	pw, err := HashPassword("user123")
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}
	var uAndy, uMarry, uBell entity.Users

	if err := db.Where("username = ?", "Andy").
		Attrs(entity.Users{
			Username:    "Andy",
			Email:       "andy@example.com",
			Password:    pw,
			Role:        "user",
			Age:         27,
			Gender:      "ชาย",
			PhoneNumber: "0989898989",
			Facebook:    "andy_fb",
			BirthDate:   "2000-01",
			PFID:        1,
		}).
		FirstOrCreate(&uAndy).Error; err != nil {
		return fmt.Errorf("create/find Andy: %w", err)
	}
	if err := db.Where("username = ?", "Marry").
		Attrs(entity.Users{
			Username:    "Marry",
			Email:       "marry@example.com",
			Password:    pw,
			Role:        "user",
			Age:         18,
			Gender:      "หญิง",
			PhoneNumber: "0987654321",
			Facebook:    "Marry_fb",
			BirthDate:   "1999-01",
			PFID:        1,
		}).
		FirstOrCreate(&uMarry).Error; err != nil {
		return fmt.Errorf("create/find Marry: %w", err)
	}
	if err := db.Where("username = ?", "Bell").
		Attrs(entity.Users{
			Username:    "Bell",
			Email:       "bell@example.com",
			Password:    pw,
			Role:        "user",
			Age:         23,
			Gender:      "หญิง",
			PhoneNumber: "0987654321",
			Facebook:    "Bell_fb",
			BirthDate:   "1995-01",
			PFID:        1,
		}).
		FirstOrCreate(&uBell).Error; err != nil {
		return fmt.Errorf("create/find Bell: %w", err)
	}

	// ---------- 2) รวม UID=2 (ถ้ามี/ไม่มีให้ ensure) ----------
	uid2, err := ensureUID2(db, pw)
	if err != nil {
		return err
	}
	userIDs := []uint{uAndy.ID, uMarry.ID, uBell.ID, uid2}

	// ---------- 3) โหลดกลุ่มที่ใช้: onLogin / afterChat / interval ----------
	gOnLogin, err := getGroupByTrigger(db, "onLogin")
	if err != nil {
		return err
	}
	gAfterChat, err := getGroupByTrigger(db, "afterChat")
	if err != nil {
		return err
	}
	gInterval, err := getGroupByTrigger(db, "interval")
	if err != nil {
		return err
	}

	// ---------- 4) สร้างไทม์ไลน์ ----------
	loc := time.Local
	year := time.Now().Year()

	// วันเริ่ม 1 Jul YYYY 10:00
	start := time.Date(year, time.July, 1, 10, 0, 0, 0, loc)

	// วันสุดท้าย = 16 วันก่อน 1 Oct YYYY
	last := time.Date(year, time.October, 1, 10, 0, 0, 0, loc).AddDate(0, 0, -16)

	// ---------- 5) ลงข้อมูล ----------
	for _, uid := range userIDs {
		// 5.1) 1 Jul: onLogin + afterChat (วันเดียวกัน)
		if err := seedGroupAt(db, uid, *gOnLogin, start, 0); err != nil {
			return err
		}
		if err := seedGroupAt(db, uid, *gAfterChat, start, 1); err != nil {
			return err
		}

		// 5.2) จากนั้นวน (interval + afterChat) ทุก 14 วัน
		d := start.AddDate(0, 0, 14) // เริ่ม 15 Jul
		lastSeed := start

		for d.Before(last) || d.Equal(last) {
			if err := seedGroupAt(db, uid, *gInterval, d, 0); err != nil {
				return err
			}
			if err := seedGroupAt(db, uid, *gAfterChat, d, 1); err != nil {
				return err
			}
			lastSeed = d
			d = d.AddDate(0, 0, 14)
		}

		// 5.3) ถ้ารอบ 14 วันไม่ตกเป๊ะที่วัน last ให้ "ปิดท้าย" อีกวัน ณ last
		if lastSeed.Before(last) {
			if err := seedGroupAt(db, uid, *gInterval, last, 2); err != nil {
				return err
			}
			if err := seedGroupAt(db, uid, *gAfterChat, last, 3); err != nil {
				return err
			}
		}
	}

	// ---------- 6) Seed Feedback ให้ครบทุก user (รวม uid=2) ----------
	if err := seedFeedbackForUserIDs(db, userIDs); err != nil {
		return err
	}

	return nil
}

// ensureUID2 ตรวจสอบว่ามีผู้ใช้ ID=2 หรือไม่
// - ถ้ามี: คืนค่า 2
// - ถ้าไม่มี: สร้างผู้ใช้ใหม่ ID=2 ชื่อ "UID2" (กันซ้ำ username/email)
//   หมายเหตุ: ใน Postgres/SQLite การกำหนด PK ตรง ๆ จะ insert ได้ ถ้า sequence ไม่ชน
func ensureUID2(db *gorm.DB, pw string) (uint, error) {
	var exists int64
	if err := db.Model(&entity.Users{}).Where("id = ?", 2).Count(&exists).Error; err != nil {
		return 0, fmt.Errorf("check uid=2 failed: %w", err)
	}
	if exists > 0 {
		return 2, nil
	}
	return 2, nil
}

/* ===================== seeding core ===================== */
func seedGroupAt(db *gorm.DB, uid uint, g entity.QuestionnaireGroup, when time.Time, idx int) error {
	// ใช้ของที่ preload มาจาก getGroupByTrigger โดยตรง
	links := g.QuestionnaireGroupQuestionnaires

	// ถ้ายังว่าง ลองโหลดผ่าน Association API (ไม่ผูกกับชื่อคอลัมน์)
	if len(links) == 0 {
		if err := db.Model(&g).Association("QuestionnaireGroupQuestionnaires").Find(&links); err != nil {
			return fmt.Errorf("load links for group %d (%s) failed: %w", g.ID, g.Name, err)
		}
		// เติม Questionnaire ให้แต่ละลิงก์ (กันเหนียว)
		for i := range links {
			if links[i].Questionnaire.ID == 0 {
				// ใช้ Association ระดับลิงก์เพื่อดึง Questionnaire
				_ = db.Model(&links[i]).Association("Questionnaire").Find(&links[i].Questionnaire)
			}
		}
	}

	if len(links) == 0 {
		// ไม่มีแบบทดสอบในกลุ่มนี้ ข้ามไป
		return nil
	}

	// วิ่งสร้างผลตามแบบในกลุ่ม
	for j, lk := range links {
		if lk.Questionnaire.ID == 0 {
			continue
		}
		if err := seedOneARAndTX(db, uid, g, lk.Questionnaire, when, idx+j); err != nil {
			return err
		}
	}
	return nil
}

func seedOneARAndTX(db *gorm.DB, uid uint, g entity.QuestionnaireGroup, q entity.Questionnaire, when time.Time, index int) error {
	dateStr := when.Format("2006-01-02")

	// 1) AssessmentResult (กันซ้ำ uid+qu+qg+date)
	ar := entity.AssessmentResult{
		Date: dateStr,
		UID:  uid,
		QuID: q.ID,
		QGID: g.ID,
	}
	var arExists int64
	_ = db.Model(&entity.AssessmentResult{}).
		Where("uid = ? AND qu_id = ? AND qg_id = ? AND date = ?", uid, q.ID, g.ID, dateStr).
		Count(&arExists).Error
	if arExists == 0 {
		if err := db.Create(&ar).Error; err != nil {
			return fmt.Errorf("create assessment_result failed: %w", err)
		}
	} else {
		if err := db.Where("uid = ? AND qu_id = ? AND qg_id = ? AND date = ?",
			uid, q.ID, g.ID, dateStr).
			First(&ar).Error; err != nil {
			return fmt.Errorf("find existing assessment_result failed: %w", err)
		}
	}

	// 2) คะแนน/ระดับ
	minScore, maxScore := loadMinMaxScoreForQuestionnaire(db, q.ID)
	if minScore > maxScore {
		minScore, maxScore = 0, 27
	}
	total, level := mockScoreAndLevel(minScore, maxScore, q.TestType, index)
	testType := ""
	if q.TestType != nil {
		testType = *q.TestType
	}
	if testType == "" {
		testType = determineTestType(q)
	}

	// 3) Result จาก criteria (fallback แนวโน้ม…)
	resultText := ""
	if desc, ok := findCriteriaDescriptionForScore(db, q.ID, total); ok {
		resultText = desc
	} else {
		resultText = mockResultText(total, minScore, maxScore)
	}

	// 4) Transaction (กันซ้ำ ARID + วันที่)
	tx := entity.Transaction{
		Description:        q.NameQuestionnaire,
		TotalScore:         total,
		MaxScore:           maxScore,
		Result:             resultText,
		ResultLevel:        level,
		TestType:           testType,
		QuestionnaireGroup: g.Name,
		ARID:               ar.ID,
	}
	tx.CreatedAt = when

	var txExists int64
	_ = db.Model(&entity.Transaction{}).
		Where("ar_id = ? AND DATE(created_at) = ?", ar.ID, dateStr).
		Count(&txExists).Error
	if txExists == 0 {
		if err := db.Create(&tx).Error; err != nil {
			return fmt.Errorf("create transaction failed: %w", err)
		}
	}

	return nil
}

/* ===================== lookups & helpers ===================== */

func getGroupByTrigger(db *gorm.DB, trigger string) (*entity.QuestionnaireGroup, error) {
	var g entity.QuestionnaireGroup
	if err := db.
		Preload("QuestionnaireGroupQuestionnaires.Questionnaire").
		Where("trigger_type = ?", trigger).
		First(&g).Error; err != nil {
		return nil, fmt.Errorf("questionnaire_group not found (trigger_type=%s)", trigger)
	}
	return &g, nil
}

func loadMinMaxScoreForQuestionnaire(db *gorm.DB, quID uint) (int, int) {
	type row struct{ MinS, MaxS int }
	var rs []row

	err := db.
		Table("criteria").
		Select("criteria.min_criteria_score as min_s, criteria.max_criteria_score as max_s").
		Joins("JOIN calculations ON calculations.c_id = criteria.id").
		Where("calculations.qu_id = ?", quID).
		Scan(&rs).Error
	if err != nil || len(rs) == 0 {
		// รองรับชื่อคอลัมน์อีกแบบ (cid/quid)
		rs = nil
		if err2 := db.
			Table("criteria").
			Select("criteria.min_criteria_score as min_s, criteria.max_criteria_score as max_s").
			Joins("JOIN calculations ON calculations.cid = criteria.id").
			Where("calculations.quid = ?", quID).
			Scan(&rs).Error; err2 != nil || len(rs) == 0 {
			return 0, -1
		}
	}

	minV, maxV := 1<<31-1, -1<<31
	for _, r := range rs {
		if r.MinS < minV {
			minV = r.MinS
		}
		if r.MaxS > maxV {
			maxV = r.MaxS
		}
	}
	if minV == 1<<31-1 {
		minV = 0
	}
	if maxV == -1<<31 {
		maxV = 0
	}
	return minV, maxV
}

func findCriteriaDescriptionForScore(db *gorm.DB, quID uint, score int) (string, bool) {
	var descs []string
	// c_id / qu_id
	err := db.
		Table("criteria").
		Joins("JOIN calculations ON calculations.c_id = criteria.id").
		Where("calculations.qu_id = ? AND criteria.min_criteria_score <= ? AND criteria.max_criteria_score >= ?",
			quID, score, score).
		Order("criteria.max_criteria_score ASC").
		Limit(1).
		Pluck("criteria.description", &descs).Error
	if err == nil && len(descs) > 0 {
		return descs[0], true
	}
	// cid / quid
	descs = nil
	err = db.
		Table("criteria").
		Joins("JOIN calculations ON calculations.cid = criteria.id").
		Where("calculations.quid = ? AND criteria.min_criteria_score <= ? AND criteria.max_criteria_score >= ?",
			quID, score, score).
		Order("criteria.max_criteria_score ASC").
		Limit(1).
		Pluck("criteria.description", &descs).Error
	if err == nil && len(descs) > 0 {
		return descs[0], true
	}
	return "", false
}

func determineTestType(q entity.Questionnaire) string {
	if q.TestType != nil && *q.TestType != "" {
		return *q.TestType
	}
	name := strings.ToLower(q.NameQuestionnaire)
	switch {
	case strings.Contains(name, "9q"),
		strings.Contains(name, "2q"),
		strings.Contains(name, "st-5"),
		strings.Contains(name, "เครียด"),
		strings.Contains(name, "ซึมเศร้า"):
		return "negative"
	case strings.Contains(name, "happiness"),
		strings.Contains(name, "ความสุข"),
		strings.Contains(name, "mindfulness"),
		strings.Contains(name, "สติ"):
		return "positive"
	default:
		return "neutral"
	}
}

func mockScoreAndLevel(minScore, maxScore int, testTypePtr *string, index int) (total int, level string) {
	if minScore > maxScore {
		minScore, maxScore = 0, 27
	}
	span := maxScore - minScore
	mid := minScore + span/2

	switch index % 3 {
	case 0:
		total = minScore + rand.Intn(max(1, span/6)+1) // ต่ำ
	case 1:
		total = mid + rand.Intn(max(1, span/6)+1) - span/12 // กลาง
	default:
		total = maxScore - rand.Intn(max(1, span/6)+1) // สูง
	}
	if total < minScore {
		total = minScore
	}
	if total > maxScore {
		total = maxScore
	}

	testType := ""
	if testTypePtr != nil {
		testType = *testTypePtr
	}
	switch testType {
	case "negative":
		if total < mid {
			level = "happy"
		} else if total > mid {
			level = "sad"
		} else {
			level = "bored"
		}
	case "positive":
		if total < mid {
			level = "sad"
		} else if total > mid {
			level = "happy"
		} else {
			level = "bored"
		}
	default:
		if total == mid {
			level = "bored"
		} else if total < mid {
			level = "happy"
		} else {
			level = "sad"
		}
	}
	return total, level
}

func mockResultText(total, minScore, maxScore int) string {
	span := max(1, maxScore-minScore)
	pos := float64(total-minScore) / float64(span)
	switch {
	case pos < 0.33:
		return "แนวโน้มต่ำ"
	case pos < 0.66:
		return "แนวโน้มปานกลาง"
	default:
		return "แนวโน้มสูง"
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

/* ===================== NEW: Feedback seeding for users ===================== */

// seedFeedbackForUserIDs จะสร้าง feedback_submissions/answers ให้ user แต่ละคน
// - ทำ 3 เดือนล่าสุด (เดือนนี้ + ย้อนหลัง 2)
// - กันซ้ำด้วย uid + period_key
func seedFeedbackForUserIDs(db *gorm.DB, userIDs []uint) error {
	// โหลดคำถาม Active พร้อมตัวเลือก
	var questions []entity.FeedbackQuestion
	if err := db.
		Preload("Options", func(tx *gorm.DB) *gorm.DB { return tx.Order("sort ASC, id ASC") }).
		Where("is_active = ?", true).
		Order("sort ASC, id ASC").
		Find(&questions).Error; err != nil {
		return fmt.Errorf("load active feedback questions failed: %w", err)
	}
	if len(questions) == 0 {
		// ไม่มีแบบประเมิน active → ข้าม
		return nil
	}

	// สุ่มข้อความตอบแบบ text
	textCorpus := []string{
		"ใช้งานสะดวกมากครับ",
		"โดยรวมดี มีบางจุดช้า",
		"อยากได้ธีมมืดเพิ่ม",
		"ฟังก์ชันครบ ใช้ง่าย",
	}

	monthsBack := 3
	now := time.Now()

	for _, uid := range userIDs {
		// ถ้า user ไม่อยู่ในระบบ ข้าม
		var cnt int64
		if err := db.Model(&entity.Users{}).Where("id = ?", uid).Count(&cnt).Error; err != nil {
			return fmt.Errorf("check user %d failed: %w", uid, err)
		}
		if cnt == 0 {
			continue
		}

		for m := 0; m < monthsBack; m++ {
			pk := now.AddDate(0, -m, 0).Format("2006-01")

			// กันซ้ำ uid + period_key
			var exists int64
			if err := db.Model(&entity.FeedbackSubmission{}).
				Where("uid = ? AND period_key = ?", uid, pk).
				Count(&exists).Error; err != nil {
				return fmt.Errorf("check duplicate (uid=%d, period=%s) failed: %w", uid, pk, err)
			}
			if exists > 0 {
				continue
			}

			// ทำงานแบบทรานแซกชัน
			if err := db.Transaction(func(tx *gorm.DB) error {
				sub := entity.FeedbackSubmission{
					UID:       uid,
					PeriodKey: &pk,
				}
				if err := tx.Create(&sub).Error; err != nil {
					return fmt.Errorf("create submission failed: %w", err)
				}

				for _, q := range questions {
					ans := entity.FeedbackAnswer{
						SubmissionID: sub.ID,
						QuestionID:   q.ID,
						UID:          uid,
					}

					switch q.Type {
					case "rating":
						v := 1 + rand.Intn(5) // 1..5
						ans.Rating = &v
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (rating) failed: %w", err)
						}

					case "text":
						t := textCorpus[rand.Intn(len(textCorpus))]
						ans.Text = &t
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (text) failed: %w", err)
						}

					case "choice_single":
						if len(q.Options) > 0 {
							oid := q.Options[rand.Intn(len(q.Options))].ID
							ans.OptionID = &oid
						}
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (single) failed: %w", err)
						}

					case "choice_multi":
						// ต้องสร้าง answer ก่อน แล้วค่อยแทรกตารางสะพาน
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (multi-step1) failed: %w", err)
						}
						if len(q.Options) > 0 {
							// เลือก 1..min(3,len(options)) แบบไม่ซ้ำ
							maxPick := 3
							if maxPick > len(q.Options) {
								maxPick = len(q.Options)
							}
							k := 1 + rand.Intn(maxPick)
							perm := rand.Perm(len(q.Options))[:k]
							for _, i := range perm {
								link := entity.FeedbackAnswerOption{
									AnswerID: ans.ID,
									OptionID: q.Options[i].ID,
								}
								if err := tx.Create(&link).Error; err != nil {
									return fmt.Errorf("create answer_option failed: %w", err)
								}
							}
						}

					default:
						// เผื่อชนิดใหม่
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (default) failed: %w", err)
						}
					}
				}
				return nil
			}); err != nil {
				return err
			}
		}
	}
	return nil
}
