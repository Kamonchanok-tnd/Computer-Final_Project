// controller/wordhealingmessage/like.go
package wordhealingmessage

import (
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
    "gorm.io/gorm"
	"sukjai_project/config"
	"sukjai_project/entity"
)

// เพิ่มจำนวน like ของบทความ
func LikeArticle(c *gin.Context) {
    db := config.DB()

    articleID := c.Param("id")
    uid := c.Query("uid")

    var article entity.WordHealingContent
    if err := db.First(&article, articleID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
        return
    }

    // เช็คว่า user เคยกดไลค์บทความนี้หรือยัง
    var like entity.Like
    err := db.Where("uid = ? AND w_id = ?", uid, articleID).First(&like).Error

    if err == nil {
        // เคยกดแล้ว → ยกเลิก Like
        if err := db.Delete(&like).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike"})
            return
        }

        // ลดจำนวน Like ทีละ 1 ถ้ามากกว่า 0
        if article.NoOfLike > 0 {
            article.NoOfLike -= 1
            db.Model(&article).Update("no_of_like", article.NoOfLike)
        }

        c.JSON(http.StatusOK, gin.H{
            "message":    "Unliked",
            "like_count": article.NoOfLike,
            "liked":      false,
        })
        return
    }

    // ยังไม่เคยกด → เพิ่ม Like
    newLike := entity.Like{
        UID: parseUint(uid),
        WID: parseUint(articleID),
    }
    if err := db.Create(&newLike).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like"})
        return
    }

    article.NoOfLike += 1
    db.Model(&article).Update("no_of_like", article.NoOfLike)

    c.JSON(http.StatusOK, gin.H{
        "message":    "Liked",
        "like_count": article.NoOfLike,
        "liked":      true,
    })
}

func parseUint(str string) uint {
    v, _ := strconv.ParseUint(str, 10, 64)
    return uint(v)
}




// เช็คว่า user เคยกดหัวใจบทความนี้หรือไม่
func CheckLikedArticle(c *gin.Context) {
    db := config.DB()

    // รับ articleID จาก param
    articleIDStr := c.Param("id")
    articleID, err := strconv.ParseUint(articleIDStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid article ID"})
        return
    }

    // รับ uid จาก query
    uidStr := c.Query("uid")
    uid, err := strconv.ParseUint(uidStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UID"})
        return
    }

    // เช็คในตาราง Like
    var like entity.Like
    if err := db.Where("uid = ? AND w_id = ?", uid, articleID).First(&like).Error; err != nil {
        if err.Error() == "record not found" {
            c.JSON(http.StatusOK, gin.H{"isLiked": false})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"isLiked": true})
}

// เพิ่มจำนวนการเข้าชมบทความ
func UpdateViewcountMessage(c *gin.Context) {
    db := config.DB()
	// ดึง id ของบทความจาก URL parameter
	id := c.Param("id")

	// เชื่อมต่อกับฐานข้อมูลเพื่อดึงข้อมูลบทความ
	var message entity.WordHealingContent
	if err := db.Where("id = ?", id).First(&message).Error; err != nil {
		// ถ้าไม่พบบทความ ให้ส่งข้อผิดพลาด
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบบทความ"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลบทความ"})
		}
		return
	}

	// เพิ่มจำนวนการเข้าชม
	message.ViewCount++

	// อัปเดตข้อมูลบทความในฐานข้อมูล
	if err := db.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตจำนวนการเข้าชมได้"})
		return
	}

	// ส่งคำตอบกลับว่าอัปเดตสำเร็จ
	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตจำนวนการเข้าชมสำเร็จ"})
}