package questionnaire

import (
	"strconv"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	
)

// ✅ ฟังก์ชันสำหรับอัพเดตลบเเบบทดสอบ 
func UpdateQuestionnaire(c *gin.Context) {
	// รับ ID จาก path
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ไม่ถูกต้อง"})
		return
	}

	// ค้นหาแบบทดสอบเดิมใน DB
	var questionnaire entity.Questionnaire
	db := config.DB()
	if err := db.First(&questionnaire, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบแบบทดสอบ"})
		return
	}

	// รับค่าจาก frontend
	var input struct {
		NameQuestionnaire string `json:"nameQuestionnaire"`
		Description       string `json:"description"`
		Quantity          int    `json:"quantity"` 
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// อัปเดตข้อมูล
	questionnaire.NameQuestionnaire = input.NameQuestionnaire
	questionnaire.Description = input.Description
	questionnaire.Quantity = input.Quantity   

	if err := db.Save(&questionnaire).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถบันทึกการแก้ไขได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "แก้ไขแบบทดสอบเรียบร้อยแล้ว",
		"questionnaire":  questionnaire,
	})
}



// ✅ ฟังก์ชันสำหรับอัพเดตคำถาม 
func UpdateQuestion(c *gin.Context) {
	id := c.Param("id")

	var question entity.Question
	db := config.DB()

	// ตรวจสอบว่าคำถามมีอยู่จริงไหม
	if err := db.First(&question, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำถาม"})
		return
	}

	// รับค่า nameQuestion อย่างเดียว
	var input struct {
		NameQuestion string `json:"nameQuestion"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// อัปเดตชื่อคำถาม
	question.NameQuestion = input.NameQuestion
	if err := db.Save(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถอัปเดตชื่อคำถามได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขคำถามเรียบร้อยแล้ว", "question": question})
}
