package soundplaylist

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

func CreateSoundPlaylist(c *gin.Context) {
	db := config.DB()

	var soundPlaylist entity.SoundPlaylist
	if err := c.ShouldBindJSON(&soundPlaylist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&soundPlaylist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create sound playlist"})
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
}
func GetSoundPlaylistByPID(c *gin.Context) {
	id := c.Param("pid")
	db := config.DB()
	var soundPlaylist []SoundPlaylistWithSound
	err := db.Table("sound_playlists").
		Select("sound_playlists.id, sound_playlists.s_id, sound_playlists.p_id, sounds.name, sounds.sound as sound_url, sounds.owner, sounds.duration").
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