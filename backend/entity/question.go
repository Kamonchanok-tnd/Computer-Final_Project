package entity

import "gorm.io/gorm"

type Question struct {
	gorm.Model
	ID            uint  `gorm:"primaryKey" json:"id"`
	NameQuestion string `json:"nameQuestion"` 
	QuID         uint   `json:"quID"`
	Questionnaire Questionnaire `gorm:"foreignKey:QuID" json:"questionnaire"`
    AnswerOptions   []AnswerOption `gorm:"foreignKey:QID;constraint:OnDelete:CASCADE;"`

}