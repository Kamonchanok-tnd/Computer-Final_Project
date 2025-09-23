package entity

import "gorm.io/gorm"

type Like struct {
	gorm.Model
	// ผู้ใช้ผู้กดไลก์: บังคับ
	UID uint `json:"uid" valid:"required~กรุณาระบุผู้ใช้ (UID)"`

	// เป้าหมายของไลก์ (อย่างใดอย่างหนึ่ง)
	WID uint `json:"wid"`
	SID uint `json:"sid"`
}