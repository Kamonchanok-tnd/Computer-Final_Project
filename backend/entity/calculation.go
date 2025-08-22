package entity

import (
	"gorm.io/gorm"
)

type Calculation struct {
	gorm.Model
	CID  uint `json:"cid"`
	QuID uint `json:"quid"`

	// การเชื่อมโยงกับ Criteria
	Criteria Criteria `gorm:"foreignKey:CID"`
	// การเชื่อมโยงกับ Questionnaire
	Questionnaire Questionnaire `gorm:"foreignKey:QuID"`
}
