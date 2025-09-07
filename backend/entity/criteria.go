package entity

import "gorm.io/gorm"

type Criteria struct {
	gorm.Model

	// บังคับ + ความยาว + กันช่องว่างล้วน
	Description string `json:"description"      valid:"required~กรุณาระบุคำอธิบายเกณฑ์,stringlength(1|1000)~คำอธิบายยาวเกินไป,matches(^.*\\S.*$)~กรุณาระบุคำอธิบายเกณฑ์"`

	// ค่าคะแนนในช่วง 0..1000
	MinCriteriaScore int `json:"min_criteria_score" valid:"int,range(0|1000)~คะแนนต้องอยู่ระหว่าง 0–1000"`
	MaxCriteriaScore int `json:"max_criteria_score" valid:"int,range(0|1000)~คะแนนต้องอยู่ระหว่าง 0–1000"`

	// ปิด validate ความสัมพันธ์
	Calculations []Calculation `gorm:"foreignKey:CID" valid:"-"`
}
