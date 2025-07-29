package entity
import (
	"gorm.io/gorm"
)
type Questionnaire struct {
	gorm.Model
	NameQuestionnaire string
	Description       string
	Quantity          int
	UID               uint
	Priority           int
	Users      Users      `gorm:"foreignKey:UID"`
	Questions []Question  `gorm:"foreignKey:QuID;references:ID;constraint:OnDelete:CASCADE;"`
	Groups    []QuestionnaireGroup `gorm:"many2many:questionnaire_group_mappings;"`

}

