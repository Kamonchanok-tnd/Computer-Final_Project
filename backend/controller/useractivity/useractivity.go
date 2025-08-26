package useractivity

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"sukjai_project/config"
   "sukjai_project/entity"
)

// LogActivity บันทึกการเข้าใช้งานของผู้ใช้
func LogActivity(c *gin.Context) {
	// รับข้อมูลจาก body
	var payload struct {
		UID    uint   `json:"uid"`    // user ID
		Action string `json:"action"` // เช่น "login", "visit_page"
		Page   string `json:"page"`   // หน้าเว็บ เช่น "/home"
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง record ใน DB
	activity := entity.UserActivity{
		UID:    payload.UID,
		Action: payload.Action,
		Page:   payload.Page,
	}

	if err := config.DB().Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Activity logged successfully"})
}




// GetVisitFrequency คืนข้อมูลจำนวนครั้งที่ผู้ใช้เข้าชมในแต่ละวัน
func GetVisitFrequency(c *gin.Context) {
	var results []struct {
		Date   string `json:"date"`
		Visits int    `json:"visits"`
	}

	// ตัวอย่าง query: group by วันที่
	if err := config.DB().
		Model(&entity.UserActivity{}).
		Select("DATE(created_at) as date, COUNT(*) as visits").
		Where("action = ?", "visit_page").
		Group("DATE(created_at)").
		Order("DATE(created_at) ASC").
		Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get visit frequency"})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetRetentionRate คืนค่า % ของผู้ใช้ที่กลับมาใช้งาน
func GetRetentionRate(c *gin.Context) {
	// สมมติว่าเราจะคำนวณ retention rate ต่อวัน
	// retention = จำนวนผู้ใช้ที่เคยใช้งานแล้วกลับมาภายใน 7 วัน / จำนวนผู้ใช้ทั้งหมดในวันนั้น * 100

	type Result struct {
		Date          string  `json:"date"`
		RetentionRate float64 `json:"retentionRate"`
	}

	var results []Result

	// ดึงวันที่มี activity
	var dates []time.Time
	if err := config.DB().
		Model(&entity.UserActivity{}).
		Select("DATE(created_at) as date").
		Where("action = ?", "visit_page").
		Group("DATE(created_at)").
		Order("DATE(created_at) ASC").
		Pluck("DATE(created_at)", &dates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get dates"})
		return
	}

	for _, d := range dates {
		var totalUsers int64
		var returningUsers int64

		// จำนวนผู้ใช้ทั้งหมดในวันนั้น
		config.DB().
			Model(&entity.UserActivity{}).
			Where("DATE(created_at) = ?", d.Format("2006-01-02")).
			Distinct("uid").
			Count(&totalUsers)

		// จำนวนผู้ใช้ที่เคยใช้แล้วกลับมา (ก่อนหน้านั้นเคยมี activity)
		config.DB().
			Model(&entity.UserActivity{}).
			Where("DATE(created_at) = ?", d.Format("2006-01-02")).
			Where("uid IN (?)",
				config.DB().
					Model(&entity.UserActivity{}).
					Select("uid").
					Where("DATE(created_at) < ?", d.Format("2006-01-02")),
			).
			Distinct("uid").
			Count(&returningUsers)

		rate := 0.0
		if totalUsers > 0 {
			rate = float64(returningUsers) / float64(totalUsers) * 100
		}

		results = append(results, Result{
			Date:          d.Format("2006-01-02"),
			RetentionRate: rate,
		})
	}

	c.JSON(http.StatusOK, results)
}

