package entity

import (
	"gorm.io/gorm"
)

type BotModel struct {
	gorm.Model
	Name    string `json:"name" valid:"required~Name is required,stringlength(1|128)~Name too long"`
	Using   bool   `json:"using" valid:"required~Using is required"`
	APIKeys string `json:"api_keys" valid:"required~API keys is required"`
}