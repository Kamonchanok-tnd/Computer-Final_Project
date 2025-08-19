package mirror

import (
	"net/http"
	"time"

	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateMirror - บันทึก mirror ของผู้ใช้
func CreateMirror(c *gin.Context) {
	var mirror entity.Mirror

	if err := c.ShouldBindJSON(&mirror); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}

	// ดึง userID จาก context (middleware auth ต้องเซ็ตไว้ก่อน)
	userID, exists := c.Get("userID")
	if !exists {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}
	mirror.UID = userID.(uint)

	if err := config.DB().Create(&mirror).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถบันทึก Mirror ได้", "CREATE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mirror created successfully"})
}

// GetMirrorByDate - ดึง mirror ตามวันที่และ user
func GetMirrorByDate(c *gin.Context) {
	dateParam := c.Param("date") // format: YYYY-MM-DD
	userID, exists := c.Get("userID")
	if !exists {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	parsedDate, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, "รูปแบบวันที่ไม่ถูกต้อง (ต้องใช้ YYYY-MM-DD)", "INVALID_DATE")
		return
	}

	startOfDay := parsedDate
	endOfDay := parsedDate.Add(24 * time.Hour)

	var mirror entity.Mirror
	if err := config.DB().Where("uid = ? AND date >= ? AND date < ?", userID, startOfDay, endOfDay).
		First(&mirror).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			util.HandleError(c, http.StatusNotFound, "ไม่พบ Mirror ของวันนี้", "MIRROR_NOT_FOUND")
			return
		}
		util.HandleError(c, http.StatusInternalServerError, "เกิดข้อผิดพลาดในการดึงข้อมูล", "FETCH_FAILED")
		return
	}

	c.JSON(http.StatusOK, mirror)
}

// UpdateMirror - อัปเดต mirror ของผู้ใช้
func UpdateMirror(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	var mirror entity.Mirror
	if err := c.ShouldBindJSON(&mirror); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}

	// เช็กว่ามี record นี้และเป็นของ user นี้หรือไม่
	var existing entity.Mirror
	if err := config.DB().Where("id = ? AND uid = ?", id, userID).First(&existing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			util.HandleError(c, http.StatusNotFound, "ไม่พบ Mirror", "MIRROR_NOT_FOUND")
			return
		}
		util.HandleError(c, http.StatusInternalServerError, "ดึงข้อมูล Mirror ล้มเหลว", "FETCH_FAILED")
		return
	}

	if err := config.DB().Model(&existing).Updates(mirror).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถอัปเดต Mirror ได้", "UPDATE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mirror updated successfully"})
}

// DeleteMirror - ลบ mirror ของผู้ใช้
func DeleteMirror(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	if err := config.DB().Where("id = ? AND uid = ?", id, userID).Delete(&entity.Mirror{}).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถลบ Mirror ได้", "DELETE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mirror deleted successfully"})
}

// GET /mirror/summary?month=YYYY-MM
func GetMonthlySummary(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	month := c.Query("month") // e.g. 2025-08
	if month == "" {
		util.HandleError(c, http.StatusBadRequest, "ต้องระบุ month=YYYY-MM", "INVALID_MONTH")
		return
	}
	start, err := time.Parse("2006-01", month)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, "รูปแบบเดือนผิด ต้องเป็น YYYY-MM", "INVALID_MONTH")
		return
	}
	end := start.AddDate(0, 1, 0)

	type Result struct {
		EID     uint   `json:"eid"`
		Mood    string `json:"mood"`
		Picture string `json:"picture"`
		Count   int    `json:"count"`
	}

	var results []Result

	// ใช้ชื่อคอลัมน์จริง: m.e_id และ m.uid
	if err := config.DB().
		Table("emotions AS e").
		Select(`e.id AS eid, e.mood, e.picture, COUNT(m.id) AS count`).
		Joins(`LEFT JOIN mirrors AS m
               ON m.e_id = e.id
              AND m.uid  = ?
              AND m.date >= ?
              AND m.date < ?`, userID, start, end).
		Group(`e.id, e.mood, e.picture`).
		Order(`e.id`).
		Scan(&results).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ดึงข้อมูลสรุปไม่สำเร็จ", "FETCH_FAILED")
		return
	}

	c.JSON(http.StatusOK, results)
}
