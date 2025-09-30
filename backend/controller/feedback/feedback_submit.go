package feedback

import (
	"net/http"
	"strings"
	"time"

	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ===== Constants =====
const (
	TypeRating       = "rating"
	TypeText         = "text"
	TypeChoiceSingle = "choice_single"
	TypeChoiceMulti  = "choice_multi"
)

// ===== DTO =====

type AnswerIn struct {
	QuestionID uint    `json:"question_id" binding:"required"`
	Rating     *int    `json:"rating,omitempty"`
	Text       *string `json:"text,omitempty"`
	OptionID   *uint   `json:"option_id,omitempty"`
	OptionIDs  []uint  `json:"option_ids,omitempty"`
}

type SubmitFeedbackIn struct {
	UID       uint       `json:"uid"        binding:"required,gt=0"`   // ให้ตรงกับโมเดล
	PeriodKey *string    `json:"period_key" binding:"omitempty,len=7"` // YYYY-MM
	Answers   []AnswerIn `json:"answers"    binding:"required,min=1,dive"`
}

// ===== Helpers =====

func optionBelongsTo(target uint, opts []entity.FeedbackOption) bool {
	for _, o := range opts {
		if o.ID == target {
			return true
		}
	}
	return false
}

// ===== POST /feedback/submit =====
// ผู้ใช้ส่งแบบประเมินเดือนละ 1 ครั้ง (unique: uid + period_key)
func SubmitFeedback(c *gin.Context) {
	var req SubmitFeedbackIn
	if err := c.ShouldBindJSON(&req); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}

	// period เป็น *string
	var periodStr string
	if req.PeriodKey != nil && *req.PeriodKey != "" {
		periodStr = *req.PeriodKey
	} else {
		periodStr = time.Now().Format("2006-01") // YYYY-MM
	}
	periodPtr := &periodStr

	// กันส่งซ้ำเดือนเดียวกัน
	var exists int64
	if err := config.DB().
		Model(&entity.FeedbackSubmission{}).
		Where("uid = ? AND period_key = ?", req.UID, periodStr).
		Count(&exists).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "เกิดข้อผิดพลาดของฐานข้อมูล", "DB_ERROR")
		return
	}
	if exists > 0 {
		util.HandleError(c, http.StatusConflict, "เดือนนี้ส่งแบบประเมินแล้ว", "DUPLICATE_PERIOD")
		return
	}

	// โหลดคำถามชุด Active พร้อมตัวเลือก (สั่ง order ไว้เพื่อความชัดเจน)
	var qs []entity.FeedbackQuestion
	if err := config.DB().
		Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort ASC, id ASC")
		}).
		Where("is_active = ?", true).
		Order("sort ASC, id ASC").
		Find(&qs).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "เกิดข้อผิดพลาดของฐานข้อมูล", "DB_ERROR")
		return
	}
	if len(qs) == 0 {
		util.HandleError(c, http.StatusBadRequest, "ยังไม่มีแบบฟอร์มประเมินที่ใช้งาน", "NO_ACTIVE_FORM")
		return
	}

	qMap := make(map[uint]entity.FeedbackQuestion, len(qs))
	for _, q := range qs {
		qMap[q.ID] = q
	}

	// Validate ตามชนิดคำถาม
	for _, a := range req.Answers {
		q, ok := qMap[a.QuestionID]
		if !ok {
			util.HandleError(c, http.StatusBadRequest, "มีคำถามที่ไม่อยู่ในชุด Active", "QUESTION_NOT_ACTIVE")
			return
		}
		switch q.Type {
		case TypeRating:
			if a.Rating == nil || *a.Rating < 1 || *a.Rating > 5 {
				util.HandleError(c, http.StatusBadRequest, "คะแนนต้องอยู่ระหว่าง 1–5", "RATING_OUT_OF_RANGE")
				return
			}
		case TypeText:
			if a.Text == nil || len(strings.TrimSpace(*a.Text)) == 0 {
				util.HandleError(c, http.StatusBadRequest, "ต้องกรอกข้อความ", "TEXT_REQUIRED")
				return
			}
		case TypeChoiceSingle:
			if a.OptionID == nil || !optionBelongsTo(*a.OptionID, q.Options) {
				util.HandleError(c, http.StatusBadRequest, "ตัวเลือกไม่ถูกต้อง", "OPTION_INVALID")
				return
			}
		case TypeChoiceMulti:
			if len(a.OptionIDs) == 0 {
				util.HandleError(c, http.StatusBadRequest, "ต้องเลือกอย่างน้อย 1 ตัวเลือก", "OPTIONS_REQUIRED")
				return
			}
			seen := map[uint]struct{}{}
			for _, oid := range a.OptionIDs {
				if _, dup := seen[oid]; dup {
					util.HandleError(c, http.StatusBadRequest, "มีตัวเลือกซ้ำ", "OPTION_DUPLICATE")
					return
				}
				seen[oid] = struct{}{}
				if !optionBelongsTo(oid, q.Options) {
					util.HandleError(c, http.StatusBadRequest, "มีตัวเลือกไม่ถูกต้อง", "OPTION_INVALID")
					return
				}
			}
		default:
			util.HandleError(c, http.StatusBadRequest, "ชนิดคำถามไม่รองรับ", "TYPE_UNSUPPORTED")
			return
		}
	}

	// บันทึกด้วย Transaction
	err := config.DB().Transaction(func(tx *gorm.DB) error {
		sub := entity.FeedbackSubmission{
			UID:       req.UID,
			PeriodKey: periodPtr, // *string
		}
		if err := tx.Create(&sub).Error; err != nil {
			return err
		}

		for _, a := range req.Answers {
			ans := entity.FeedbackAnswer{
				SubmissionID: sub.ID,
				QuestionID:   a.QuestionID,
				 UID:          req.UID,
			}
			q := qMap[a.QuestionID]

			switch q.Type {
			case TypeRating:
				ans.Rating = a.Rating
			case TypeText:
				// เก็บข้อความแบบ trim แล้ว
				if a.Text != nil {
					t := strings.TrimSpace(*a.Text)
					ans.Text = &t
				}
			case TypeChoiceSingle:
				ans.OptionID = a.OptionID
			case TypeChoiceMulti:
				// จะสร้างลิงก์ options ด้านล่าง
			}

			if err := tx.Create(&ans).Error; err != nil {
				return err
			}

			if q.Type == TypeChoiceMulti {
				links := make([]entity.FeedbackAnswerOption, 0, len(a.OptionIDs))
				for _, oid := range a.OptionIDs {
					links = append(links, entity.FeedbackAnswerOption{
						AnswerID: ans.ID,
						OptionID: oid,
					})
				}
				if len(links) > 0 {
					if err := tx.Create(&links).Error; err != nil {
						return err
					}
				}
			}
		}
		return nil
	})
	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, "บันทึกแบบประเมินไม่สำเร็จ", "SAVE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "submitted"})
}
