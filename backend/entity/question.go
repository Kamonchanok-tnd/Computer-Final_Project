package entity
import (
	"gorm.io/gorm"
)
type Question struct {
	gorm.Model
	NameQuestion string
	QuID         uint

	Questionnaire Questionnaire `gorm:"foreignKey:QuID"`
}
