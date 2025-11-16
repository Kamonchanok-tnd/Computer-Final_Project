package mirror

import (
	"errors"
	"log"
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

// GetMirrorByDate retrieves a mirror entry for a specific date and user
// Behavior:
//   - Found: 200 OK with mirror data
//   - Not found (today): 204 No Content (no error shown on frontend)
//   - Not found (past date): 404 Not Found with MIRROR_NOT_FOUND code
func GetMirrorByDate(c *gin.Context) {
	dateParam := c.Param("date") // format: YYYY-MM-DD

	// Verify user authentication
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("[ERROR][GetMirrorByDate] Authentication failed: userID not found in context")
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	// Use fixed timezone for Bangkok (UTC+7) - more reliable than LoadLocation
	loc := time.FixedZone("Asia/Bangkok", 7*60*60)

	parsedDate, err := time.ParseInLocation("2006-01-02", dateParam, loc)
	if err != nil {
		log.Printf("[ERROR][GetMirrorByDate] Invalid date format: date=%s error=%v", dateParam, err)
		util.HandleError(c, http.StatusBadRequest, "รูปแบบวันที่ไม่ถูกต้อง (ต้องใช้ YYYY-MM-DD)", "INVALID_DATE")
		return
	}

	// Calculate date range for database query
	startOfDay := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 0, 0, 0, 0, loc)
	endOfDay := startOfDay.AddDate(0, 0, 1)

	// Check if requested date is today
	nowTH := time.Now().In(loc)
	isToday := isSameDay(nowTH, parsedDate)

	// Query database for mirror entry
	var mirror entity.Mirror
	err = config.DB().
		Where("uid = ? AND date >= ? AND date < ?", userID, startOfDay, endOfDay).
		First(&mirror).
		Error

	if err != nil {
		handleMirrorQueryError(c, err, isToday, userID, dateParam, startOfDay, endOfDay)
		return
	}

	// Success: return mirror data
	log.Printf("[INFO][GetMirrorByDate] Mirror found: userID=%v date=%s", userID, dateParam)
	c.JSON(http.StatusOK, mirror)
}

// isSameDay checks if two times represent the same calendar day
func isSameDay(t1, t2 time.Time) bool {
	return t1.Year() == t2.Year() &&
		t1.Month() == t2.Month() &&
		t1.Day() == t2.Day()
}

// handleMirrorQueryError processes database query errors appropriately
func handleMirrorQueryError(c *gin.Context, err error, isToday bool, userID interface{}, dateParam string, startOfDay, endOfDay time.Time) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		if isToday {
			// Today but no entry yet - not an error state
			log.Printf("[INFO][GetMirrorByDate] No mirror entry for today: userID=%v date=%s", userID, dateParam)
			c.Header("X-Mirror-Empty-Today", "1")
			c.Status(http.StatusNoContent)
			return
		}
		// Past date with no entry - return 404
		log.Printf("[WARN][GetMirrorByDate] Mirror not found for past date: userID=%v date=%s", userID, dateParam)
		util.HandleError(c, http.StatusNotFound, "ไม่พบบันทึกในวันที่เลือก", "MIRROR_NOT_FOUND")
		return
	}

	// Unexpected database error - log and return 500
	log.Printf("[ERROR][GetMirrorByDate] Database error: userID=%v date=%s start=%v end=%v error=%v",
		userID, dateParam, startOfDay, endOfDay, err)
	util.HandleError(c, http.StatusInternalServerError, "เกิดข้อผิดพลาดในการดึงข้อมูล", "FETCH_FAILED")
}
// end

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
		if errors.Is(err, gorm.ErrRecordNotFound) {
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
