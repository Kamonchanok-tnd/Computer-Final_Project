package entity

import "gorm.io/gorm"

type ArticleType struct {
	gorm.Model

	Name string `json:"name"        valid:"required~กรุณาระบุชื่อประเภทบทความ,stringlength(1|128)~ชื่อประเภทบทความยาวเกินไป"`

	Description string `json:"description" valid:"required~กรุณาระบุคำอธิบาย,stringlength(1|1000)~คำอธิบายยาวเกินไป"`

	// ความสัมพันธ์: 1 ประเภท มีได้หลาย WordHealingContent
	WordHealings []WordHealingContent `gorm:"foreignKey:ArticleTypeID"`

}
