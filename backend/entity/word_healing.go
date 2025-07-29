package entity

import (
	"time"
	"gorm.io/gorm"
)

type WordHealingContent struct {
	gorm.Model
	Name     string    `json:"name"`
	Author   string    `json:"author"`
	Photo   *string    `json:"photo" gorm:"type:text;null"` 
	NoOfLike int       `json:"no_of_like"`
	Date     time.Time `json:"date"`
}
