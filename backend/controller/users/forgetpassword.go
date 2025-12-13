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
	"net/smtp"
	"os"
)

// ForgotPasswordController: ฟังก์ชันสำหรับการขอรีเซ็ตรหัสผ่าน
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
        c.JSON(http.StatusNoContent, gin.H{"message": "หากอีเมลของคุณมีในระบบ เราจะส่งลิงก์การรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ"})
        return
    }
    fmt.Println("Request received for email:", payload.Email)

    // ตรวจสอบว่า user มี reset_token หรือไม่
        // ตรวจสอบว่า user มี reset_token หรือไม่ หรือหมดอายุแล้ว
    if user.ResetToken == "" || user.ResetTokenExpiry.IsZero() || time.Now().After(user.ResetTokenExpiry) {
        // ถ้าไม่มีหรือหมดอายุแล้ว ให้สร้างใหม่
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
    }


    // ส่งอีเมล
subject := "การรีเซ็ตรหัสผ่าน - ระบบ SUT Heal jai"
body := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        h2 {
            color: #1976D2;
            text-align: center;
        }
        .token {
            font-size: 20px;
            font-weight: bold;
            color: #d32f2f;
            background: #fce4ec;
            padding: 10px 15px;
            border-radius: 6px;
            display: inline-block;
            margin: 15px 0;
        }
        p {
            line-height: 1.6;
        }
        .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>การรีเซ็ตรหัสผ่าน</h2>
        <p>เรียนผู้ใช้งาน,</p>
        <p>ตามที่ท่านได้ทำการร้องขอการรีเซ็ตรหัสผ่าน ระบบได้จัดส่งโทเค็นสำหรับการรีเซ็ตรหัสผ่านมาให้ดังนี้:</p>

        <div class="token">%s</div>

        <p>กรุณานำโทเค็นนี้ไปใช้ภายใน <b>5 นาที</b> เพื่อทำการตั้งรหัสผ่านใหม่ หากพ้นเวลาที่กำหนด ท่านจำเป็นต้องทำการขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง</p>
        <p>หากท่านไม่ได้เป็นผู้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>

        <p>ขอแสดงความนับถือ,<br>
        ทีมงาน SUT Heal jai</p>

        <div class="footer">
            *** อีเมลฉบับนี้เป็นการแจ้งอัตโนมัติ กรุณาอย่าตอบกลับ ***
        </div>
    </div>
</body>
</html>
`, user.ResetToken)

    // ฟังก์ชันการส่งอีเมล
    sendEmail := func(to, subject, body string) error {
        from := os.Getenv("EMAIL_USER")
        password := os.Getenv("EMAIL_PASSWORD")
        smtpHost := os.Getenv("SMTP_HOST")
        smtpPort := os.Getenv("SMTP_PORT")

        // การยืนยันตัวตนด้วย SMTP
        auth := smtp.PlainAuth("", from, password, smtpHost)

        msg := []byte("To: " + to + "\r\n" +
            "Subject: " + subject + "\r\n" +
            "Content-Type: text/html; charset=\"UTF-8\"\r\n" +
            "\r\n" +
            body + "\r\n")

        err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
        if err != nil {
            return err
        }
        return nil
    }

    // พิมพ์ log ก่อนการส่งอีเมล
    fmt.Println("Sending reset password email to:", payload.Email)

    // เรียกใช้ฟังก์ชันส่งอีเมล
    if err := sendEmail(payload.Email, subject, body); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถส่งอีเมลได้"})
        return
    }

    // ส่ง Response
    c.JSON(http.StatusOK, gin.H{
        "message": "ระบบได้ส่งโทเค็นไปยังอีเมลของคุณแล้ว",
    })
}

// ฟังก์ชันในการสุ่มโทเค็น 6 หลัก
func Generate6DigitToken(db *gorm.DB) (string, error) {
	for {
		// สุ่มเลข 6 หลัก
		rand.Seed(time.Now().UnixNano())
		token := fmt.Sprintf("%06d", rand.Intn(1000000)) // สุ่มเลข 6 หลักจาก 0-999999

		// ตรวจสอบว่า token นี้มีอยู่ในฐานข้อมูลหรือไม่
		var existing entity.Users
		if err := db.Where("reset_token = ?", token).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return token, nil
			}
			// หากเกิดข้อผิดพลาดอื่นใน query ให้คืน error
			return "", err
		}
	}
}
