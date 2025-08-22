package entity

import (
	"gorm.io/gorm"
)

type Criteria struct {
	gorm.Model
	Description   string        `json:"description"`
	CriteriaScore int           `json:"criteria_score"`
	
	Calculations  []Calculation `gorm:"foreignKey:CID"`

}
