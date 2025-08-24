package sounds

import (
	"net/http"
	"strconv"

	"sukjai_project/config" // import config เพื่อเรียก db
	
	"sukjai_project/entity" // import entity ของโปรเจค
	"gorm.io/gorm"
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
	ID            uint    `json:"ID"`
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
		Select(`sounds.id, sounds.name, sounds.sound, sounds.lyric, sounds.owner, 
		        sounds.description, sounds.duration, sounds.like_sound, sounds.view, 
		        sounds.st_id, sounds.uid, sound_types.type as sound_type_name`).
		Joins("LEFT JOIN sound_types ON sound_types.id = sounds.st_id").
		Where("sounds.deleted_at IS NULL").
		Order("sounds.created_at DESC"). // 👈 เรียงข้อมูลจากใหม่ไปเก่า
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

// ✅ เพิ่มจำนวน like ของเสียง
func LikeSound(c *gin.Context) {
    db := config.DB()

    soundID := c.Param("id")
    uid := c.Query("uid")

    var sound entity.Sound
    if err := db.First(&sound, soundID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Sound not found"})
        return
    }

    // ✅ เช็คว่า user เคยกดหัวใจเพลงนี้หรือยัง
    var like entity.Like
    err := db.Where("uid = ? AND s_id = ?", uid, soundID).First(&like).Error

    if err == nil {
        // ✅ เคยกดแล้ว → ยกเลิก Like
        if err := db.Delete(&like).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike"})
            return
        }

        // ✅ ลดจำนวน Like ทีละ 1 ถ้ามากกว่า 0
        if sound.LikeSound > 0 {
            sound.LikeSound -= 1
            db.Model(&sound).Update("like_sound", sound.LikeSound)
        }

        c.JSON(http.StatusOK, gin.H{
            "message":    "Unliked",
            "like_count": sound.LikeSound,
            "liked":      false,
        })
        return
    }

    // ✅ ยังไม่เคยกด → เพิ่ม Like
    newLike := entity.Like{
        UID: parseUint(uid),
        SID: parseUint(soundID),
    }
    if err := db.Create(&newLike).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like"})
        return
    }

    sound.LikeSound += 1
    db.Model(&sound).Update("like_sound", sound.LikeSound)

    c.JSON(http.StatusOK, gin.H{
        "message":    "Liked",
        "like_count": sound.LikeSound,
        "liked":      true,
    })
}

// ✅ ฟังก์ชันช่วยแปลง string → uint (ต้องอยู่นอก LikeSound)
func parseUint(str string) uint {
    v, _ := strconv.ParseUint(str, 10, 64)
    return uint(v)
}



// ✅ เช็คว่า user เคยกดหัวใจเสียงนี้หรือไม่
func CheckLikedSound(c *gin.Context) {
    db := config.DB()

    // ✅ รับ soundID จาก param
    soundIDStr := c.Param("id")
    soundID, err := strconv.ParseUint(soundIDStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sound ID"})
        return
    }

    // ✅ รับ uid จาก query
    uidStr := c.Query("uid")
    uid, err := strconv.ParseUint(uidStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UID"})
        return
    }

    // ✅ เช็คในตาราง Like
    var like entity.Like
    if err := db.Where("uid = ? AND s_id = ?", uid, soundID).First(&like).Error; err != nil {
        if err.Error() == "record not found" {
            c.JSON(http.StatusOK, gin.H{"isLiked": false})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"isLiked": true})
}

// ✅ เพิ่มจำนวน view ของเสียง
func AddSoundView(c *gin.Context) {
    db := config.DB()

    soundID := c.Param("id")
    

    // ✅ อัปเดตค่า view + 1 โดยตรง ป้องกัน race condition
    if err := db.Model(&entity.Sound{}).
        Where("id = ?", soundID).
        UpdateColumn("view", gorm.Expr("view + ?", 1)).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update view"})
        return
    }

    // ✅ ดึงค่าล่าสุดกลับไปให้ frontend
    var sound entity.Sound
    if err := db.First(&sound, soundID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Sound not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "View updated",
        "view":    sound.View,
    })
}

func AddSoundViewBlock(c *gin.Context) {
    db := config.DB()

    soundIDParam := c.Param("id")
    uidParam := c.Param("uid")

    soundID, err := strconv.Atoi(soundIDParam)
   
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sound ID"})
        return
    }

    uid, err := strconv.Atoi(uidParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    // ตรวจสอบว่าผู้ใช้เคย view แล้วหรือยัง
    var historyCount int64
    if err := db.Model(&entity.History{}).
        Where("uid = ? AND s_id = ?", uid, soundID).
        Count(&historyCount).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check history"})
        return
    }

    if historyCount == 0 {
        // บวก View ครั้งเดียว
        if err := db.Model(&entity.Sound{}).
            Where("id = ?", soundID).
            UpdateColumn("view", gorm.Expr("view + ?", 1)).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update view"})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{"message": "View counted"})
}

