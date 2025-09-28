package wordhealingmessage

import (
	"errors"
	"net/http"
	
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"sukjai_project/config"
	"sukjai_project/entity"
)

// ฟังก์ชันบริการเพื่อกดถูกใจ (Like) หรือยกเลิกถูกใจ (Unlike) บทความ
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

        // เคยกดแล้ว ยกเลิก Like
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

    // ยังไม่เคยกด เพิ่ม Like
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


// ฟังก์ชันบริการเพื่อตรวจสอบว่าผู้ใช้กดถูกใจบทความนี้หรือไม่
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

// ฟังก์ชันบริการเพื่ออัปเดตจำนวนการเข้าชมบทความ
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


/* helpers*/
// แปลงค่าประเภทต่าง ๆ เป็น uint
func toUint(v any) (uint, error) {
	switch t := v.(type) {
	case uint:
		return t, nil
	case int:
		if t < 0 {
			return 0, errors.New("negative id")
		}
		return uint(t), nil
	case int64:
		if t < 0 {
			return 0, errors.New("negative id")
		}
		return uint(t), nil
	case float64:
		if t < 0 {
			return 0, errors.New("negative id")
		}
		return uint(t), nil
	case string:
		if t == "" {
			return 0, errors.New("empty")
		}
		n, err := strconv.ParseUint(t, 10, 64)
		return uint(n), err
	default:
		return 0, errors.New("unsupported type")
	}
}

// ดึง uid จาก context ที่ middleware ใส่ไว้
func getUIDFromCtx(c *gin.Context) (uint, error) {
	for _, k := range []string{"uid", "user_id", "id", "UID", "Id"} {
		if v, ok := c.Get(k); ok {
			if u, err := toUint(v); err == nil && u > 0 {
				return u, nil
			}
		}
	}
	return 0, errors.New("uid not found")
}

/* payload */
type countViewReq struct {
	WHID        uint  `json:"whid"         binding:"required"`
	ReadMs      int64 `json:"read_ms"`
	PctScrolled int   `json:"pct_scrolled"`
}

type countViewResp struct {
	OK         bool  `json:"ok"`
	Already    bool  `json:"already"`  // ที่นี่จะเป็น false เสมอ เพราะเรานับทุกครั้ง
	ViewID     uint  `json:"view_id"`
	ViewCount  int64 `json:"view_count"`
	WordhealID uint  `json:"wordheal_id"`
}

/* POST /views/count */
// นับทุกครั้งที่เรียก (ไม่มีการกันซ้ำ) 
func CountView(c *gin.Context) {
	db := config.DB()

	uid, err := getUIDFromCtx(c)
	if err != nil || uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req countViewReq
	if err := c.ShouldBindJSON(&req); err != nil || req.WHID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	// ต้องมีบทความอยู่จริง
	var article entity.WordHealingContent
	if err := db.Select("id, view_count").First(&article, req.WHID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "article not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		}
		return
	}

	// INSERT แถวใหม่ทุกครั้ง
	row := entity.View{
		UID:         &uid,                          
		WHID:        req.WHID,
		ReadMS:      int(req.ReadMs),
		PctScrolled: req.PctScrolled,
		CreatedAt:   time.Now(),
	}
	if err := db.Create(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create view failed"})
		return
	}

	// เพิ่ม view_count (+1) ทุกครั้ง
	if err := db.Model(&entity.WordHealingContent{}).
		Where("id = ?", req.WHID).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update view_count failed"})
		return
	}

	// ดึงค่า view_count ล่าสุด
	var updated entity.WordHealingContent
	_ = db.Select("id, view_count").First(&updated, req.WHID).Error

	c.JSON(http.StatusOK, countViewResp{
		OK:         true,
		Already:    false,
		ViewID:     row.ID,
		ViewCount:  int64(updated.ViewCount),
		WordhealID: updated.ID,
	})
}

/* GET /views/by-message/:id */
func ListViewsByMessage(c *gin.Context) {
	db := config.DB()

	// ต้องล็อกอิน (อย่างน้อยต้องผ่าน middleware)
	if _, err := getUIDFromCtx(c); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	idStr := c.Param("id")
	whid, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || whid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// join users เพื่อชื่อผู้ใช้ได้ตามต้องการ
	type row struct {
		ID          uint      `json:"id"`
		UID         uint      `json:"uid"` 
		Username    *string   `json:"username"`
		ReadMs      int       `json:"read_ms"`
		PctScrolled int       `json:"pct_scrolled"`
		CreatedAt   time.Time `json:"created_at"`
	}

	var out []row
	err = db.Table("views v").
		Select("v.id, v.uid, u.username, v.read_ms, v.pct_scrolled, v.created_at").
		Joins("LEFT JOIN users u ON u.id = v.uid").
		Where("v.whid = ?", whid).
		Order("v.created_at DESC").
		Scan(&out).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}
	if len(out) == 0 {
		c.Status(http.StatusNoContent)
		return
	}

	c.JSON(http.StatusOK, out)
}