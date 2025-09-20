package breathing

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetBreathingSounds(c *gin.Context) {
	// ดึงการเชื่อมต่อฐานข้อมูลจาก config
	db := config.DB()
	
	// ตรวจสอบว่า db เชื่อมต่อแล้วหรือไม่
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"})
		return
	}

	// ค้นหา "ฝึกหายใจ" ในตาราง SoundType
	var breathingType entity.SoundType
	if err := db.Where("type = ?", "ฝึกหายใจ").First(&breathingType).Error; err != nil {
		// ถ้าไม่พบประเภทเสียง
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประเภทเสียงสำหรับการฝึกหายใจ"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการค้นหาประเภทเสียงสำหรับการฝึกหายใจ"})
		}
		return
	}

	// ค้นหาข้อมูลเสียงที่มี STID เท่ากับ ID ของ "ฝึกหายใจ"
	var sounds []entity.Sound
	if err := db.Where("st_id = ?", breathingType.ID).Find(&sounds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลเสียง"})
		return
	}

	// ถ้าไม่พบเสียง
	if len(sounds) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเสียงสำหรับการฝึกหายใจ"})
		return
	}

	// ส่งข้อมูลเสียงกลับในรูปแบบ JSON
	c.JSON(http.StatusOK, gin.H{
		"sounds": sounds, // ส่งคืนรายการเสียง
	})
}
