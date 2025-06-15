package entity

import (
	"gorm.io/gorm"
)

type SoundType struct {
	gorm.Model
	Type   string  `json:"type"`
	Sounds []Sound `gorm:"foreignKey:STID"` // ชี้ไปที่ Sound.STID
}
