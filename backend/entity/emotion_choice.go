package entity

import (
	"gorm.io/gorm"
)

type EmotionChoice struct {
	gorm.Model
	Name    string `json:"name"`
	Picture string `json:"picture"`

	AnswerOptions []AnswerOption `gorm:"foreignKey:EmotionChoiceID"`
}
