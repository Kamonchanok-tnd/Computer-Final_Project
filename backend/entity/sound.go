package entity

import (
	"gorm.io/gorm"
)

type Sound struct {
	gorm.Model
	Name      string
	Sound     string
	Lyric     string
	Owner     string
	Description string
	Duration   float64
	LikeSound uint  `gorm:"default:0"`
	View      uint  `gorm:"default:0"`
	STID      uint      // Foreign key สำหรับ SoundType
	UID       uint      // Foreign key สำหรับ Users

	// ความสัมพันธ์กับตารางต่างๆ
	SoundType SoundType `gorm:"foreignKey:STID"`
	Users     Users     `gorm:"foreignKey:UID"`
	Reviews   []Review  `gorm:"foreignKey:SID"`  // เชื่อมโยงกับ Review ผ่าน SID
	Playlists []SoundPlaylist `gorm:"foreignKey:SID"` // เชื่อมโยงกับ SoundPlaylist ผ่าน SID
	Histories []History `gorm:"foreignKey:SID"`   // การเชื่อมโยงกับ History ผ่าน SID
}
