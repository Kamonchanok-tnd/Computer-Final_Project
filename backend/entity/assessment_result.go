package entity
import (
	"gorm.io/gorm"
)
type AssessmentResult struct {
	gorm.Model
	Date  string `json:"date"`
	UID   uint   `json:"uid"`
	QuID  uint   `json:"quid"`

	Answers []AssessmentAnswer `gorm:"foreignKey:ARID"`
	Transaction  Transaction        `gorm:"foreignKey:ARID"`
}