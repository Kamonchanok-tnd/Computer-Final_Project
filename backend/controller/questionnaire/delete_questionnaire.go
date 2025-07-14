package questionnaire

import (
	"fmt"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm" 
)

// ✅ ฟังก์ชันสำหรับลบเเบบทดสอบ คำถามเเละคำตอบ
func DeleteQuestionnaire(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	tx := db.Begin()

	fmt.Println("➡️ เริ่มลบแบบทดสอบ (Soft Delete) ID:", id)

	// 1. Soft delete คำตอบ (AnswerOption) ที่ผูกกับคำถามในแบบทดสอบนี้
	if err := tx.Where(`
		q_id IN (
			SELECT id FROM questions WHERE qu_id = ?
		)
	`, id).Delete(&entity.AnswerOption{}).Error; err != nil {
		fmt.Println("❌ ลบคำตอบไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำตอบไม่สำเร็จ"})
		return
	}

	// 2. Soft delete คำถาม (Question)
	if err := tx.Where("qu_id = ?", id).Delete(&entity.Question{}).Error; err != nil {
		fmt.Println("❌ ลบคำถามไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำถามไม่สำเร็จ"})
		return
	}

	// 3. Soft delete แบบทดสอบ (Questionnaire)
	if err := tx.Where("id = ?", id).Delete(&entity.Questionnaire{}).Error; err != nil {
		fmt.Println("❌ ลบแบบทดสอบไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบแบบทดสอบไม่สำเร็จ"})
		return
	}

	tx.Commit()
	fmt.Println("✅ ลบแบบทดสอบแบบ Soft Delete สำเร็จ ID:", id)
	c.JSON(http.StatusOK, gin.H{"message": "ลบแบบทดสอบสำเร็จ (Soft Delete)"})
}




// ✅ ฟังก์ชันสำหรับลบคำถามเเละคำตอบ พร้อมอัพเดตค่าจำนวนข้อ
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	tx := db.Begin()

	fmt.Println("➡️ เริ่มลบคำถามแบบ Soft Delete พร้อมคำตอบ และอัปเดตจำนวนข้อ")

	var question entity.Question
	if err := tx.First(&question, id).Error; err != nil {
		fmt.Println("❌ ไม่พบคำถาม:", err)
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำถาม"})
		return
	}

	// 1. ลบ (Soft Delete) คำตอบทั้งหมดของคำถามนี้
	if err := tx.Where("q_id = ?", id).Delete(&entity.AnswerOption{}).Error; err != nil {
		fmt.Println("❌ ลบคำตอบไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำตอบไม่สำเร็จ"})
		return
	}

	// 2. ลบ (Soft Delete) คำถามนี้
	if err := tx.Delete(&question).Error; err != nil {
		fmt.Println("❌ ลบคำถามไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำถามไม่สำเร็จ"})
		return
	}

	// 3. อัปเดตจำนวนคำถามในแบบทดสอบ (Quantity - 1)
	if err := tx.Model(&entity.Questionnaire{}).
		Where("id = ?", question.QuID).
		UpdateColumn("quantity", gorm.Expr("quantity - ?", 1)).Error; err != nil {
		fmt.Println("❌ อัปเดตจำนวนคำถามไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตจำนวนคำถามไม่สำเร็จ"})
		return
	}

	tx.Commit()
	fmt.Println("✅ ลบคำถาม (Soft Delete) และอัปเดตจำนวนข้อเรียบร้อย ID:", id)
	c.JSON(http.StatusOK, gin.H{"message": "ลบคำถามเรียบร้อยแล้ว"})
}
