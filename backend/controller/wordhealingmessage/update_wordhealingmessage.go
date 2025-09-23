package wordhealingmessage

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"time"
	"github.com/gin-gonic/gin"
    "strconv"
)

// ฟังก์ชันบริการเพื่อดึงข้อมูลบทความตาม ID
func GetWordHealingMessage(c *gin.Context) {
    idParam := c.Param("id")
    id, err := strconv.Atoi(idParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    var message entity.WordHealingContent
    if err := config.DB().First(&message, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "WordHealingMessage not found"})
        return
    }

    // ตอบกลับโดยรวม content และ article_type ด้วย
    type resp struct {
        ID          uint      `json:"id"`
        Name        string    `json:"name"`
        Author      string    `json:"author"`
        Photo       string    `json:"photo"`
        NoOfLike    int       `json:"no_of_like"`
        Date        time.Time `json:"date"`
        Content     string    `json:"content"`
        ArticleType string    `json:"article_type"`
    }

    r := resp{
        ID:          message.ID,
        Name:        message.Name,
        Author:      message.Author,
        Photo:       formatPhoto(message.Photo),
        NoOfLike:    message.NoOfLike,
        Date:        message.Date,
        Content:     message.Content,
        ArticleType: message.ArticleType,
    }

    c.JSON(http.StatusOK, r)
}

// formatPhoto ฟังก์ชันสำหรับจัดรูปแบบภาพ
func formatPhoto(photo *string) string {
    if photo != nil && *photo != "" {
        if !isBase64(*photo) {
            return "data:image/jpeg;base64," + *photo
        }
        return *photo
    }
    return "/default-image.png" // ถ้าไม่มีภาพ ให้ใช้ภาพเริ่มต้น
}

// isBase64 ฟังก์ชันสำหรับตรวจสอบว่า string เป็น Base64 หรือไม่
func isBase64(str string) bool {
    // การตรวจสอบว่า string เป็น Base64 หรือไม่
    return len(str) > 0 && str[:5] == "data:"
}


// ฟังก์ชันบริการเพื่ออัปเดตข้อมูล WordHealingContent
func UpdateWordHealingMessage(c *gin.Context) {
    // รับค่า ID จาก URL
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    // โครงสร้างรับ JSON จาก FE
    // FE จะส่ง date เป็น ISO (เช่น "2025-08-12T00:00:00.000Z")
    type updateReq struct {
        Name        string     `json:"name"`
        Author      string     `json:"author"`
        NoOfLike    int        `json:"no_of_like"`
        Date        time.Time  `json:"date"`          // binding RFC3339 อัตโนมัติ
        Photo       *string    `json:"photo"`         // base64 หรือ null
        Content     string     `json:"content"`
        ArticleType string     `json:"article_type"`  // snake_case ให้ตรง DB/Model
    }

    var req updateReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // หา record เดิม
    var existing entity.WordHealingContent
    if err := config.DB().First(&existing, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
        return
    }

    // อัปเดตฟิลด์
    existing.Name        = req.Name
    existing.Author      = req.Author
    existing.NoOfLike    = req.NoOfLike
    existing.Date        = req.Date
    existing.Content     = req.Content
    existing.ArticleType = req.ArticleType

    // อัปเดตรูป (ถ้าส่งมาเป็นค่าว่าง/ไม่ส่ง ให้ล้างเป็น nil)
    if req.Photo != nil && *req.Photo != "" {
        existing.Photo = req.Photo
    } else {
        existing.Photo = nil
    }


    if err := config.DB().Save(&existing).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update record"})
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "message": "Record updated successfully",
        "data":    existing,
    })
}




