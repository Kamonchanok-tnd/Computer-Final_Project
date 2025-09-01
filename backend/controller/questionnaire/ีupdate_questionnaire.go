package questionnaire

import (
	"net/http"
	"strconv"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"fmt"
	"strings"
)

// GET /questionnaires/:id
func GetQuestionnaire(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var questionnaire entity.Questionnaire
	err = config.DB().
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("priority ASC")
		}).
		Preload("Questions.AnswerOptions").
		First(&questionnaire, id).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
		return
	}

	c.JSON(http.StatusOK, questionnaire)
}


// ===== DTO สำหรับรับจาก FE 
type updateQuestionnaireReq struct {
	NameQuestionnaire string  `json:"nameQuestionnaire"`
	Description       string  `json:"description"`
	Quantity          int     `json:"quantity"`
	UID               uint    `json:"uid"`
	Priority          int     `json:"priority"`

	// ฟิลด์ที่อาจเป็น null ได้ ใช้ *string/*int/*uint
	TestType       *string `json:"testType"`
	ConditionOnID  *uint   `json:"conditionOnID"`
	ConditionScore *int    `json:"conditionScore"`
	ConditionType  *string `json:"conditionType"`
	Picture        *string `json:"picture"` // base64/URL หรือ null

	// ส่งมาเมื่ออยากแทนที่กลุ่มทั้งหมด; ถ้าไม่ส่ง key นี้ จะไม่แตะ Groups
	Groups *[]uint `json:"groups"`
}

// PATCH /questionnaires/:id
func UpdateQuestionnaire(c *gin.Context) {
	// รับค่า ID จาก URL
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// bind JSON
	var req updateQuestionnaireReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Println("Received update payload:", req)

	// หา record เดิม
	var existing entity.Questionnaire
	if err := config.DB().First(&existing, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
		return
	}
	log.Println("Existing questionnaire before update:", existing)

	// อัปเดตฟิลด์ปกติ
	existing.NameQuestionnaire = req.NameQuestionnaire
	existing.Description       = req.Description
	existing.Quantity          = req.Quantity
	existing.UID               = req.UID
	existing.Priority          = req.Priority

	// อัปเดตฟิลด์ที่อาจเป็น null: ถ้าไม่ส่งหรือส่งว่าง -> ล้างให้เป็น nil (สไตล์เดียวกับตัวอย่าง)
	// testType
	if req.TestType != nil && *req.TestType != "" {
		existing.TestType = req.TestType
	} else {
		existing.TestType = nil
	}
	// conditionOnID
	if req.ConditionOnID != nil {
		existing.ConditionOnID = req.ConditionOnID
	} else {
		existing.ConditionOnID = nil
	}
	// conditionScore
	if req.ConditionScore != nil {
		existing.ConditionScore = req.ConditionScore
	} else {
		existing.ConditionScore = nil
	}
	// conditionType
	if req.ConditionType != nil && *req.ConditionType != "" {
		existing.ConditionType = req.ConditionType
	} else {
		existing.ConditionType = nil
	}
	// picture (base64/URL)
	if req.Picture != nil && *req.Picture != "" {
		existing.Picture = req.Picture
	} else {
		existing.Picture = nil
	}

	// บันทึก entity ก่อน
	if err := config.DB().Save(&existing).Error; err != nil {
		log.Println("Error saving questionnaire:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update questionnaire"})
		return
	}

	// อัปเดต Groups เมื่อ key "groups" ถูกส่งมาเท่านั้น (แทนที่ทั้งชุด)
	if req.Groups != nil {
		var groups []entity.QuestionnaireGroup
		if len(*req.Groups) > 0 {
			if err := config.DB().Where("id IN ?", *req.Groups).Find(&groups).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch groups"})
				return
			}
		}
		// Replace ทั้งหมด (ส่ง [] จะเป็นการเคลียร์กลุ่มทั้งหมด)
		if err := config.DB().Model(&existing).Association("Groups").Replace(&groups); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to replace groups"})
			return
		}
	}

	// reload พร้อม Groups เพื่อส่งกลับให้ FE เห็นผลล่าสุด
	if err := config.DB().Preload("Groups").First(&existing, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload updated questionnaire"})
		return
	}

	log.Println("Updated questionnaire after saving:", existing)

	c.JSON(http.StatusOK, gin.H{
		"message":       "Update successful",
		"questionnaire": existing,
	})
}




