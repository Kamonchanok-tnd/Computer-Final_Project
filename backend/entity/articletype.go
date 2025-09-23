package entity

import "gorm.io/gorm"

type ArticleType struct {
	gorm.Model

	// Name: บังคับ + ความยาว 1..128
	Name string `json:"name"        valid:"required~กรุณาระบุชื่อประเภทบทความ,stringlength(1|128)~ชื่อประเภทบทความยาวเกินไป"`

	// Description: บังคับ + ความยาว 1..1000
	Description string `json:"description" valid:"required~กรุณาระบุคำอธิบาย,stringlength(1|1000)~คำอธิบายยาวเกินไป"`
}
