package history

import (
	"errors"
	"net/http"

	"sukjai_project/config"
	
	"sukjai_project/entity"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateHistory(c *gin.Context) {
	db := config.DB()

    var history entity.History
	if err := c.ShouldBindJSON(&history); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

    var lastHistory entity.History
    fiveMinutesAgo := time.Now().Add(-5 * time.Minute)

    // ตรวจสอบประวัติล่าสุด
    if err := db.Where("uid = ? AND s_id = ?", history.UID, history.SID).
        Order("created_at desc").
        First(&lastHistory).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check last history"})
        return
    }

    // ถ้ายังไม่มี history หรือเกิน 5 นาที -> insert
    if lastHistory.ID == 0 || lastHistory.CreatedAt.Before(fiveMinutesAgo) {
        // newHistory := entity.History{
        //     UID: uint(history.UID),
        //     SID: uint(history.SID),
        // }
        if err := db.Create(&history).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create history"})
            return
        }
        c.JSON(http.StatusOK, gin.H{"message": "History added"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "History skipped (within 5 min)"})
}