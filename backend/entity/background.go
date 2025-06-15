package entity

import (
	"gorm.io/gorm"
)
type Background struct {
	gorm.Model
	Name    string
	Picture string
	UID     uint

	Users Users `gorm:"foreignKey:UID"`
}
