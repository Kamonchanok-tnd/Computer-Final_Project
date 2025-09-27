package entity

import "gorm.io/gorm"

// ตัวเลือกของคำถาม (ใช้กับ choice_single / choice_multi)
type FeedbackOption struct {
	gorm.Model
	QuestionID uint             `json:"question_id" gorm:"not null;index"`
	Question   FeedbackQuestion `json:"-" gorm:"foreignKey:QuestionID;references:ID;constraint:OnDelete:CASCADE"`

	Label string `json:"label" gorm:"not null"`
	Sort  int    `json:"sort"  gorm:"default:0"`
}
