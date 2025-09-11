package entity

import (
	"gorm.io/gorm"
)

type History struct {
	gorm.Model
	UID uint `gorm:"not null" json:"uid" valid:"required~UID is required"`
	SID uint `gorm:"not null" json:"sid" valid:"required~SID is required"`

	// การเชื่อมโยงกับตาราง Users และ Sound
	Users Users `gorm:"foreignKey:UID" valid:"-"`

	Sound Sound `gorm:"foreignKey:SID" valid:"-"`
}
