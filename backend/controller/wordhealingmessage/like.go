// controller/wordhealingmessage/like.go
package wordhealingmessage

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"sukjai_project/config"
	"sukjai_project/entity"
)

// ดึง UID จาก gin.Context (รองรับทั้ง "uid" และ "userID")
func getUID(c *gin.Context) (uint, bool) {
	if v, ok := c.Get("uid"); ok {
		switch vv := v.(type) {
		case uint:
			return vv, true
		case int:
			return uint(vv), true
		case int32:
			return uint(vv), true
		case int64:
			return uint(vv), true
		case float64:
			return uint(vv), true
		case string:
			if i, err := strconv.Atoi(vv); err == nil {
				return uint(i), true
			}
		}
	}
	// fallback: เผื่อ middleware เก่า set เป็น "userID"
	if v, ok := c.Get("userID"); ok {
		switch vv := v.(type) {
		case uint:
			return vv, true
		case int:
			return uint(vv), true
		case int32:
			return uint(vv), true
		case int64:
			return uint(vv), true
		case float64:
			return uint(vv), true
		case string:
			if i, err := strconv.Atoi(vv); err == nil {
				return uint(i), true
			}
		}
	}
	return 0, false
}

// POST /wordhealing/like/:wid  → กดถูกใจ
func LikeMessage(c *gin.Context) {
	wid64, err := strconv.ParseUint(c.Param("wid"), 10, 64)
	if err != nil || wid64 == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid wid"})
		return
	}
	wid := uint(wid64)

	uid, ok := getUID(c)
	if !ok || uid == 0 {
		log.Println("LikeMessage: no uid in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := config.DB()
	tx := db.Begin()

	// 1) เช็คว่ามี like (uid,wid) อยู่แล้วหรือยัง (struct-based query)
	var exists entity.Like
	if err := tx.Where(&entity.Like{UID: uid, WID: wid}).First(&exists).Error; err == nil {
		// มีอยู่แล้ว → ไม่ต้องเพิ่มซ้ำ
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "already liked"})
		return
	} else if err != nil && err != gorm.ErrRecordNotFound {
		tx.Rollback()
		log.Println("LikeMessage: query like failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query like failed"})
		return
	}

	// 2) สร้าง like ใหม่
	if err := tx.Create(&entity.Like{UID: uid, WID: wid}).Error; err != nil {
		tx.Rollback()
		log.Println("LikeMessage: create like failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create like failed"})
		return
	}

	// 3) เพิ่ม no_of_like (+1) แบบปลอดภัย
	if err := tx.Model(&entity.WordHealingContent{}).
		Where("id = ?", wid).
		UpdateColumn("no_of_like", gorm.Expr("CASE WHEN no_of_like IS NULL THEN 1 ELSE no_of_like + 1 END")).Error; err != nil {
		tx.Rollback()
		log.Println("LikeMessage: update like count failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update like count failed"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		log.Println("LikeMessage: commit failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "liked"})
}

// DELETE /wordhealing/like/:wid  → เลิกถูกใจ
func UnlikeMessage(c *gin.Context) {
	wid64, err := strconv.ParseUint(c.Param("wid"), 10, 64)
	if err != nil || wid64 == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid wid"})
		return
	}
	wid := uint(wid64)

	uid, ok := getUID(c)
	if !ok || uid == 0 {
		log.Println("UnlikeMessage: no uid in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	db := config.DB()
	tx := db.Begin()

	// 1) ลบ like (struct-based query) — ถ้าไม่มีอยู่แล้วก็ลบ 0 แถว ถือว่าโอเค
	if err := tx.Where(&entity.Like{UID: uid, WID: wid}).Delete(&entity.Like{}).Error; err != nil {
		tx.Rollback()
		log.Println("UnlikeMessage: delete like failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete like failed"})
		return
	}

	// 2) ลด no_of_like (-1) แต่ไม่ให้ติดลบ
	if err := tx.Model(&entity.WordHealingContent{}).
		Where("id = ? AND no_of_like > 0", wid).
		UpdateColumn("no_of_like", gorm.Expr("no_of_like - 1")).Error; err != nil {
		tx.Rollback()
		log.Println("UnlikeMessage: update like count failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update like count failed"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		log.Println("UnlikeMessage: commit failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "unliked"})
}


// ฟังก์ชันเพื่อดึงสถานะ Like ของผู้ใช้ทั้งหมด
func GetUserLikedMessages(c *gin.Context) {
	uid, ok := getUID(c)
	if !ok || uid == 0 {
		log.Println("GetUserLikedMessages: no uid in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var likedMessages []uint
	// ดึงข้อมูลของการ Like บทความจากฐานข้อมูล
	if err := config.DB().Model(&entity.Like{}).
		Where("u_id = ?", uid).
		Pluck("w_id", &likedMessages).Error; err != nil {
		log.Println("GetUserLikedMessages: query failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	// ส่งข้อมูลการถูกใจทั้งหมดให้ client
	c.JSON(http.StatusOK, likedMessages)
}
