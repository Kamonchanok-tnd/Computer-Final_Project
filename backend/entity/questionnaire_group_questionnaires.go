package entity

import (
	"gorm.io/gorm"
)

type QuestionnaireGroupQuestionnaire struct {
	gorm.Model

	QuestionnaireGroupID uint
	QuestionnaireID      uint
	OrderInGroup         uint

	// ความสัมพันธ์กับตารางหลัก
	QuestionnaireGroup QuestionnaireGroup `gorm:"foreignKey:QuestionnaireGroupID"`
	Questionnaire      Questionnaire      `gorm:"foreignKey:QuestionnaireID"`
}
