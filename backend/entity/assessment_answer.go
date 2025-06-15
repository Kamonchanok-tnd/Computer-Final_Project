package entity
import (
	"gorm.io/gorm"
)
type AssessmentAnswer struct {
	gorm.Model
	QuestionNumber int `json:"question_number"`
	Point          int `json:"point"`
	QID            uint `json:"qid"`
	ARID           uint `json:"arid"`
	AOID           uint `json:"aoid"`
}