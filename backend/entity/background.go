package entity

import (
	"gorm.io/gorm"
)
type Background struct {
	gorm.Model
	Name    string  `valid:"required~Name is required"`
	Picture string `valid:"required~Picture is required"`
	UID     uint     `json:"uid" valid:"required~UID is required"`

	Users Users `gorm:"foreignKey:UID" valid:"-"`
}
