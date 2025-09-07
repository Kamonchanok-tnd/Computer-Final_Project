package entity

import "gorm.io/gorm"

type Calculation struct {
	gorm.Model

	// บังคับต้องมีค่า (ไม่เป็น 0)
	CID  uint `json:"cid"  gorm:"index;uniqueIndex:uniq_quid_cid" valid:"required~กรุณาระบุเกณฑ์ (CID)"`
	// บังคับต้องมีค่า (ไม่เป็น 0)
	QuID uint `json:"quid" gorm:"index;uniqueIndex:uniq_quid_cid" valid:"required~กรุณาระบุแบบทดสอบ (QuID)"`

	// ปิดการ validate ฟิลด์ความสัมพันธ์ (กัน govalidator ไหลลงไปเช็ค struct ซ้อน)
	Criteria      Criteria      `gorm:"foreignKey:CID;constraint:OnDelete:CASCADE" valid:"-"`
	Questionnaire Questionnaire `gorm:"foreignKey:QuID;constraint:OnDelete:CASCADE" valid:"-"`
}
