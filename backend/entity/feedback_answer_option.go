package entity

import "gorm.io/gorm"

// สะพานเก็บคำตอบของ "หลายตัวเลือก" (many-to-many) ต่อ 1 answer
type FeedbackAnswerOption struct {
	gorm.Model

	AnswerID uint           `json:"answer_id" gorm:"not null;index;uniqueIndex:uniq_answer_option"`
	Answer   FeedbackAnswer `json:"-"        gorm:"foreignKey:AnswerID;references:ID;constraint:OnDelete:CASCADE"`

	OptionID uint           `json:"option_id" gorm:"not null;index;uniqueIndex:uniq_answer_option"`
	Option   FeedbackOption `json:"-"         gorm:"foreignKey:OptionID;references:ID"`
}
