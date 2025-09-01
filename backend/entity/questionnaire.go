package entity
import (
	"gorm.io/gorm"
)
type Questionnaire struct {
    gorm.Model
    NameQuestionnaire string   `json:"nameQuestionnaire"`
    Description       string   `json:"description"`
    Quantity          int      `json:"quantity"`
    UID               uint     `json:"uid"`
    Priority          int      `json:"priority"`
    TestType          *string  `json:"testType"`

    ConditionOnID     *uint    `json:"conditionOnID"`
    ConditionScore    *int     `json:"conditionScore"`
    ConditionType     *string  `json:"conditionType"`
    Picture           *string  `json:"picture"`

    Users        Users                  `json:"-" gorm:"foreignKey:UID"`
    Questions    []Question             `json:"questions" gorm:"foreignKey:QuID;references:ID;constraint:OnDelete:CASCADE;"`
    Groups       []QuestionnaireGroup   `json:"groups" gorm:"many2many:questionnaire_group_questionnaires;"`
    Calculations []Calculation          `json:"-" gorm:"foreignKey:QuID"`
}


