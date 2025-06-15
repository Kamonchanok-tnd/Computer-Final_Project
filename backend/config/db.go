package config

import (
	"fmt"
	"log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"sukjai_project/entity" // เพิ่มการนำเข้า package ของ entity
)

// ประกาศตัวแปร DB ที่ระดับ package
var DB *gorm.DB

// ฟังก์ชันคืนค่า DB
func db() *gorm.DB {
	return DB
}

// ConnectionDB - เชื่อมต่อกับฐานข้อมูล PostgreSQL
func ConnectionDB() {
	// ข้อมูลการเชื่อมต่อฐานข้อมูล PostgreSQL (ปรับให้ตรงกับข้อมูลของคุณ)
	dsn := "user=postgres password=12345 dbname=sukjai port=5432 sslmode=disable"

	// เชื่อมต่อกับฐานข้อมูล
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{}) // ใช้ DB ที่ประกาศไว้แล้ว
	if err != nil {
		log.Fatalf("Error while connecting to the database: %v", err)
	}
	fmt.Println("Connected to the database successfully!")
}

// SetupDatabase - ทำการ AutoMigrate เพื่อสร้างตารางต่างๆ
func SetupDatabase() {
	// ทำการ auto migrate เพื่อสร้างตารางทั้งหมดในฐานข้อมูล
	err := DB.AutoMigrate(
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
	// เพิ่มข้อมูลในตาราง Users โดยใช้ Create
	DB.Create(&entity.Users{
		Username:    "admin", 
		Email:       "admin@example.com", 
		Password:    "admin123", 
		Role:        "admin", 
		Age:         30, 
		Gender:      "Male", 
		PhoneNumber: "1234567890", 
		Facebook:    "admin_fb",
	})
	DB.Create(&entity.Users{
		Username:    "user", 
		Email:       "user@example.com", 
		Password:    "user123", 
		Role:        "user", 
		Age:         25, 
		Gender:      "Female", 
		PhoneNumber: "0987654321", 
		Facebook:    "user_fb",
	})
}
