package entity

import (
	"gorm.io/gorm"
)

type QuestionnaireGroupQuestionnaire struct {
	gorm.Model

	QuestionnaireGroupID uint `valid:"required~กรุณาระบุกลุ่ม"`
	QuestionnaireID      uint `valid:"required~กรุณาระบุแบบสอบถาม"`
	OrderInGroup         uint `valid:"required~กรุณาระบุลำดับของคำถาม,range(1|100000)~ลำดับในกลุ่มต้องมากกว่าหรือเท่ากับ 1"`

	QuestionnaireGroup QuestionnaireGroup `gorm:"foreignKey:QuestionnaireGroupID" valid:"-"`
	Questionnaire      Questionnaire      `gorm:"foreignKey:QuestionnaireID" valid:"-"`
}
