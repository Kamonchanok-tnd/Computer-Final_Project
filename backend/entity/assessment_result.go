package entity

import (
	"gorm.io/gorm"
)

type AssessmentResult struct {
	gorm.Model

	Date string `json:"date"`

	UID  uint `json:"uid"`  // FK to Users.ID
	QuID uint `json:"quid"` // FK to Questionnaire.ID
	QGID uint `json:"qgid"` // FK to QuestionnaireGroup.ID

	User               Users              `gorm:"foreignKey:UID;references:ID"`
	Questionnaire      Questionnaire      `gorm:"foreignKey:QuID;references:ID"`
	QuestionnaireGroup QuestionnaireGroup `gorm:"foreignKey:QGID;references:ID"`

	Answers     []AssessmentAnswer `gorm:"foreignKey:ARID;constraint:OnDelete:CASCADE"`
	Transaction Transaction        `gorm:"foreignKey:ARID"`
}
