package entity

import (
	"gorm.io/gorm"
)

type History struct {
	gorm.Model
	UID uint `gorm:"not null"`
	SID uint `gorm:"not null"`

	// การเชื่อมโยงกับตาราง Users และ Sound
	Users Users `gorm:"foreignKey:UID"`
	Sound Sound `gorm:"foreignKey:SID"`
}
