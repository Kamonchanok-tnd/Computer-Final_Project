package wordhealingmessage

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
    "strconv"

)

// ฟังก์ชันบริการเพื่อลบ WordHealingContent และข้อมูลที่เกี่ยวข้อง (เช่น Like)
func DeleteWordHealingContent(c *gin.Context) {
    
    // รับ id จาก URL
    contentId := c.Param("id")

    // แปลงเป็น int
    id, err := strconv.Atoi(contentId)
    if err != nil || id <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
        return
    }
    wid := uint(id)

    db := config.DB()

    // เช็กว่ามีบทความจริงไหม
    var content entity.WordHealingContent
    if err := db.First(&content, wid).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบบทความที่ต้องการลบ"})
        return
    }

    // เริ่ม transaction
    tx := db.Begin()

    // 1) ลบ like ที่อ้างถึงบทความนี้ทั้งหมด
    if err := tx.Where(&entity.Like{WID: wid}).Delete(&entity.Like{}).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"message": "ลบข้อมูลถูกใจไม่สำเร็จ"})
        return
    }

    // 2) ลบบทความ
    if err := tx.Delete(&entity.WordHealingContent{}, wid).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถลบบทความได้"})
        return
    }

    // ยืนยัน transaction
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถยืนยันการลบได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "ลบบทความและข้อมูลถูกใจที่เกี่ยวข้องสำเร็จ"})
}