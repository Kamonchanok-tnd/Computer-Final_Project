package entity

import (
	"gorm.io/gorm"
)

type AssessmentAnswer struct {
	gorm.Model

	QuestionNumber int `json:"question_number"`
	Point          int `json:"point"`

	QID  uint `json:"qid"`  // FK to Question
	ARID uint `json:"arid"` // FK to AssessmentResult
	AOID uint `json:"aoid"` // FK to AnswerOption

	Question         Question         `gorm:"foreignKey:QID;references:ID"`
	AssessmentResult AssessmentResult `gorm:"foreignKey:ARID;references:ID"`
	AnswerOption     AnswerOption     `gorm:"foreignKey:AOID;references:ID"`
}

