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
	Priority          int
	ConditionOnID     *uint   // ถ้ามีแบบสอบถามก่อนหน้า เช่น 2Q
	ConditionScore    *int    // คะแนนจากแบบสอบถามก่อนหน้า ≥ เท่าไหร่ถึงแสดง


	Users      	Users      `gorm:"foreignKey:UID"`
	
	Questions 	[]Question  `gorm:"foreignKey:QuID;references:ID;constraint:OnDelete:CASCADE;"`
    Groups      []QuestionnaireGroup `gorm:"many2many:questionnaire_group_questionnaires;"`

}

