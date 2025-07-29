package chanting

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)



func GetAllChanting(c*gin.Context){
	id := c.Param("id")
	db := config.DB()
	var sound []entity.Sound

	err := db.Where("sound_type_id = ?", id).Find(&sound).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get sounds"})
		return
	}

	

	c.JSON(http.StatusOK, sound)
}

func GetPlaylistByUID(c*gin.Context){
	id := c.Param("id")
	db := config.DB()
	var playlist []entity.Playlist

	err := db.Where("uid = ?", id).Find(&playlist).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get playlist"})
		return
	}

	

	c.JSON(http.StatusOK, playlist)
}

func CreatePlaylist(c*gin.Context){
	var playlist entity.Playlist
	if err := c.ShouldBindJSON(&playlist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	if err := db.Create(&playlist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create playlist"})
		return
	}

	c.JSON(http.StatusOK, playlist)
}

