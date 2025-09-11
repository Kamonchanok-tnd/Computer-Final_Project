package entity

import (
	"gorm.io/gorm"
)

type SoundType struct {
	gorm.Model
	Type   string  `json:"type" valid:"required~Type is required"`
	Sounds []Sound `gorm:"foreignKey:STID" valid:"-"` // ชี้ไปที่ Sound.STID
}
