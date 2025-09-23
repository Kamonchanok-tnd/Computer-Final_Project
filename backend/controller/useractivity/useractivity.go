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
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	// สร้าง record ใน DB
	activity := entity.UserActivity{
		UID:    payload.UID,
		Action: payload.Action,
		Page:   payload.Page,
	}

	if err := config.DB().Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกกิจกรรมผู้ใช้ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "บันทึกกิจกรรมผู้ใช้เรียบร้อยแล้ว"})
}

// GetVisitFrequency คืนข้อมูลจำนวนครั้งที่ผู้ใช้เข้าชมในแต่ละวัน
func GetVisitFrequency(c *gin.Context) {
	var results []struct {
		Date   string `json:"date"`
		Visits int    `json:"visits"`
	}

	if err := config.DB().
		Model(&entity.UserActivity{}).
		Select("DATE(created_at) as date, COUNT(*) as visits").
		Where("action = ?", "visit_page_first").
		Group("DATE(created_at)").
		Order("DATE(created_at) ASC").
		Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลจำนวนการเข้าชมได้"})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetNewuser คืนจำนวนผู้ใช้ที่สมัครใหม่ในแต่ละวัน
func GetNewuser(c *gin.Context) {
	var results []struct {
		Date   string `json:"date"`
		Visits int    `json:"visits"`
	}

	if err := config.DB().
		Model(&entity.UserActivity{}).
		Select("DATE(created_at) as date, COUNT(*) as visits").
		Where("action = ?", "create_account").
		Group("DATE(created_at)").
		Order("DATE(created_at) ASC").
		Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ใหม่ได้"})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetReturningUsers คืนจำนวนผู้ใช้ที่กลับมาใช้งานอีกครั้ง
func GetReturningUsers(c *gin.Context) {
    var results []struct {
        Date  string `json:"date"`
        Users int    `json:"users"`
    }

    if err := config.DB().
        Model(&entity.UserActivity{}).
        Select("DATE(created_at) as date, COUNT(DISTINCT uid) as users").
        Where("action = ?", "login").
        Where("uid NOT IN (?)",
            config.DB().Model(&entity.UserActivity{}).
                Select("uid").
                Where("action = ?", "create_account").
                Where("DATE(created_at) = DATE(user_activities.created_at)"),
        ).
        Group("DATE(created_at)").
        Order("DATE(created_at) ASC").
        Scan(&results).Error; err != nil {

        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ที่กลับมาใช้งานได้"})
        return
    }

    c.JSON(http.StatusOK, results)
}

// GetRetentionRate คืนค่า % ของผู้ใช้ที่กลับมาใช้งาน
func GetRetentionRate(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลวันที่ได้"})
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

		// จำนวนผู้ใช้ที่เคยใช้แล้วกลับมา
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
