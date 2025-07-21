package questionnaire

import (
	"fmt"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"time"
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


// ✅ ฟังก์ชันสำหรับลบคำถามและคำตอบ พร้อมอัปเดตจำนวนข้อ
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	tx := db.Begin()

	fmt.Println("➡️ เริ่มลบคำถามแบบ Soft Delete พร้อมคำตอบ และอัปเดตจำนวนข้อ")

	var question entity.Question
	// ค้นหาคำถาม
	if err := tx.First(&question, id).Error; err != nil {
		fmt.Println("❌ ไม่พบคำถาม:", err)
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำถาม"})
		return
	}

	// 1. ลบคำตอบทั้งหมดของคำถามนี้ (Soft Delete)
	if err := tx.Where("q_id = ?", id).Delete(&entity.AnswerOption{}).Error; err != nil {
		fmt.Println("❌ ลบคำตอบไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำตอบไม่สำเร็จ"})
		return
	}

	// 2. ลบคำถามนี้ (Soft Delete)
	if err := tx.Delete(&question).Error; err != nil {
		fmt.Println("❌ ลบคำถามไม่สำเร็จ:", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบคำถามไม่สำเร็จ"})
		return
	}

	// 3. อัปเดตจำนวนคำถามในแบบทดสอบ (ลดจำนวนข้อ -1)
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




// ✅ ฟังก์ชันลบคำตอบจากคำถาม (Soft Delete)
func DeleteAnswer(c *gin.Context) {
    answerId := c.Param("id")
    var answer entity.AnswerOption

    // เชื่อมต่อกับฐานข้อมูล
    db := config.DB()

    // ค้นหาคำตอบในฐานข้อมูล
    if err := db.First(&answer, answerId).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบคำตอบ"})
        return
    }

    // ทำ Soft Delete (อัปเดต DeletedAt แทนการลบจริง)
    if err := db.Model(&answer).Update("DeletedAt", time.Now()).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถทำการลบคำตอบได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "ลบคำตอบสำเร็จ (Soft Delete)"})
}
