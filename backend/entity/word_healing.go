package entity

import (
	"time"
	"gorm.io/gorm"
)

type WordHealingContent struct {
	gorm.Model
	Name     string    `json:"name"`
	Author   string    `json:"author"`
	NoOfLike int       `json:"no_of_like"`
	Date     time.Time `json:"date"`
}
