package entity

import "gorm.io/gorm"

type ProfileAvatar struct {
	gorm.Model
	Avatar string `json:"avatar" valid:"required~Avatar is required"`
	Name string `json:"name" valid:"required~Name is required"`

	Users []Users `gorm:"foreignKey:PFID" valid:"-"`
}