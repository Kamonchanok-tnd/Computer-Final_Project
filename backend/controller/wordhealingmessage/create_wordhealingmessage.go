package wordhealingmessage

import (
	"net/http"
	"strconv"
	"strings"
	"sukjai_project/config"
	"sukjai_project/entity"
	"time"
	"github.com/gin-gonic/gin"
)


// ฟังก์ชันบริการเพื่อดึงข้อมูล WordHealingContent ทั้งหมด
func GetAllWordhealingmessages(c *gin.Context) {
    var messages []entity.WordHealingContent
    db := config.DB()

    if err := db.Preload("ArticleType").Order("id asc").Find(&messages).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลบทความได้"})
        return
    }
    if len(messages) == 0 {
        c.JSON(http.StatusNoContent, gin.H{"message": "ไม่มีบทความให้กำลังใจในระบบ"})
        return
    }
    c.JSON(http.StatusOK, messages)
}

// ฟังก์ชันบริการเพื่อดึงข้อมูล WordHealingContent ทั้งหมดโดย User
func GetAllWordhealingmessagesForUser(c *gin.Context) {
    var messages []entity.WordHealingContent
    db := config.DB()

    if err := db.Preload("ArticleType").Order("id asc").Find(&messages).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลบทความได้"})
        return
    }
    if len(messages) == 0 {
        c.JSON(http.StatusNoContent, gin.H{"message": "ไม่มีบทความให้กำลังใจในระบบ"})
        return
    }
    c.JSON(http.StatusOK, messages)
}


type ArticleTypeResponse struct {
    ID          uint   `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
}

// ฟังก์ชันบริการเพื่อดึงข้อมูลประเภทบทความ
func GetArticleTypes(c *gin.Context) {
    db := config.DB()

    var result []ArticleTypeResponse

    var articleTypes []entity.ArticleType
    if err := db.Model(&entity.ArticleType{}).
        Where("name IS NOT NULL AND name <> ''").
        Order("name ASC").
        Find(&articleTypes).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงประเภทบทความได้"})
        return
    }

    if len(articleTypes) > 0 {
        for _, at := range articleTypes {
            result = append(result, ArticleTypeResponse{
                ID:          at.ID,
                Name:        at.Name,
                Description: at.Description,
            })
        }
        c.JSON(http.StatusOK, result)
        return
    }

    // สามารถลบส่วน fallback ออกได้ถ้าไม่ต้องการ
    c.Status(http.StatusNoContent)
}


// ฟังก์ชันบริการเพื่อสร้าง WordHealingContent
func CreateWordHealingMessages(c *gin.Context) {
	var input entity.WordHealingContent

	// รับข้อมูลจากฟอร์ม (multipart/form-data)
	input.Name    = strings.TrimSpace(c.PostForm("name"))
	input.Author  = strings.TrimSpace(c.PostForm("author"))
	input.Content = strings.TrimSpace(c.PostForm("content"))

	// ใช้ความสัมพันธ์ด้วย FK
	articleTypeIDStr := strings.TrimSpace(c.PostForm("article_type_id"))
	if articleTypeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ กรุณาเลือกประเภทบทความ"})
		return
	}
	aid, err := strconv.Atoi(articleTypeIDStr)
	if err != nil || aid <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ รหัสประเภทบทความไม่ถูกต้อง"})
		return
	}
	input.ArticleTypeID = uint(aid)

	// ตรวจความครบถ้วน
	if input.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ กรุณากรอกชื่อบทความ"})
		return
	}
	if input.Author == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ กรุณากรอกชื่อผู้เขียน"})
		return
	}
	if input.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ กรุณากรอกเนื้อหาบทความ"})
		return
	}

	// แปลงจำนวนการกดถูกใจ
	if likes, err := strconv.Atoi(c.DefaultPostForm("no_of_like", "0")); err == nil && likes >= 0 {
		input.NoOfLike = likes
	}

	// แปลงวันที่ (YYYY-MM-DD)
	dateString := strings.TrimSpace(c.PostForm("date"))
	if dateString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ กรุณาเลือกวันที่เผยแพร่"})
		return
	}
	date, err := time.Parse("2006-01-02", dateString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ รูปแบบวันที่ไม่ถูกต้อง"})
		return
	}
	input.Date = date

	// รับ Base64 ของรูปภาพ
	if base64Photo := c.PostForm("photo"); base64Photo != "" {
		input.Photo = &base64Photo
	}

	db := config.DB()
	tx := db.Begin()

	// ตรวจว่ามี ArticleType นี้ (และยังไม่ถูก soft-delete)
	var at entity.ArticleType
	if err := tx.First(&at, input.ArticleTypeID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ ไม่พบประเภทบทความที่เลือก"})
		return
	}

	// บันทึก
	if err := tx.Create(&input).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ ไม่สามารถบันทึกบทความได้"})
		return
	}
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message": "บันทึกบทความสำเร็จ",
		"data":    input,
	})
}
