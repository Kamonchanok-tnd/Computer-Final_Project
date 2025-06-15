package entity

import (
	"gorm.io/gorm"
)
type Conversation struct {
	gorm.Model
	Message     string `json:"message"`
	ChatRoomID  uint   `json:"chatroom_id"`
	STID        uint   `json:"stid"`
}
