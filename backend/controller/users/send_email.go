package users

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"github.com/joho/godotenv"
)

// SendEmail ส่งอีเมลด้วย Gmail SMTP
func SendEmail1(to, subject, body string) error {
	// โหลดไฟล์ .env
	err1 := godotenv.Load()
	if err1 != nil {
		return fmt.Errorf("Error loading .env file: %v", err1)
	}

	// ข้อมูล SMTP Server จาก .env
	from := os.Getenv("EMAIL_USER")
	password := os.Getenv("EMAIL_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	// ตรวจสอบว่าได้ข้อมูลจาก .env หรือไม่
	if from == "" || password == "" || smtpHost == "" || smtpPort == "" {
		return fmt.Errorf("บางข้อมูลจาก .env ขาดหายไป")
	}

	// ตรวจสอบข้อมูลที่ใช้ส่งอีเมล
	if to == "" || subject == "" || body == "" {
		return fmt.Errorf("ข้อมูลอีเมลไม่ครบถ้วน")
	}

	// การยืนยันตัวตนด้วย SMTP
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// เพิ่มการ log ข้อมูลก่อนการส่งอีเมล
	fmt.Println("Sending email to:", to)
	fmt.Println("Using SMTP Host:", smtpHost)
	fmt.Println("Using SMTP Port:", smtpPort)

	// สร้างข้อความอีเมล
	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n" + // ระบุว่าเป็น HTML
		"\r\n" +
		body + "\r\n")

	// พิมพ์ log ก่อนการส่งอีเมล
	fmt.Println("Attempting to send email...")

	// ส่งอีเมล
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
	if err != nil {
		log.Printf("Error sending email: %v", err)  // Log เมื่อมีข้อผิดพลาด
		return err
	}

	// พิมพ์ log หลังการส่งอีเมล
	fmt.Println("Email sent successfully to:", to)  // Log หลังการส่งอีเมลสำเร็จ
	return nil
}
