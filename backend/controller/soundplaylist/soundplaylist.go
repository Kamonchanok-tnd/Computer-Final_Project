package soundplaylist

import (
	"errors"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateSoundPlaylist(c *gin.Context) {
	db := config.DB()

	var soundPlaylist entity.SoundPlaylist
	if err := c.ShouldBindJSON(&soundPlaylist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	
	var existing entity.SoundPlaylist
	if err := db.Where("p_id = ? AND s_id = ?", soundPlaylist.PID, soundPlaylist.SID).First(&existing).Error; err == nil {
		// มีข้อมูลอยู่แล้ว
		c.JSON(http.StatusConflict, gin.H{"error": "เสียงนี้ถูกเพิ่มในเพลย์ลิสต์แล้ว"})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		// ถ้า error อื่น ๆ (ไม่ใช่ not found)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดขณะตรวจสอบข้อมูล"})
		return
	}

	
	if err := db.Create(&soundPlaylist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเพิ่มเสียงในเพลย์ลิสต์ได้"})
		return
	}

	c.JSON(http.StatusOK, soundPlaylist)
}


type SoundPlaylistWithSound struct {
	entity.SoundPlaylist
	Name string `json:"name"`
	SoundURL  string `json:"sound"`
	Owner string `json:"owner"`
	Duration float64 `json:"duration"`
	View uint `json:"view"`
	LikeSound uint `json:"like_sound"`
}
func GetSoundPlaylistByPID(c *gin.Context) {
	id := c.Param("pid")
	db := config.DB()
	var soundPlaylist []SoundPlaylistWithSound
	err := db.Table("sound_playlists").
		Select("sound_playlists.id, sound_playlists.s_id, sound_playlists.p_id, sounds.name, sounds.sound as sound_url, sounds.owner, sounds.duration,sounds.view,sounds.like_sound").
		Joins("LEFT JOIN sounds ON sound_playlists.s_id = sounds.id").
		Where("sound_playlists.p_id = ? AND sound_playlists.deleted_at IS NULL", id).
		Scan(&soundPlaylist).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get sound playlist"})
		return
	}
	c.JSON(http.StatusOK, soundPlaylist)

}

func DeleteSoundPlaylistByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	var soundPlaylist entity.SoundPlaylist
	result := db.Where("id = ?", id).First(&soundPlaylist)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "sound playlist not found"})
		return
	}
	result = db.Delete(&soundPlaylist)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete sound playlist"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "sound playlist deleted successfully"})
}

func GetTopSoundPlaylistByPID(c *gin.Context) {
    pid := c.Param("pid")
    if pid == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "pid parameter is required"})
        return
    }

    db := config.DB()
    var soundPlaylist entity.SoundPlaylist

    err := db.Where("p_id = ?", pid).Order("id desc").First(&soundPlaylist).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            // กรณีไม่พบข้อมูล
            c.JSON(http.StatusOK, gin.H{"message": "ไม่มี vdo ใน playlist นี้"})
            return
        }
        // กรณี error อื่นๆ
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get top sound playlist"})
        return
    }
    // กรณีเจอข้อมูล
    c.JSON(http.StatusOK, soundPlaylist)
}

// create function delete sound playlist use by pid

func DeleteSoundPlaylistByPID(c *gin.Context) {
    id := c.Param("pid")
    db := config.DB()

    // ลบทั้งหมดที่มี p_id ตรงกับ id
    result := db.Where("p_id = ?", id).Delete(&entity.SoundPlaylist{})
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete sound playlist"})
        return
    }

    if result.RowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "sound playlist not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "sound playlist deleted successfully"})
}
