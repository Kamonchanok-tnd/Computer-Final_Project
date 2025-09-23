package feedback

import (
	"errors"
	"net/http"

	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetFeedbackByID - ดึง feedback ตาม id (admin หรือเจ้าของ)
func GetFeedbackByID(c *gin.Context) {
	id := c.Param("id")
	var fb entity.Feedback

	if err := config.DB().
		Preload("User").
		Preload("Score").
		First(&fb, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			util.HandleError(c, http.StatusNotFound, "ไม่พบฟีดแบ็ก", "FEEDBACK_NOT_FOUND")
			return
		}
		util.HandleError(c, http.StatusInternalServerError, "ดึงฟีดแบ็กล้มเหลว", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, fb)
}

// GetAllFeedbacks - ดึง feedback ทั้งหมด (admin)
func GetAllFeedbacks(c *gin.Context) {
	var fbs []entity.Feedback
	if err := config.DB().
		Preload("User").
		Preload("Score").
		Find(&fbs).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ดึงฟีดแบ็กทั้งหมดล้มเหลว", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, fbs)
}


// ---------- DTO ----------
type createFeedbackDTO struct {
	Scorepoint   int    `json:"scorepoint" binding:"required"` // 1..5
	FeedbackText string `json:"feedback_text"`                  // optional
}

type updateFeedbackDTO struct {
	Scorepoint   *int    `json:"scorepoint,omitempty"`   // 1..5
	FeedbackText *string `json:"feedback_text,omitempty"` // <- ต้องมีช่องว่างก่อนแท็ก
}

// ---------- Create: POST /feedback ----------
func CreateFeedback(c *gin.Context) {
	var req createFeedbackDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}
	if req.Scorepoint < 1 || req.Scorepoint > 5 {
		util.HandleError(c, http.StatusBadRequest, "คะแนนต้องอยู่ระหว่าง 1-5", "SCORE_RANGE")
		return
	}

	uidVal, ok := c.Get("userID")
	if !ok {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}
	uid, _ := uidVal.(uint) // ถ้า middleware เซ็ตเป็นชนิดอื่น (เช่น float64) ให้แปลงมาก่อน

	var fbID uint

	// ใช้ทรานแซกชัน: สร้าง Score -> Feedback
	if err := config.DB().Transaction(func(tx *gorm.DB) error {
		score := entity.Score{Scorepoint: req.Scorepoint}
		if err := tx.Create(&score).Error; err != nil {
			return err
		}
		fb := entity.Feedback{
			FeedbackText: req.FeedbackText,
			SID:          score.ID,
			UID:          uid,
		}
		if err := tx.Create(&fb).Error; err != nil {
			return err
		}
		fbID = fb.ID
		return nil
	}); err != nil {
		util.HandleError(c, http.StatusInternalServerError, "บันทึกฟีดแบ็กล้มเหลว", "CREATE_FAILED")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Feedback created",
		"id":      fbID,
	})
}

// ---------- Update: PUT /feedback/:id ----------
func UpdateFeedback(c *gin.Context) {
	id := c.Param("id")

	uidVal, ok := c.Get("userID")
	if !ok {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}
	uid, _ := uidVal.(uint)

	var req updateFeedbackDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}
	if req.Scorepoint != nil && (*req.Scorepoint < 1 || *req.Scorepoint > 5) {
		util.HandleError(c, http.StatusBadRequest, "คะแนนต้องอยู่ระหว่าง 1-5", "SCORE_RANGE")
		return
	}

	// ดึง feedback ที่เป็นของ user นี้ (กันแก้ของคนอื่น)
	var fb entity.Feedback
	if err := config.DB().
		Preload("Score").
		Where("id = ? AND uid = ?", id, uid).
		First(&fb).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			util.HandleError(c, http.StatusNotFound, "ไม่พบฟีดแบ็ก", "FEEDBACK_NOT_FOUND")
			return
		}
		util.HandleError(c, http.StatusInternalServerError, "ดึงฟีดแบ็กล้มเหลว", "FETCH_FAILED")
		return
	}

	// อัปเดตในทรานแซกชัน: อัปเดต Score (ถ้ามี) และ/หรือ FeedbackText
	if err := config.DB().Transaction(func(tx *gorm.DB) error {
		if req.Scorepoint != nil {
			if err := tx.Model(&entity.Score{}).
				Where("id = ?", fb.SID).
				Update("scorepoint", *req.Scorepoint).Error; err != nil {
				return err
			}
		}
		if req.FeedbackText != nil {
			if err := tx.Model(&entity.Feedback{}).
				Where("id = ?", fb.ID).
				Update("feedback_text", *req.FeedbackText).Error; err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		util.HandleError(c, http.StatusInternalServerError, "อัปเดตฟีดแบ็กล้มเหลว", "UPDATE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feedback updated"})
}

// ---------- Delete: DELETE /feedback/:id ----------
func DeleteFeedback(c *gin.Context) {
	id := c.Param("id")

	uidVal, ok := c.Get("userID")
	if !ok {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}
	uid, _ := uidVal.(uint)

	// ตรวจว่าเป็นของ user นี้
	var fb entity.Feedback
	if err := config.DB().Where("id = ? AND uid = ?", id, uid).First(&fb).Error; err != nil {
	 if errors.Is(err, gorm.ErrRecordNotFound) {
			util.HandleError(c, http.StatusNotFound, "ไม่พบฟีดแบ็ก", "FEEDBACK_NOT_FOUND")
			return
		}
		util.HandleError(c, http.StatusInternalServerError, "ดึงฟีดแบ็กล้มเหลว", "FETCH_FAILED")
		return
	}

	// ลบ feedback + score ที่เกี่ยวข้อง
	if err := config.DB().Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&entity.Feedback{}, fb.ID).Error; err != nil {
		 return err
		}
		if err := tx.Delete(&entity.Score{}, fb.SID).Error; err != nil {
		 // ถ้าอยากเก็บคะแนนไว้ ไม่ต้องลบ score ก็ได้
		 return err
		}
		return nil
	}); err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ลบฟีดแบ็กล้มเหลว", "DELETE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted"})
}