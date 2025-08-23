package entity

import (
	"gorm.io/gorm"
)

type AnswerOption struct {
	gorm.Model
	Description string `json:"description"`
	Point       int    `json:"point"`
	QID         uint   `json:"qid"`

	EmotionChoiceID uint
	EmotionChoice   EmotionChoice `gorm:"foreignKey:EmotionChoiceID"`

	AssessmentAnswers []AssessmentAnswer `gorm:"foreignKey:AOID"`
}
