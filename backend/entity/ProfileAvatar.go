package entity

import "gorm.io/gorm"

type ProfileAvatar struct {
	gorm.Model
	Avatar string `json:"avatar"`
	Name string `json:"name"`

	Users []Users `gorm:"foreignKey:PFID"`
}