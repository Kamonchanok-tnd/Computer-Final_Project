package entity

import "gorm.io/gorm"

type Question struct {
	gorm.Model
	// ชื่อคำถาม: บังคับ + ยาวไม่เกิน 256
	NameQuestion string `json:"nameQuestion" valid:"required~กรุณาระบุคำถาม,stringlength(1|256)~ชื่อคำถามยาวเกินไป"`

	// อ้างอิงแบบทดสอบ (QuID): บังคับ
	QuID uint `json:"quID" valid:"required~กรุณาระบุแบบทดสอบ (QuID)"`

	// ลำดับความสำคัญ: 0–100
	Priority int `json:"priority" valid:"range(0|100)~ลำดับความสำคัญต้องอยู่ระหว่าง 0–100"`

	// รูปภาพ: optional (เก็บเป็น data URL base64); ตรวจแบบ manual ฝั่งเทส
	Picture *string `json:"picture" gorm:"type:text;null" valid:"-"`

	// ปิดการ validate ของ relation ทั้งหมด (กัน govalidator วิ่งลง struct ซ้อน)
	Questionnaire Questionnaire  `gorm:"foreignKey:QuID" json:"questionnaire" valid:"-"`
	AnswerOptions []AnswerOption `gorm:"foreignKey:QID;constraint:OnDelete:CASCADE;" json:"answerOptions" valid:"-"`
}

