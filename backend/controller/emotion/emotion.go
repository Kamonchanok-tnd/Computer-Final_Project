package emotion

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

// GET /emotions
// ดึงรายการอิโมจิ/อารมณ์ทั้งหมด
func GetEmotions(c *gin.Context) {
	var emotions []entity.Emotion
	if err := config.DB().Order("id ASC").Find(&emotions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to fetch emotions",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, emotions)
}

// GET /emotions/:id
// ดึงอิโมจิ/อารมณ์ตาม ID
func GetEmotionByID(c *gin.Context) {
	id := c.Param("id")
	var emotion entity.Emotion
	if err := config.DB().First(&emotion, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "emotion not found",
		})
		return
	}
	c.JSON(http.StatusOK, emotion)
}
