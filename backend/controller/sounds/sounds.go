package sounds

import (
	"net/http"
	"strconv"

	"sukjai_project/config" // import config เพื่อเรียก db
	
	"sukjai_project/entity" // import entity ของโปรเจค

	"github.com/gin-gonic/gin"
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

type SoundWithTypeName struct {
	ID            uint    `json:"id"`
	Name          string  `json:"name"`
	Sound         string  `json:"sound"`
	Lyric         string  `json:"lyric"`
	Owner         string  `json:"owner"`
	Description   string  `json:"description"`
	Duration      float64 `json:"duration"`
	LikeSound     uint    `json:"like_sound"`
	View          uint    `json:"view"`
	STID          uint    `json:"stid"`
	UID           uint    `json:"uid"`
	SoundTypeName string  `json:"sound_type_name"`
}

func GetAllSounds(c *gin.Context) {
	db := config.DB()

	var sounds []SoundWithTypeName

	err := db.Table("sounds").
		Select("sounds.id, sounds.name, sounds.sound, sounds.lyric, sounds.owner,sounds.description, sounds.duration, sounds.like_sound, sounds.view, sounds.st_id, sounds.uid, sounds.owner, sounds.description, sounds.duration, sounds.like_sound, sounds.view, sounds.st_id, sounds.uid, sound_types.type as sound_type_name").
		Joins("left join sound_types on sound_types.id = sounds.st_id").Where("sounds.deleted_at IS NULL").
		Scan(&sounds).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get sounds"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sounds": sounds})
}

func EditSound(c *gin.Context) {//เอาไว้สิ้นสุด ห้อง chat
	var sound entity.Sound
	id := c.Param("id")
	db := config.DB()
    result := db.First(&sound, id)
   if result.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
       return
   }

   if err := c.ShouldBindJSON(&sound); err != nil {
	   c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	   return
   }
   
  
   result = db.Save(&sound)
   if result.Error != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "Updated successful","data":sound})
    
}

func DeleteSoundByID(c *gin.Context) {//เอาไว้สิ้นสุด ห้อง chat
	var sound entity.Sound
	id := c.Param("id")
	db := config.DB()
	result := db.Where("id = ?", id).First(&sound)
   if result.Error != nil {
	   c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
	   return
   }
   
   result = db.Delete(&sound)
   if result.Error != nil {
	   c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
	   return
   }
   c.JSON(http.StatusOK, gin.H{"message": "Deleted successful","data":sound})
}

func GetSoundByID(c *gin.Context) {//เอาไว้สิ้นสุด ห้อง chat
	var sound entity.Sound
	id := c.Param("id")
	db := config.DB()
	result := db.Where("id = ?", id).First(&sound)
   if result.Error != nil {
	   c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
	   return
   }
   
   c.JSON(http.StatusOK, gin.H{"message": "Get successful","data":sound})
}