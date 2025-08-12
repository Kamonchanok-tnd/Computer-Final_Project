package reviewsound

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

func CreateReview(c *gin.Context) {
	var review entity.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	if err := db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
		return
	}

	var avgScore float64
	if err := db.
		Table("reviews").
		Where("s_id = ?", review.SID).
		Select("AVG(point)").
		Scan(&avgScore).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate average score"})
		return
	}


	if err := db.Model(&entity.Sound{}).
		Where("id = ?", review.SID).
		Update("score", avgScore).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update sound score"})
		return
	}

	c.JSON(http.StatusOK, review)
}