type questionOut struct {
	ID           uint    `json:"id"`
	NameQuestion string  `json:"nameQuestion"`
	QuID         uint    `json:"quID"`
	Priority     int     `json:"priority"`
	Picture      *string `json:"picture"` // ตาม entity.Question เป็น *string
}

type emotionChoiceOut struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Picture string `json:"picture"` // ให้ตรงกับ entity.EmotionChoice.Picture (string)
}

type answerOut struct {
	ID              uint              `json:"id"`
	Description     string            `json:"description"`
	Point           int               `json:"point"`
	QID             uint              `json:"qid"`
	EmotionChoiceID uint              `json:"EmotionChoiceID"`
	EmotionChoice   *emotionChoiceOut `json:"emotionChoice,omitempty"`
}

type qaResponse struct {
	Question questionOut `json:"question"`
	Answers  []answerOut `json:"answers"`
}

// GET /questionnaires/:id/questions-answers
func GetQuestionAnswerByQuetionnaireID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var questions []entity.Question
	if err := config.DB().
		Where("qu_id = ?", id).
		Preload("AnswerOptions").
		Preload("AnswerOptions.EmotionChoice").
		Order("priority ASC, id ASC").
		Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	out := make([]qaResponse, 0, len(questions))
	for _, q := range questions {
		item := qaResponse{
			Question: questionOut{
				ID:           q.ID,
				NameQuestion: q.NameQuestion,
				QuID:         q.QuID,
				Priority:     q.Priority,
				Picture:      q.Picture,
			},
			Answers: make([]answerOut, 0, len(q.AnswerOptions)),
		}

		for _, a := range q.AnswerOptions {
			var emo *emotionChoiceOut
			if a.EmotionChoiceID != 0 {
				if a.EmotionChoice.ID != 0 { // preload แล้ว
					emo = &emotionChoiceOut{
						ID:      a.EmotionChoice.ID,
						Name:    a.EmotionChoice.Name,
						Picture: a.EmotionChoice.Picture, // string -> string
					}
				} else {
					// fallback กรณีไม่ได้ preload รายละเอียด
					emo = &emotionChoiceOut{
						ID:      a.EmotionChoiceID,
						Name:    "",
						Picture: "",
					}
				}
			}

			item.Answers = append(item.Answers, answerOut{
				ID:              a.ID,
				Description:     a.Description,
				Point:           a.Point,
				QID:             a.QID,
				EmotionChoiceID: a.EmotionChoiceID,
				EmotionChoice:   emo,
			})
		}

		out = append(out, item)
	}

	c.JSON(http.StatusOK, out)
}




type updateQuestionDTO struct {
	ID           *uint   `json:"id"`
	NameQuestion string  `json:"nameQuestion"`
	Priority     int     `json:"priority"`
	Picture      *string `json:"picture"` // nil เพื่อล้างรูป
}

type updateAnswerDTO struct {
	ID              *uint  `json:"id"`
	Description     string `json:"description"`
	Point           int    `json:"point"`
	EmotionChoiceID uint   `json:"EmotionChoiceID"`
}

type updateQAItem struct {
	Question updateQuestionDTO `json:"question"`
	Answers  []updateAnswerDTO `json:"answers"`
}

