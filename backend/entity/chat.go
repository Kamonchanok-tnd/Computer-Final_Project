package entity

import (
	"time"

	"gorm.io/gorm"
)
type ChatRoom struct {
	gorm.Model
	StartDate time.Time `json:"start_date" valid:"required~StartDate is required,start_date_valid~StartDate must be in the present"`

	EndDate   time.Time `json:"end_date"`
	IsClose   bool      `json:"is_close"`
	UID       uint      `json:"uid" valid:"required~UID is required"`
	User Users  `gorm:"foreignKey:UID" valid:"-"`

	Conversations []Conversation `gorm:"foreignKey:ChatRoomID" valid:"-"`
}