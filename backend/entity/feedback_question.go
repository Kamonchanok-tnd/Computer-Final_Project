package entity

import "gorm.io/gorm"

// คำถามในแบบฟอร์ม (ชุดที่ใช้งานจะมี is_active = true)
type FeedbackQuestion struct {
	gorm.Model
	Key      string `json:"key"   gorm:"uniqueIndex:idx_feedback_questions_key"` // ใช้ hard delete อยู่แล้ว
	Label    string `json:"label"`
	// rating | text | choice_single | choice_multi
	Type     string `json:"type"`
	IsActive bool   `json:"is_active" gorm:"default:true"`
	Sort     int    `json:"sort"      gorm:"default:0"`

	// ตัวเลือกของคำถาม (เฉพาะ choice_*); ลบคำถาม → ลบ options
	Options []FeedbackOption `json:"options,omitempty" gorm:"foreignKey:QuestionID;references:ID;constraint:OnDelete:CASCADE"`
	
	// ป้องกันวนลูปเวลา preload ลึก ๆ
	// Answers []FeedbackAnswer `json:"-" gorm:"foreignKey:QuestionID"`
}
