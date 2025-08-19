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

func UpdateReview(c *gin.Context) {
	var input entity.Review
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	var existingReview entity.Review
	if err := db.Where("uid = ? AND s_id = ?", input.UID, input.SID).
		Order("id DESC").
		First(&existingReview).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}
	existingReview.Point = input.Point

	if err := db.Save(&existingReview).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update review"})
		return
	}

	var avgScore float64
	if err := db.
		Table("reviews").
		Where("s_id = ?", input.SID).
		Select("AVG(point)").
		Scan(&avgScore).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate average score"})
		return
	}


	if err := db.Model(&entity.Sound{}).
		Where("id = ?", input.SID).
		Update("score", avgScore).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update sound score"})
		return
	}

	c.JSON(http.StatusOK, existingReview)
}

func CheckReview(c *gin.Context) {
	var review entity.Review
	uid := c.Param("uid")
	sid := c.Param("sid")
	db := config.DB()
	if err := db.Where("uid = ? AND s_id = ?", uid, sid).
	Order("id DESC").
	First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"exists": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
        "exists": true,
        "point":  review.Point,
    })
}