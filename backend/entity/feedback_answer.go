package entity

import "gorm.io/gorm"

// คำตอบรายข้อของการส่งหนึ่งครั้ง
type FeedbackAnswer struct {
	gorm.Model

	// 1 submission มีหลาย answer
	SubmissionID uint               `json:"submission_id" gorm:"not null;index;uniqueIndex:uniq_submission_question"`
	Submission   FeedbackSubmission `json:"-" gorm:"foreignKey:SubmissionID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	// ผู้ใช้ (ซ้ำกับใน submission เพื่อ query ง่าย)
	UID  uint  `json:"uid" gorm:"not null;index"`
	User Users `json:"-"  gorm:"foreignKey:UID;references:ID"`

	// ชี้ไปคำถาม
	QuestionID uint             `json:"question_id" gorm:"not null;index;uniqueIndex:uniq_submission_question"`
	Question   FeedbackQuestion `json:"-" gorm:"foreignKey:QuestionID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	// ใช้ช่องใดช่องหนึ่งตามชนิดคำถาม
	// - rating: ต้องมี Rating (1..5)
	// - text  : ต้องมี Text
	// - choice_single: ใช้ OptionID
	Rating  *int           `json:"rating"`              // type = "rating"
	Text    *string        `json:"text"`                // type = "text"
	OptionID *uint         `json:"option_id"`           // type = "choice_single"
	Option   *FeedbackOption `json:"-" gorm:"foreignKey:OptionID;references:ID"`

	// type = "choice_multi" → เก็บตัวเลือกหลายตัวในตารางสะพาน
	SelectedOptions []FeedbackAnswerOption `json:"selected_options,omitempty" gorm:"foreignKey:AnswerID;references:ID;constraint:OnDelete:CASCADE"`
}
