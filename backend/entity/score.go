package entity

import (
	"gorm.io/gorm"
)

type Score struct {
	gorm.Model
	Scorepoint int `json:"scorepoint"`
}
