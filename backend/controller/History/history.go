package history

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

func CreateHistory(c *gin.Context) {
	var history entity.History
	if err := c.ShouldBindJSON(&history); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	if err := db.Create(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create history"})
		return
	}

	c.JSON(http.StatusOK, history)
}