package config

import (
	"fmt"
	"log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"sukjai_project/entity" // เพิ่มการนำเข้า package ของ entity
	// "os"
)

// ประกาศตัวแปร DB ที่ระดับ package
var db *gorm.DB

// ฟังก์ชันคืนค่า DB
func DB() *gorm.DB {
	return db
}

const (
   host     = "localhost" // เปลี่ยนจาก "db" เป็น "postgres"       
   port     = 5432        // default PostgreSQL port
   user     = "postgres"  // user ที่กำหนดใน docker-compose.yml
   password = "12345"     // password ที่กำหนดใน docker-compose.yml
   dbname   = "sukjai"    // ชื่อฐานข้อมูล
)


// ConnectionDB - เชื่อมต่อกับฐานข้อมูล PostgreSQL
// func ConnectionDB() {
//     dsn := os.Getenv("DATABASE_DSN")
//     if dsn == "" {
//         log.Fatal("DATABASE_DSN not found in environment variables")
//     }

//     var err error
//     db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
//     if err != nil {
//         log.Fatalf("Error connecting to database: %v", err)
//     }
//     fmt.Println("Connected to the database successfully!")
// }

// ConnectionDB - เชื่อมต่อกับฐานข้อมูล PostgreSQL
func ConnectionDB() {
	// สร้าง connection string
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// เปิดการเชื่อมต่อกับฐานข้อมูล
	var err error
	db, err = gorm.Open(postgres.Open(psqlInfo), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	fmt.Println("Successfully connected to the database!")
}

// SetupDatabase - ทำการ AutoMigrate เพื่อสร้างตารางต่างๆ
func SetupDatabase() {
	// ทำการ auto migrate เพื่อสร้างตารางทั้งหมดในฐานข้อมูล
	err := db.AutoMigrate(
		&entity.Users{}, 
		&entity.Like{}, 
		&entity.Feedback{}, 
		&entity.Mirror{},
		&entity.Score{},
		&entity.WordHealingContent{},
		&entity.Emotion{},
		&entity.AnswerOption{},
		&entity.ASMR{},
		&entity.AssessmentAnswer{},
		&entity.AssessmentResult{},
		&entity.Background{},
		&entity.BotModel{},
		&entity.Calculation{},
		&entity.ChatRoom{},
		&entity.Conversation{},
		&entity.Criteria{},
		&entity.History{},
		&entity.Playlist{},
		&entity.Prompt{},
		&entity.Question{},
		&entity.Questionnaire{},
		&entity.RecentSetting{},
		&entity.Review{},
		&entity.SendType{},
		&entity.SoundPlaylist{},
		&entity.Sound{},
		&entity.SoundType{},
		&entity.Transaction{},
	)
	if err != nil {
		log.Fatalf("Error migrating database: %v", err)
	}
	fmt.Println("Database migration completed successfully!")
	SetupInitialData()
}

// SetupInitialData - เพิ่มข้อมูลเริ่มต้นในตารางต่างๆ
// เพิ่มข้อมูลในตาราง Users โดยใช้ Create เพื่อให้แน่ใจว่าจะสร้างข้อมูลใหม่
func SetupInitialData() {
	// แฮชรหัสผ่านก่อนบันทึก
	adminPassword, err := HashPassword("admin123")
	if err != nil {
		log.Fatalf("Error hashing admin password: %v", err)
	}
	userPassword, err := HashPassword("user123")
	if err != nil {
		log.Fatalf("Error hashing user password: %v", err)
	}

	// เพิ่มข้อมูลในตาราง Users โดยใช้ Create
	db.Create(&entity.Users{
		Username:    "admin", 
		Email:       "admin@example.com", 
		Password:    adminPassword, // ใช้รหัสผ่านที่แฮชแล้ว
		Role:        "admin", 
		Age:         30, 
		Gender:      "Male", 
		PhoneNumber: "1234567890", 
		Facebook:    "admin_fb",
	})
	db.Create(&entity.Users{
		Username:    "user", 
		Email:       "user@example.com", 
		Password:    userPassword, // ใช้รหัสผ่านที่แฮชแล้ว
		Role:        "user", 
		Age:         25, 
		Gender:      "Female", 
		PhoneNumber: "0987654321", 
		Facebook:    "user_fb",
	})
}
