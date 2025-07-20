package breathing

import (
	"fmt"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity" // เพิ่มการนำเข้า package ของ entity
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)


func GetBreathingSounds(c *gin.Context) {
	// ดึงการเชื่อมต่อฐานข้อมูลจาก config
	db := config.DB()
	
	// ตรวจสอบว่า db เชื่อมต่อแล้วหรือไม่
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is not established"})
		return
	}

	// ค้นหา "สมาธิ" ในตาราง SoundType
	var breathingType entity.SoundType
	if err := db.Where("type = ?", "ฝึกหายใจ").First(&breathingType).Error; err != nil {
		// ถ้าไม่พบประเภทเสียงสมาธิ
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "breathing type not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error searching for breathing type: %v", err)})
		}
		return
	}

	// ค้นหาข้อมูลเสียงที่มี STID เท่ากับ ID ของ "สมาธิ"
	var sounds []entity.Sound
	if err := db.Where("st_id = ?", breathingType.ID).Find(&sounds).Error; err != nil {
		// ถ้าไม่พบเสียง
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error fetching sounds: %v", err)})
		return
	}

	// ถ้าไม่พบเสียง
	if len(sounds) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No sounds found for the breathing type"})
		return
	}

	// ส่งข้อมูลเสียงกลับในรูปแบบ JSON
	c.JSON(http.StatusOK, gin.H{
		"sounds": sounds, // ส่งคืนรายการเสียง
	})
}