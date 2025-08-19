package entity

import (
	"gorm.io/gorm"
)

type Playlist struct {
	gorm.Model
	Name        string `json:"name"`
	UID         uint    `json:"uid"`
	BID         uint     `json:"bid"`
	STID uint  `json:"stid"`// foreign key ที่เชื่อมโยงกับ Playlist
	Users       Users      `gorm:"foreignKey:UID"`
	Background  Background `gorm:"foreignKey:BID"`
	Sounds      []SoundPlaylist `gorm:"foreignKey:PID"` // ความสัมพันธ์กับ SoundPlaylist ผ่าน PID
	SoundType SoundType `gorm:"foreignKey:STID"`
}
