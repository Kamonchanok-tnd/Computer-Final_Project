package playlist

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

func CreatePlaylist(c*gin.Context){
	db:=config.DB()

	var playlist entity.Playlist
	if err := c.ShouldBindJSON(&playlist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&playlist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create playlist"})
		return
	}

	c.JSON(http.StatusOK, playlist)
}	




func GetPlaylistByUID(c*gin.Context){
	id := c.Param("uid")
	db := config.DB()
	var playlist []PlaylistWithBackground

	err := db.Table("playlists").
	Select("playlists.id, playlists.name, playlists.uid, playlists.b_id, backgrounds.picture").
	Joins("LEFT JOIN backgrounds ON playlists.b_id = backgrounds.id").
	Where("playlists.uid = ? AND playlists.deleted_at IS NULL", id).
	Scan(&playlist).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get playlist"})
		return
	} 

	c.JSON(http.StatusOK, playlist)
}


type PlaylistWithBackground struct {
	entity.Playlist
	Picture string `json:"picture"`
}

func GetPlaylistByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var playlist PlaylistWithBackground

	err := db.Table("playlists").
		Select("playlists.name, playlists.uid, playlists.b_id, backgrounds.picture").
		Joins("LEFT JOIN backgrounds ON playlists.b_id = backgrounds.id").
		Where("playlists.id = ? AND playlists.deleted_at IS NULL", id).
		Scan(&playlist).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get playlist"})
		return
	}

	c.JSON(http.StatusOK, playlist)
}

func EditPlaylistByID(c*gin.Context){
	id := c.Param("id")
	db := config.DB()
	var playlist entity.Playlist

	err := db.Where("id = ?", id).First(&playlist).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
		return
	}

	if err := c.ShouldBindJSON(&playlist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Save(&playlist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update playlist"})
		return
	}

	c.JSON(http.StatusOK, playlist)
}

func DeletePlaylistByID(c*gin.Context){
	id := c.Param("id")
	db := config.DB()
	var playlist entity.Playlist

	err := db.Where("id = ?", id).First(&playlist).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
		return
	}

	if err := db.Delete(&playlist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete playlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Playlist deleted successfully"})
}

func CreateSoundPlaylist(c*gin.Context){
	var soundPlaylist entity.SoundPlaylist
	if err := c.ShouldBindJSON(&soundPlaylist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	if err := db.Create(&soundPlaylist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create sound playlist"})
		return
	}

	c.JSON(http.StatusOK, soundPlaylist)
}

