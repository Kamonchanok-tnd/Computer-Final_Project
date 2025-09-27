package wordhealingmessage

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"time"
	"github.com/gin-gonic/gin"
    "strconv"
)


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


// ฟังก์ชันบริการเพื่อดึงข้อมูลบทความตาม ID
func GetWordHealingMessage(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    var message entity.WordHealingContent
    if err := config.DB().
        Preload("ArticleType").
        First(&message, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "WordHealingMessage not found"})
        return
    }

    type resp struct {
        ID            uint      `json:"id"`
        Name          string    `json:"name"`
        Author        string    `json:"author"`
        Photo         string    `json:"photo"`
        NoOfLike      int       `json:"no_of_like"`
        Date          time.Time `json:"date"`
        Content       string    `json:"content"`
        ArticleTypeID uint      `json:"article_type_id"`
        ArticleType   string    `json:"article_type_name"` // เผื่อ UI แสดงชื่อได้ทันที
    }

    r := resp{
        ID:            message.ID,
        Name:          message.Name,
        Author:        message.Author,
        Photo:         formatPhoto(message.Photo),
        NoOfLike:      message.NoOfLike,
        Date:          message.Date,
        Content:       message.Content,
        ArticleTypeID: message.ArticleTypeID,
        ArticleType:   message.ArticleType.Name,
    }

    c.JSON(http.StatusOK, r)
}



// ฟังก์ชันบริการเพื่ออัปเดตข้อมูล WordHealingContent
func UpdateWordHealingMessage(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    type updateReq struct {
        Name          string     `json:"name"`
        Author        string     `json:"author"`
        NoOfLike      int        `json:"no_of_like"`
        Date          time.Time  `json:"date"`
        Photo         *string    `json:"photo"`
        Content       string     `json:"content"`
        ArticleTypeID *uint      `json:"article_type_id"` 
        ViewCount     *int       `json:"view_count,omitempty"`
    }

    var req updateReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()
    var existing entity.WordHealingContent
    if err := db.First(&existing, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
        return
    }

    // อัปเดตฟิลด์หลัก
    existing.Name     = req.Name
    existing.Author   = req.Author
    existing.NoOfLike = req.NoOfLike
    existing.Date     = req.Date
    existing.Content  = req.Content
    if req.Photo != nil && *req.Photo != "" {
        existing.Photo = req.Photo
    } else {
        existing.Photo = nil
    }
    if req.ViewCount != nil {
        existing.ViewCount = *req.ViewCount
    }

    // เปลี่ยนประเภท (ถ้าส่งมา)
    if req.ArticleTypeID != nil {
        var at entity.ArticleType
        if err := db.First(&at, *req.ArticleTypeID).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบประเภทบทความที่เลือก"})
            return
        }
        existing.ArticleTypeID = *req.ArticleTypeID
    }

    if err := db.Save(&existing).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update record"})
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "message": "Record updated successfully",
        "data":    existing,
    })
}
