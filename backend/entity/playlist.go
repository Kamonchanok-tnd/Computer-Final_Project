package entity

import (
	"gorm.io/gorm"
)

type Playlist struct {
	gorm.Model
	Name        string `json:"name" valid:"required~Name is required"`
	UID         uint     `json:"uid" valid:"required~UID is required"`
	BID         uint      `json:"bid" valid:"required~Background is required"`
	STID uint  `json:"stid" valid:"required~SoundType is required"`// foreign key ที่เชื่อมโยงกับ Playlist
	Users       Users      `gorm:"foreignKey:UID" valid:"-"`
	Background  Background  `gorm:"foreignKey:BID" valid:"-"`
	Sounds      []SoundPlaylist `gorm:"foreignKey:PID" valid:"-"` // ความสัมพันธ์กับ SoundPlaylist ผ่าน PID
	SoundType SoundType `gorm:"foreignKey:STID" valid:"-"`
}
