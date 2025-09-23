package entity

import (
	"gorm.io/gorm"
)

type SoundPlaylist struct {
	gorm.Model
	SID uint  `json:"sid" valid:"required~SoundID is required"`

	PID uint `json:"pid" valid:"required~PlaylistID is required"`
	

	// ความสัมพันธ์
	Sound    Sound    `gorm:"foreignKey:SID" valid:"-"` // เชื่อมโยงกับ Sound ผ่าน SID
	Playlist Playlist `gorm:"foreignKey:PID" valid:"-"`  // เชื่อมโยงกับ Playlist ผ่าน PID
	
}
