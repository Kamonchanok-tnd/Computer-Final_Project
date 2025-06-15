package entity

import (
	"gorm.io/gorm"
)

type Emotion struct {
	gorm.Model
	Mood    string `json:"mood"`
	Picture string `json:"picture"`
}
