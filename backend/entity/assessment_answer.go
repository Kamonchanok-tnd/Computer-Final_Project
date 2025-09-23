package entity

import (
	"gorm.io/gorm"
)

type AssessmentAnswer struct {
	gorm.Model

	QuestionNumber int `json:"question_number" valid:"required~กรุณาระบุจำนวนคำถาม,range(1|10000)~ลำดับคำถามต้องมากกว่าหรือเท่ากับ 1 และต้องไม่เกิน 10000"`
	Point          int `json:"point"           valid:"required~กรุณาระบุคะแนน,range(0|100000)~คะแนนต้องเป็นจำนวนเต็มไม่ติดลบและไม่เกิน 100000"`

	QID  uint `json:"qid"  valid:"required~กรุณาระบุคำถาม"`           // FK to Question
	ARID uint `json:"arid" valid:"required~กรุณาระบุผลแบบสอบถาม"`     // FK to AssessmentResult
	AOID uint `json:"aoid" valid:"required~กรุณาระบุตัวเลือกคำตอบ"`     // FK to AnswerOption

	Question         Question         `gorm:"foreignKey:QID;references:ID" valid:"-"`
	AssessmentResult AssessmentResult `gorm:"foreignKey:ARID;references:ID" valid:"-"`
	AnswerOption     AnswerOption     `gorm:"foreignKey:AOID;references:ID" valid:"-"`
}


