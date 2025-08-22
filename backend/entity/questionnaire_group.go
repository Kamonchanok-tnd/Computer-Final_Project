package entity

import (
	"gorm.io/gorm"
)

type QuestionnaireGroup struct {
	gorm.Model
	Name        string         `gorm:"unique;not null"` // เช่น "pre-test", "post-test"
	Description string
    FrequencyDays *uint   // ความถี่สำหรับ post-test แบบซ้ำ เช่น 7, 14 วัน

	Questionnaires []Questionnaire `gorm:"many2many:questionnaire_group_mappings;"`
    QuestionnaireGroupQuestionnaires []QuestionnaireGroupQuestionnaire `gorm:"foreignKey:QuestionnaireGroupID"`
}

