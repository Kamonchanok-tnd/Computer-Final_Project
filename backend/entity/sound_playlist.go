package entity

import (
	"gorm.io/gorm"
)

type SoundPlaylist struct {
	gorm.Model
	SID uint // foreign key ที่เชื่อมโยงกับ Sound
	PID uint // foreign key ที่เชื่อมโยงกับ Playlist

	// ความสัมพันธ์
	Sound    Sound    `gorm:"foreignKey:SID"`  // เชื่อมโยงกับ Sound ผ่าน SID
	Playlist Playlist `gorm:"foreignKey:PID"`  // เชื่อมโยงกับ Playlist ผ่าน PID
}
