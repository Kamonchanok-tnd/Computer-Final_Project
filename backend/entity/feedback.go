package entity

import (
	"gorm.io/gorm"
)

type Feedback struct {
	gorm.Model
	FeedbackText string `json:"feedback_text"`
	SID          uint   `json:"sid"`
	UID          uint   `json:"uid"`

	User   Users  `gorm:"foreignKey:UID"`
	Score  Score  `gorm:"foreignKey:SID"`
}
