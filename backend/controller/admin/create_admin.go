package admin

import (
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	"sukjai_project/config"
	"sukjai_project/entity"
	// "sukjai_project/services"
	"errors"
	"gorm.io/gorm"
	"regexp"
	// "os"
	// "fmt"
	"time"
)
type (
   Authen struct {
       Email    string `json:"email"`
       Password string `json:"password"`
   }
   
   signUp struct {
       Username   string    `json:"username"`
       Email      string    `json:"email"`
       Password   string    `json:"password"`
       Facebook   string    `json:"facebook"`
       Line       string    `json:"line"`
       PhoneNumber string   `json:"phone_number"`
       Role       string    `json:"role"`
       Age        int       `json:"age"`      
       Gender     string    `json:"gender"`
       BirthDay   time.Time `json:"birthday"`
   }
)
// ตรวจสอบรูปแบบอีเมล
func isValidEmail(email string) bool {
    re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    return re.MatchString(email)
}

func CreateAdmin(c *gin.Context) {
    var payload signUp
    // Bind JSON payload to the struct
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
        return
    }

    // ตรวจสอบว่าอีเมลเป็นรูปแบบที่ถูกต้องหรือไม่
    if !isValidEmail(payload.Email) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบอีเมลไม่ถูกต้อง"})
        return
    }

    db := config.DB()
    var userCheck entity.Users
    // ตรวจสอบว่าผู้ใช้ที่ใช้ email นี้มีอยู่หรือไม่
    result := db.Where("email = ?", payload.Email).First(&userCheck)
    if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้งาน"})
        return
    }
    if userCheck.ID != 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "อีเมลนี้ถูกลงทะเบียนแล้ว"})
        return
    }

    // ให้บทบาทเป็น "admin" เท่านั้น
    payload.Role = "admin"

    // **print** ค่า role ที่กำหนด
    log.Println("Role set to:", payload.Role)

    // ตรวจสอบความปลอดภัยของรหัสผ่าน เช่น ความยาวขั้นต่ำ 6 ตัว
    if len(payload.Password) < 6 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"})
        return
    }

    // แฮชรหัสผ่านก่อนบันทึก
    hashedPassword, err := config.HashPassword(payload.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน"})
        return
    }

    // สร้างผู้ใช้งานใหม่ (Admin)
    user := entity.Users{
        Username:   payload.Username,
        Email:      payload.Email,
        Password:   hashedPassword,
        Facebook:   payload.Facebook,
        Line:       payload.Line,
        PhoneNumber: payload.PhoneNumber,
        Role:       payload.Role, // บทบาทเป็น "admin"
        Age:        payload.Age, 
        Gender:     payload.Gender,
    }

    // บันทึกผู้ใช้ลงในฐานข้อมูล
    if err := db.Create(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้"})
        return
    }

    // ส่งข้อความยืนยันว่า admin ถูกสร้าง
    c.JSON(http.StatusCreated, gin.H{"message": "เพิ่มผู้ดูแลระบบสำเร็จแล้ว"})
}
