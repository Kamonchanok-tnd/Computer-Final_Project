package entity

import (
	"gorm.io/gorm"
)

type AssessmentResult struct {
	gorm.Model

	Date string `json:"date" valid:"required~กรุณาระบุวันที่"`

	UID  uint `json:"uid"  valid:"required~กรุณาระบุผู้ใช้"`            // FK to Users.ID
	QuID uint `json:"quid" valid:"required~กรุณาระบุแบบสอบถาม"`          // FK to Questionnaire.ID
	QGID uint `json:"qgid" valid:"required~กรุณาระบุกลุ่มแบบสอบถาม"`     // FK to QuestionnaireGroup.ID

	User               Users              `gorm:"foreignKey:UID;references:ID" valid:"-"`
	Questionnaire      Questionnaire      `gorm:"foreignKey:QuID;references:ID" valid:"-"`
	QuestionnaireGroup QuestionnaireGroup `gorm:"foreignKey:QGID;references:ID" valid:"-"`

	Answers     []AssessmentAnswer `gorm:"foreignKey:ARID;constraint:OnDelete:CASCADE" valid:"-"`
	Transaction Transaction        `gorm:"foreignKey:ARID" valid:"-"`
}
