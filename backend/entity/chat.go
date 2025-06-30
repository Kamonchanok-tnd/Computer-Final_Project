package entity

import (
	"time"

	"gorm.io/gorm"
)
type ChatRoom struct {
	gorm.Model
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	UID       uint   `json:"uid"`

	Conversations []Conversation `gorm:"foreignKey:ChatRoomID"`
}