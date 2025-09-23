package entity

import "gorm.io/gorm"

// คำตอบรายคำถาม ของ "การส่งฟีดแบ็กหนึ่งครั้ง"
type FeedbackAnswer struct {
	gorm.Model
	FeedbackID uint `json:"feedback_id" gorm:"index"` // ผูกกับ Feedback เดิม (การส่งครั้งนั้น)
	QuestionID uint `json:"question_id" gorm:"index"` // คำถามไหน

	// ค่าคำตอบ (อย่างใดอย่างหนึ่ง)
	Rating *int   `json:"rating,omitempty"` // ถ้าเป็นคำถามแบบ rating
	Text   string `json:"text,omitempty"`   // ถ้าเป็นคำถามแบบ text

	// relations (optional for preload)
	Feedback Feedback        `gorm:"foreignKey:FeedbackID"`
	Question FeedbackQuestion `gorm:"foreignKey:QuestionID"`
}
