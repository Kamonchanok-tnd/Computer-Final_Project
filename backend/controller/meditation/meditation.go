package meditation

import (
	"fmt"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity" // เพิ่มการนำเข้า package ของ entity
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetSoundTypes(c *gin.Context) {
	db := config.DB()

	var soundTypes []entity.SoundType
	if err := db.Find(&soundTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงประเภทเสียงได้"})
		return
	}

	c.JSON(http.StatusOK, soundTypes)
}

// ฟังก์ชันดึงข้อมูล Sound ที่มีประเภทเป็น "สมาธิ"
func GetMeditationSounds(c *gin.Context) {
	// ดึงการเชื่อมต่อฐานข้อมูลจาก config
	db := config.DB()
	
	// ตรวจสอบว่า db เชื่อมต่อแล้วหรือไม่
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is not established"})
		return
	}

	// ค้นหา "สมาธิ" ในตาราง SoundType
	var meditationType entity.SoundType
	if err := db.Where("type = ?", "สมาธิ").First(&meditationType).Error; err != nil {
		// ถ้าไม่พบประเภทเสียงสมาธิ
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Meditation type not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error searching for meditation type: %v", err)})
		}
		return
	}

	// ค้นหาข้อมูลเสียงที่มี STID เท่ากับ ID ของ "สมาธิ"
	var sounds []entity.Sound
	if err := db.Where("st_id = ?", meditationType.ID).Find(&sounds).Error; err != nil {
		// ถ้าไม่พบเสียง
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error fetching sounds: %v", err)})
		return
	}

	// ถ้าไม่พบเสียง
	if len(sounds) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No sounds found for the meditation type"})
		return
	}

	// ส่งข้อมูลเสียงกลับในรูปแบบ JSON
	c.JSON(http.StatusOK, gin.H{
		"sounds": sounds, // ส่งคืนรายการเสียง
	})
}

// ฟังก์ชันสำหรับสร้างวิดีโอใหม่ (เพิ่มข้อมูลเสียงใหม่)
func CreateVideo(c *gin.Context) {
	db := config.DB()

	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection is not established"})
		return
	}

	var newSound entity.Sound
	if err := c.ShouldBindJSON(&newSound); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// สร้างข้อมูลในฐานข้อมูล
	if err := db.Create(&newSound).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create sound: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Sound created successfully",
		"sound":   newSound,
	})
}
