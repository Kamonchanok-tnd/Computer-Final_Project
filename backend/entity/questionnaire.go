package entity

import "gorm.io/gorm"

type Questionnaire struct {
	gorm.Model

	NameQuestionnaire string `json:"nameQuestionnaire" valid:"required~กรุณาระบุชื่อแบบทดสอบ,stringlength(1|128)~ชื่อแบบทดสอบยาวเกินไป"`
	Description       string `json:"description"       valid:"stringlength(0|1000)~คำอธิบายยาวเกินไป"`
	Quantity          int    `json:"quantity"          valid:"range(0|1000)~จำนวนข้อไม่ถูกต้อง (ต้องอยู่ระหว่าง 0–1000)"`
	UID               uint   `json:"uid"               valid:"required~กรุณาระบุผู้สร้าง"`
	Priority          int    `json:"priority"          valid:"range(0|100)~ลำดับความสำคัญต้องอยู่ระหว่าง 0–100"`

	// pointer fields → ตรวจแบบ manual (ไปทำในไฟล์เทส)
	TestType       *string `json:"testType"       valid:"-"`
	ConditionOnID  *uint   `json:"conditionOnID"  valid:"-"`
	ConditionScore *int    `json:"conditionScore" valid:"-"`
	ConditionType  *string `json:"conditionType"  valid:"-"`
	Picture        *string `json:"picture"        valid:"-"`

	// ปิดการ validate ของ relation ทั้งหมด
	Users        Users                `json:"-" gorm:"foreignKey:UID"                        valid:"-"`
	Questions    []Question           `json:"questions" gorm:"foreignKey:QuID;references:ID;constraint:OnDelete:CASCADE;" valid:"-"`
	Groups       []QuestionnaireGroup `json:"groups" gorm:"many2many:questionnaire_group_questionnaires;"                 valid:"-"`
	Calculations []Calculation        `json:"-" gorm:"foreignKey:QuID"                                                          valid:"-"`
}
