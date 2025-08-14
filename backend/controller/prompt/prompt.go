package prompt

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
)

func CreatePrompt(c *gin.Context) {
	var prompt entity.Prompt
	if err := c.ShouldBindJSON(&prompt); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}

	if err := config.DB().Create(&prompt).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถบันทึก Prompt ได้", "CREATE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prompt created successfully"})
}

func GetAllPrompts(c *gin.Context) {
	var prompts []entity.Prompt
	if err := config.DB().Find(&prompts).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึงข้อมูลได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, prompts)
}

func GetPromptByID(c *gin.Context) {
	id := c.Param("id")
	var prompt entity.Prompt

	if err := config.DB().Where("id = ?", id).First(&prompt).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Prompt", "PROMPT_NOT_FOUND")
		return
	}

	c.JSON(http.StatusOK, prompt)
}

func DeletePrompt(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB().Where("id = ?", id).Delete(&entity.Prompt{}).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถลบ Prompt ได้", "DELETE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prompt deleted successfully"})
}

func UpdatePrompt(c *gin.Context) {
	id := c.Param("id")
	var prompt entity.Prompt

	if err := c.ShouldBindJSON(&prompt); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}

	if err := config.DB().Model(&entity.Prompt{}).Where("id = ?", id).Updates(prompt).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถอัปเดต Prompt ได้", "UPDATE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prompt updated successfully"})
}

func NowPrompt(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if err := db.Model(&entity.Prompt{}).Where("is_using = ?", true).Update("is_using", false).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถล้างสถานะ prompt เดิม", "CLEAR_USING_FAILED")
		return
	}

	if err := db.Model(&entity.Prompt{}).Where("id = ?", id).Update("is_using", true).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถใช้งาน prompt นี้ได้", "USE_PROMPT_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "✅ Prompt is now in use"})
}