// PATCH /questionnaires/:id/questions-answers
func UpdateQuestionAndAnswer(c *gin.Context) {
	qid, err := strconv.Atoi(c.Param("id"))
	if err != nil || qid <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid questionnaire id"})
		return
	}

	var req []updateQAItem
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "panic while updating"})
		}
	}()

	// validate ว่ามี questionnaire นี้
	var questionnaire entity.Questionnaire
	if err := tx.First(&questionnaire, uint(qid)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "questionnaire not found"})
		return
	}

	keepQuestionIDs := make([]uint, 0, len(req))
	keepAnswerIDs := []uint{}

	// upsert ทีละข้อ
	for _, item := range req {
		// ---- Question ----
		var q entity.Question
		if item.Question.ID != nil && *item.Question.ID > 0 {
			if err := tx.First(&q, *item.Question.ID).Error; err == nil {
				if err := tx.Model(&q).Updates(map[string]interface{}{
					"name_question": item.Question.NameQuestion,
					"priority":      item.Question.Priority,
					"picture":       item.Question.Picture, // nil เพื่อลบ
					"qu_id":         questionnaire.ID,
				}).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "update question failed"})
					return
				}
			} else {
				q = entity.Question{
					NameQuestion: item.Question.NameQuestion,
					Priority:     item.Question.Priority,
					Picture:      item.Question.Picture,
					QuID:         questionnaire.ID,
				}
				if err := tx.Create(&q).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "create question failed"})
					return
				}
			}
		} else {
			q = entity.Question{
				NameQuestion: item.Question.NameQuestion,
				Priority:     item.Question.Priority,
				Picture:      item.Question.Picture,
				QuID:         questionnaire.ID,
			}
			if err := tx.Create(&q).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "create question failed"})
				return
			}
		}
		keepQuestionIDs = append(keepQuestionIDs, q.ID)

		// ---- Answers ของคำถามนี้ ----
		for _, a := range item.Answers {
			var ans entity.AnswerOption
			if a.ID != nil && *a.ID > 0 {
				if err := tx.First(&ans, *a.ID).Error; err == nil {
					if err := tx.Model(&ans).Updates(map[string]interface{}{
						"description":       a.Description,
						"point":             a.Point,
						"emotion_choice_id": a.EmotionChoiceID,
						"q_id":              q.ID,
					}).Error; err != nil {
						tx.Rollback()
						c.JSON(http.StatusInternalServerError, gin.H{"error": "update answer failed"})
						return
					}
				} else {
					ans = entity.AnswerOption{
						Description:     a.Description,
						Point:           a.Point,
						QID:             q.ID,
						EmotionChoiceID: a.EmotionChoiceID,
					}
					if err := tx.Create(&ans).Error; err != nil {
						tx.Rollback()
						c.JSON(http.StatusInternalServerError, gin.H{"error": "create answer failed"})
						return
					}
				}
			} else {
				ans = entity.AnswerOption{
					Description:     a.Description,
					Point:           a.Point,
					QID:             q.ID,
					EmotionChoiceID: a.EmotionChoiceID,
				}
				if err := tx.Create(&ans).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "create answer failed"})
					return
				}
			}
			keepAnswerIDs = append(keepAnswerIDs, ans.ID)
		}
	}

	// ---- ลบ question ที่ไม่ได้ส่งมา ----
	var oldQ []entity.Question
	if err := tx.Where("qu_id = ?", questionnaire.ID).Find(&oldQ).Error; err == nil {
		for _, oq := range oldQ {
			if !containsID(keepQuestionIDs, oq.ID) {
				if err := tx.Delete(&oq).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "delete question failed"})
					return
				}
			}
		}
	}

	// ---- ลบ answer ที่ไม่ได้ส่งมา (เฉพาะของ questionnaire นี้) ----
	var oldA []entity.AnswerOption
	if err := tx.Joins("JOIN questions ON questions.id = answer_options.q_id").
		Where("questions.qu_id = ?", questionnaire.ID).
		Find(&oldA).Error; err == nil {
		for _, oa := range oldA {
			if !containsID(keepAnswerIDs, oa.ID) {
				if err := tx.Delete(&oa).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "delete answer failed"})
					return
				}
			}
		}
	}

	// ---- อัปเดตจำนวนข้อ (Quantity) ให้ตรงกับข้อมูลปัจจุบัน ----
	var cnt int64
	if err := tx.Model(&entity.Question{}).Where("qu_id = ?", questionnaire.ID).Count(&cnt).Error; err == nil {
		if err := tx.Model(&questionnaire).Update("quantity", int(cnt)).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "update quantity failed"})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Update Q&A successful"})
}

func containsID(ids []uint, id uint) bool {
	for _, x := range ids {
		if x == id {
			return true
		}
	}
	return false
}



// transport models (ไม่ผูกกับ gorm)
type CriteriaOutput struct {
	ID          uint   `json:"id"`
	Description string `json:"description"`
	MinScore    int    `json:"minScore"`
	MaxScore    int    `json:"maxScore"`
}


