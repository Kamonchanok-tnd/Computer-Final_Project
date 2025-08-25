package profileavatar

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

func GetAllProfile(c *gin.Context) {
	db := config.DB()
	var profiles []entity.ProfileAvatar

	result := db.Find(&profiles)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": profiles})
}
