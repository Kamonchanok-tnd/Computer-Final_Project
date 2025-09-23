package entity

import (
	"gorm.io/gorm"
)

type QuestionnaireGroup struct {
	gorm.Model
	Name          string  `gorm:"unique;not null" valid:"required~กรุณาระบุชื่อกลุ่มแบบสอบถาม,length(1|128)~กรุณาระบุชื่อกลุ่มไม่เกิน 128 ตัวอักษร"` // เช่น "pre-test", "post-test"
	Description   string  `valid:"required~กรุณาระบุคำอธิบาย"`
	FrequencyDays *uint   `valid:"-"`     
	TriggerType   *string `valid:"-"`  

	Questionnaires                   []Questionnaire                  `gorm:"many2many:questionnaire_group_mappings;" valid:"-"`
	QuestionnaireGroupQuestionnaires []QuestionnaireGroupQuestionnaire `gorm:"foreignKey:QuestionnaireGroupID" valid:"-"`
	AssessmentResults                []AssessmentResult               `gorm:"foreignKey:QGID" valid:"-"`
}