// GET /questionnaires/:id/criteria
func GetCriteriaByQuestionnaireID(c *gin.Context) {
	db := config.DB()
	qid := c.Param("id")

	var outputs []CriteriaOutput

	q := db.Table("criteria AS c").
		Select(`
			DISTINCT c.id,
			c.description,
			c.min_criteria_score AS min_score,
			c.max_criteria_score AS max_score
		`).
		Joins("JOIN calculations AS cal ON cal.c_id = c.id").
		Where("cal.qu_id = ?", qid).
		// ถ้าใช้ soft delete ของ GORM:
		Where("c.deleted_at IS NULL").
		Where("cal.deleted_at IS NULL") // ตัด calculation ที่ถูกลบออกด้วย (ถ้ามี)

	// ถ้าโปรเจ็กต์ไม่ได้ใช้ soft delete แต่มี flag เช่น is_deleted:
	// q = q.Where("c.is_deleted = FALSE").Where("cal.is_deleted = FALSE")

	if err := q.
		Order("c.min_criteria_score ASC, c.id ASC").
		Scan(&outputs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": outputs})
}



type CriteriaUpdateInput struct {
	ID          *uint  `json:"id"`
	Description string `json:"description" binding:"required"`
	MinScore    int    `json:"minScore"`
	MaxScore    int    `json:"maxScore"`
}

type CriteriaUpdateRequest struct {
	Updated []CriteriaUpdateInput `json:"updated"`
	Deleted []uint                `json:"deleted"`
}


// PATCH /questionnaires/:id/criteria
func UpdateCriteriaByQuestionnaireID(c *gin.Context) {
	db := config.DB()
	qidStr := c.Param("id")

	qid64, err := strconv.ParseUint(qidStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id ไม่ถูกต้อง"})
		return
	}
	qid := uint(qid64)

	var req CriteriaUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		// ลบ
		if len(req.Deleted) > 0 {
			var owns []uint
			if err := tx.Table("calculations").
				Select("c_id").
				Where("qu_id = ? AND c_id IN ?", qid, req.Deleted).
				Pluck("c_id", &owns).Error; err != nil {
				return err
			}
			if len(owns) != len(req.Deleted) {
				return fmt.Errorf("บางรายการไม่อยู่ใน questionnaire นี้")
			}

			if err := tx.Where("c_id IN ?", req.Deleted).Delete(&entity.Calculation{}).Error; err != nil {
				return err
			}
			if err := tx.Where("id IN ?", req.Deleted).Delete(&entity.Criteria{}).Error; err != nil {
				return err
			}
		}

		// เพิ่ม/อัปเดต
		for _, it := range req.Updated {
			if it.MinScore > it.MaxScore {
				return fmt.Errorf("minScore ต้องไม่มากกว่า maxScore")
			}

			if it.ID != nil {
				// ตรวจความเป็นเจ้าของ
				var count int64
				if err := tx.Model(&entity.Calculation{}).
					Where("qu_id = ? AND c_id = ?", qid, *it.ID).
					Count(&count).Error; err != nil {
					return err
				}
				if count == 0 {
					return fmt.Errorf("criteria id %d ไม่อยู่ใน questionnaire นี้", *it.ID)
				}

				if err := tx.Model(&entity.Criteria{}).
					Where("id = ?", *it.ID).
					Updates(map[string]any{
						"description":         it.Description,
						"min_criteria_score":  it.MinScore,
						"max_criteria_score":  it.MaxScore,
					}).Error; err != nil {
					return err
				}
			} else {
				crit := entity.Criteria{
					Description:       it.Description,
					MinCriteriaScore:  it.MinScore,
					MaxCriteriaScore:  it.MaxScore,
				}
				if err := tx.Create(&crit).Error; err != nil {
					return err
				}
				if err := tx.Create(&entity.Calculation{
					CID:  crit.ID,
					QuID: qid,
				}).Error; err != nil {
					return err
				}
			}
		}

		// ตรวจช่วงคะแนนซ้อนทับ (server-side guard)
		var rows []struct {
			ID  uint
			Min int
			Max int
		}
		if err := tx.Table("criteria c").
			Select("c.id, c.min_criteria_score AS min, c.max_criteria_score AS max").
			Joins("JOIN calculations cal ON cal.c_id = c.id").
			Where("cal.qu_id = ?", qid).
			Order("min ASC, max ASC, id ASC").
			Scan(&rows).Error; err != nil {
			return err
		}
		for i := 1; i < len(rows); i++ {
			if rows[i].Min <= rows[i-1].Max {
				return fmt.Errorf("ช่วงคะแนนซ้อนทับ (id %d กับ %d)", rows[i-1].ID, rows[i].ID)
			}
		}
		return nil
	})

	if err != nil {
		msg := err.Error()
		code := http.StatusConflict
		if strings.Contains(msg, "ต้องไม่มากกว่า") || strings.Contains(msg, "ไม่ถูกต้อง") {
			code = http.StatusBadRequest
		}
		c.JSON(code, gin.H{"error": msg})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตเกณฑ์การประเมินเรียบร้อยแล้ว"})
}

