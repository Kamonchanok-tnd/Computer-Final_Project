package entity

import (
	"gorm.io/gorm"
)
type ChatRoom struct {
	gorm.Model
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	UID       uint   `json:"uid"`

	Conversations []Conversation `gorm:"foreignKey:ChatRoomID"`
}