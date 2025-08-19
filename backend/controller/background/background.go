package background

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

func GetBackground(c *gin.Context) {
	db := config.DB()
	var background []entity.Background

	result := db.Find(&background)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get background"})
		return
	}

	c.JSON(http.StatusOK, background)
}
