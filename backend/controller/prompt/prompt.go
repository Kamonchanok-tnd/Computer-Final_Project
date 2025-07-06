package prompt

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
)

func CreatePrompt(c *gin.Context) {
	var prompt entity.Prompt
	if err := c.ShouldBindJSON(&prompt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	if err := db.Create(&prompt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save prompt"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prompt created successfully"})
}

func GetAllPrompts(c *gin.Context) {
	var prompts []entity.Prompt

	if err := config.DB().Find(&prompts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, prompts)
}