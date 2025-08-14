package entity
import (
	"gorm.io/gorm"
)

type QuestionnaireGroup struct {
	gorm.Model
	Name        string         `gorm:"unique;not null"` // เช่น "pre-test", "post-test"
	Description string
	Questionnaires []Questionnaire `gorm:"many2many:questionnaire_group_mappings;"`
}

