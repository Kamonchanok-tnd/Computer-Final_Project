package entity

import (
	"gorm.io/gorm"
)


type Calculation struct {
	gorm.Model
	CID  uint `json:"cid"  gorm:"index;uniqueIndex:uniq_quid_cid"`
	QuID uint `json:"quid" gorm:"index;uniqueIndex:uniq_quid_cid"`

	Criteria      Criteria      `gorm:"foreignKey:CID;constraint:OnDelete:CASCADE"`
	Questionnaire Questionnaire `gorm:"foreignKey:QuID;constraint:OnDelete:CASCADE"`
}