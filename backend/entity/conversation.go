package entity

import (
	"gorm.io/gorm"
)
type Conversation struct {
	gorm.Model
	Message     string `json:"message" valid:"required~Message is required"`
	ChatRoomID  uint   `json:"chatroom_id" valid:"required~ChatRoomID is required"`
	STID        uint   `json:"stid" valid:"required~SendType ID is required"`
}
