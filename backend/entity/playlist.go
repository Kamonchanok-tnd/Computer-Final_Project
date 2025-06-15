package entity

import (
	"gorm.io/gorm"
)

type Playlist struct {
	gorm.Model
	Name        string
	UID         uint
	BID         uint
	Users       Users      `gorm:"foreignKey:UID"`
	Background  Background `gorm:"foreignKey:BID"`
	Sounds      []SoundPlaylist `gorm:"foreignKey:PID"` // ความสัมพันธ์กับ SoundPlaylist ผ่าน PID
}
