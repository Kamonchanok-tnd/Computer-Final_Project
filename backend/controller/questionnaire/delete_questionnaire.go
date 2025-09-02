package questionnaire

import (
	"fmt"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"

)

// ฟังก์ชันสำหรับลบเเบบทดสอบ คำถาม คำตอบ เเละ Criteria พร้อม Calculation
func DeleteQuestionnaire(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	tx := db.Begin()

	fmt.Println("เริ่มลบแบบทดสอบ (Soft Delete) ID:", id)

	
	// 1. Soft Delete Criteria ก่อน
	if err := tx.Where("id IN (?)", tx.Model(&entity.Calculation{}).Select("c_id").Where("qu_id = ?", id)).Delete(&entity.Criteria{}).Error; err != nil {
		fmt.Println("Soft Delete Criteria ไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Soft Delete Criteria ไม่สำเร็จ"})
		return
	}

	// 2. Soft Delete Calculation
	if err := tx.Where("qu_id = ?", id).Delete(&entity.Calculation{}).Error; err != nil {
		fmt.Println("Soft Delete Calculation ไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Soft Delete Calculation ไม่สำเร็จ"})
		return
}


	// 3. Soft Delete คำตอบ (AnswerOption) ที่ผูกกับคำถามในแบบทดสอบนี้
	if err := tx.Where(`
		q_id IN (
			SELECT id FROM questions WHERE qu_id = ?
		)
	`, id).Delete(&entity.AnswerOption{}).Error; err != nil {
		fmt.Println("Soft Delete ลบคำตอบไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำตอบไม่สำเร็จ"})
		return
	}

	// 4. Soft Delete คำถาม (Question)
	if err := tx.Where("qu_id = ?", id).Delete(&entity.Question{}).Error; err != nil {
		fmt.Println("Soft Delete ลบคำถามไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำถามไม่สำเร็จ"})
		return
	}

	// 5. Soft Delete แบบทดสอบ (Questionnaire)
	if err := tx.Where("id = ?", id).Delete(&entity.Questionnaire{}).Error; err != nil {
		fmt.Println("Soft Delete ลบแบบทดสอบไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบแบบทดสอบไม่สำเร็จ"})
		return
	}

	tx.Commit()
	fmt.Println("ลบแบบทดสอบแบบ Soft Delete สำเร็จ ID:", id)
	c.JSON(http.StatusOK, gin.H{"message": "ลบแบบทดสอบสำเร็จ (Soft Delete)"})
}

