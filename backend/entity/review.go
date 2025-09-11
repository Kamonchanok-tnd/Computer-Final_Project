package entity

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Point int `json:"point" valid:"required~Point is required,range(1|5)~Point must be between 1 and 5"`
	SID   uint `json:"sid" valid:"required~SoundID is required"`
	UID   uint `json:"uid" valid:"required~UID is required"`

	// ความสัมพันธ์
	Sound Sound  `gorm:"foreignKey:SID" valid:"-"` // เชื่อมโยงกับ Sound ผ่าน SID
	Users Users `gorm:"foreignKey:UID" valid:"-"`
}
