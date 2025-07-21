package entity

import "gorm.io/gorm"

type Question struct {
	gorm.Model
	// ID            uint  `gorm:"primaryKey"`
	NameQuestion string `json:"nameQuestion"` 
	QuID         uint   `json:"quID"`
	Priority      int    `json:"priority"` 
	Questionnaire Questionnaire `gorm:"foreignKey:QuID" json:"questionnaire"`
	AnswerOptions []AnswerOption `gorm:"foreignKey:QID;constraint:OnDelete:CASCADE;" json:"answerOptions"`
}