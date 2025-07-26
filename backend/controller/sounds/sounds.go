package sounds

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"sukjai_project/config"  // import config เพื่อเรียก db
	"sukjai_project/entity"  // import entity ของโปรเจค
)

// ฟังก์ชันดึงเพลงตามประเภท SoundType ID
func GetSoundsByType(c *gin.Context) {
	db := config.DB()

	typeIDStr := c.Param("typeID")
	typeID, err := strconv.ParseUint(typeIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type ID"})
		return
	}

	var sounds []entity.Sound
	if err := db.Preload("SoundType").Where("st_id = ?", uint(typeID)).Find(&sounds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sounds"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sounds": sounds})
}
