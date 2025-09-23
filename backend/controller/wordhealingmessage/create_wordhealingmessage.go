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

    // ดึงข้อมูลทั้งหมดจากฐานข้อมูลและเรียงลำดับตาม id จากน้อยไปมาก
    if err := db.Order("id asc").Find(&messages).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลบทความได้"})
        return
    }

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if len(messages) == 0 {
        c.JSON(http.StatusNoContent, gin.H{"message": "ไม่มีบทความให้กำลังใจในระบบ"})
        return
    }

    // ส่งข้อมูลกลับเป็น JSON
    c.JSON(http.StatusOK, messages)
}

// ฟังก์ชันบริการเพื่อดึงข้อมูล WordHealingContent ทั้งหมดโดย User
func GetAllWordhealingmessagesForUser(c *gin.Context) {
    var messages []entity.WordHealingContent
    db := config.DB()

    // ดึงข้อมูลทั้งหมดจากฐานข้อมูลและเรียงลำดับตาม id จากน้อยไปมาก
    if err := db.Order("id asc").Find(&messages).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลบทความได้"})
        return
    }

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if len(messages) == 0 {
        c.JSON(http.StatusNoContent, gin.H{"message": "ไม่มีบทความให้กำลังใจในระบบ"})
        return
    }

    // ส่งข้อมูลกลับเป็น JSON
    c.JSON(http.StatusOK, messages)
}

// ฟังก์ชันบริการเพื่อสร้าง WordHealingContent
func CreateWordHealingMessages(c *gin.Context) {
	var input entity.WordHealingContent

	// รับข้อมูลจากฟอร์ม
	input.Name = strings.TrimSpace(c.PostForm("name"))
	input.Author = strings.TrimSpace(c.PostForm("author"))
	input.Content = strings.TrimSpace(c.PostForm("content"))  // เพิ่มฟิลด์ content
	input.ArticleType = strings.TrimSpace(c.PostForm("article_type"))  // เพิ่มฟิลด์ articleType
	
	// ตรวจสอบข้อมูลที่จำเป็น
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
	if input.ArticleType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ กรุณากรอกประเภทบทความ"})
		return
	}

	// แปลงจำนวนการกดถูกใจ
	likes, err := strconv.Atoi(c.DefaultPostForm("no_of_like", "0"))
	if err != nil || likes < 0 {
		likes = 0
	}
	input.NoOfLike = likes

	// แปลงวันที่
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

	// รับข้อมูล Base64 ของรูปภาพ
	base64Photo := c.PostForm("photo")
	if base64Photo != "" {
		input.Photo = &base64Photo
	}

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()
	tx := db.Begin()

	// บันทึกข้อมูลลงในฐานข้อมูล
	if err := tx.Create(&input).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ ไม่สามารถบันทึกบทความได้"})
		return
	}

	// Commit ข้อมูล
	tx.Commit()

	// ส่งข้อมูลกลับไป
	c.JSON(http.StatusOK, gin.H{
		"message": "บันทึกบทความสำเร็จ",
		"data":    input,
	})
}



type ArticleTypeResponse struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// ฟังก์ชันบริการเพื่อดึงข้อมูลประเภทบทความ
func GetArticleTypes(c *gin.Context) {
	db := config.DB()

	var result []ArticleTypeResponse

	// 1) ดึงจากตาราง article_types ก่อน
	var articleTypes []entity.ArticleType
	if err := db.Model(&entity.ArticleType{}).
		Where("name IS NOT NULL AND name <> ''").
		Order("name ASC").
		Find(&articleTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงประเภทบทความได้"})
		return
	}

	if len(articleTypes) > 0 {
		// แปลงเป็น []ArticleTypeResponse
		for _, at := range articleTypes {
			result = append(result, ArticleTypeResponse{
				Name:        at.Name,
				Description: at.Description,
			})
		}
		c.JSON(http.StatusOK, result)
		return
	}

	// 2) ถ้าไม่มีใน article_types ให้ fallback ไปดึงจาก WordHealingContent.article_type
	var fallbackTypes []string
	if err := db.Model(&entity.WordHealingContent{}).
		Where("article_type IS NOT NULL AND article_type <> ''").
		Distinct("article_type").
		Order("article_type ASC").
		Pluck("article_type", &fallbackTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงประเภทบทความได้"})
		return
	}

	for _, name := range fallbackTypes {
		result = append(result, ArticleTypeResponse{
			Name:        name,
			Description: "",
		})
	}

	if len(result) == 0 {
		c.Status(http.StatusNoContent)
		return
	}

	c.JSON(http.StatusOK, result)
}