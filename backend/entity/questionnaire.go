package entity
import (
	"gorm.io/gorm"
)
type Questionnaire struct {
	gorm.Model
	NameQuestionnaire string
	Description       string
	Quantity          int
	UID               uint
	Users      Users      `gorm:"foreignKey:UID"`
	Questions []Question  `gorm:"foreignKey:QuID;references:ID;constraint:OnDelete:CASCADE;"`
}

