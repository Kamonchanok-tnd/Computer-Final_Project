package users

import (
	"fmt"
	"net/http"
	"time"
	"math/rand"
	"github.com/gin-gonic/gin"
	"sukjai_project/config"
   "sukjai_project/entity"
	"gorm.io/gorm"
	"log"
	"net/smtp"
)

func ForgotPasswordController(c *gin.Context) {
	type RequestPayload struct {
		Email string `json:"email" binding:"required"`
	}

	var payload RequestPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกอีเมลให้ถูกต้อง"})
		return
	}

	db := config.DB()

	// ค้นหาผู้ใช้จากอีเมล
	var user entity.Users
	if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบอีเมลในระบบ"})
		return
	}

	// สร้าง reset token และตั้งเวลาหมดอายุ 5 นาที
	resetToken, err := Generate6DigitToken(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโทเค็นรีเซ็ตรหัสผ่านได้"})
		return
	}
	resetExpiry := time.Now().Add(5 * time.Minute) // ตั้งเวลา 5 นาที

	// บันทึก reset token และเวลาหมดอายุในฐานข้อมูล
	user.ResetToken = resetToken
	user.ResetTokenExpiry = resetExpiry
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกโทเค็นรีเซ็ตรหัสผ่านได้"})
		return
	}

	// ส่งอีเมล
	subject := "โทเค็นสำหรับการรีเซ็ตรหัสผ่านของคุณ"
	body := fmt.Sprintf(`
	<!DOCTYPE html>
	<html lang="th">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Reset Password</title>
		<style>
			/* styles ที่นี่ */
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1>รีเซ็ตรหัสผ่านของคุณ</h1>
			</div>
			<div class="content">
				<p>สวัสดีค่ะ/ครับ,</p>
				<p>นี่คือโทเค็นสำหรับการรีเซ็ตรหัสผ่านของคุณ:</p>
				<div class="token-boxes">
					%s
				</div>
				<p>กรุณาใช้โทเค็นนี้เพื่อรีเซ็ตรหัสผ่านของคุณภายใน 5 นาที</p>
				<p>หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
				<p>ขอบคุณค่ะ/ครับ,<br>ทีมงานของเรา</p>
			</div>
		</div>
	</body>
	</html>
	`, formatTokenIntoCards(resetToken))

	// เรียกใช้ฟังก์ชันส่งอีเมล
	if err := SendEmail(payload.Email, subject, body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถส่งอีเมลได้"})
		return
	}

	// ส่ง Response
	c.JSON(http.StatusOK, gin.H{
		"message": "ระบบได้ส่งโทเค็นไปยังอีเมลของคุณแล้ว",
	})
}

// ฟังก์ชันที่จะแปลงโทเค็นให้เป็นการ์ดสำหรับแต่ละตัวเลข
func formatTokenIntoCards(token string) string {
	var cardsHTML string

	// loop ผ่านตัวอักษรในโทเค็น และสร้างการ์ดสำหรับแต่ละตัวเลข
	for _, char := range token {
		// สร้างกล่องการ์ดสำหรับตัวเลข
		cardsHTML += fmt.Sprintf(`<div class="token-card">%c</div>`, char)
	}

	return cardsHTML
}

// ฟังก์ชันในการสุ่มโทเค็น 6 หลัก
func Generate6DigitToken(db *gorm.DB) (string, error) {
	for {
		// สุ่มเลข 6 หลัก
		rand.Seed(time.Now().UnixNano())
		token := fmt.Sprintf("%06d", rand.Intn(1000000))

		// ตรวจสอบว่า token นี้มีอยู่ในฐานข้อมูลหรือไม่
		var existing entity.Users
		if err := db.Where("reset_token = ?", token).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return token, nil
			}
			return "", err
		}
	}
}

// ฟังก์ชันสำหรับการส่งอีเมล
func SendEmail(to string, subject string, body string) error {
	from := "youremail@gmail.com"
	password := "yourpassword"
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	auth := smtp.PlainAuth("", from, password, smtpHost)
	msg := []byte("To: " + to + "\r\n" + "Subject: " + subject + "\r\n" + "\r\n" + body)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
	if err != nil {
		log.Printf("Error sending email: %v", err)
	}
	return err
}
