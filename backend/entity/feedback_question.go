package entity

import "gorm.io/gorm"

// คำถามที่แอดมินกำหนด (เปิด/ปิด/แก้ข้อความ/เรียงลำดับ)
type FeedbackQuestion struct {
	gorm.Model
	Key      string `json:"key" gorm:"uniqueIndex"` // ex. "overall","suggestion","ux_ease"
	Label    string `json:"label"`                  // ข้อความที่แสดงให้ผู้ใช้
	Type     string `json:"type"`                   // "rating" | "text"
	IsActive bool   `json:"is_active" gorm:"default:true"`
	Sort     int    `json:"sort" gorm:"default:0"`

	// one-to-many: คำถามหนึ่งข้อ -> คำตอบหลายรายการ
	Answers []FeedbackAnswer `gorm:"foreignKey:QuestionID"`
}
