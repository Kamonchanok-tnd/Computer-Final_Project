// handler/onboarding.go
package handler

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
)

func GetMirrorOnboarding(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	var flag entity.OnboardingFlag
	if err := config.DB().Where("uid = ?", userID).First(&flag).Error; err != nil {
		// ถ้ายังไม่มี record ให้ถือว่ายังไม่เห็น (seen=false)
		c.JSON(http.StatusOK, gin.H{"seen": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"seen": flag.MirrorSeen})
}

func SetMirrorOnboardingSeen(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		util.HandleError(c, http.StatusUnauthorized, "ไม่ได้เข้าสู่ระบบ", "UNAUTHORIZED")
		return
	}

	var flag entity.OnboardingFlag
	db := config.DB()
	if err := db.Where("uid = ?", userID).First(&flag).Error; err != nil {
		// ยังไม่มี → สร้างใหม่
		flag.UID = userID.(uint)
		flag.MirrorSeen = true
		if err := db.Create(&flag).Error; err != nil {
			util.HandleError(c, http.StatusInternalServerError, "บันทึกสถานะไกด์ล้มเหลว", "UPSERT_FAILED")
			return
		}
	} else {
		// มีอยู่ → อัปเดต
		if err := db.Model(&flag).Update("mirror_seen", true).Error; err != nil {
			util.HandleError(c, http.StatusInternalServerError, "อัปเดตสถานะไกด์ล้มเหลว", "UPDATE_FAILED")
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
