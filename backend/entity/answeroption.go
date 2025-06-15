package entity
import (
	"gorm.io/gorm"
)
type AnswerOption struct {
	gorm.Model
	Description string `json:"description"`
	Point       int    `json:"point"`
	QID         uint   `json:"qid"`

	AssessmentAnswers []AssessmentAnswer `gorm:"foreignKey:AOID"`
}
