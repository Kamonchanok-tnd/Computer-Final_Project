package entity

import "gorm.io/gorm"

type AnswerOption struct {
	gorm.Model

	// คำตอบ: บังคับ + ยาวไม่เกิน 256
	Description string `json:"description" valid:"required~กรุณาระบุคำตอบ,stringlength(1|256)~คำตอบยาวเกินไป"`

	// คะแนน: บังคับ (จำนวนเต็ม) ช่วง 0–1000 (ยืดหยุ่นสำหรับหลายสเกล)
	Point int `json:"point" valid:"int,range(0|1000)~คะแนนต้องอยู่ระหว่าง 0–1000"`

	// อ้างอิงคำถาม: บังคับ
	QID uint `json:"qid" valid:"required~กรุณาระบุคำถาม (QID)"`

	// EmotionChoice บังคับ
	EmotionChoiceID uint          `json:"emotionChoiceId" valid:"-"`
	EmotionChoice   EmotionChoice `gorm:"foreignKey:EmotionChoiceID" json:"emotionChoice" valid:"-"`

	// ความสัมพันธ์อื่น ๆ → ปิดการ validate
	AssessmentAnswers []AssessmentAnswer `gorm:"foreignKey:AOID" json:"assessmentAnswers" valid:"-"`
}

