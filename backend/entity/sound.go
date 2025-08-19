package entity

import (
	"gorm.io/gorm"
)

type Sound struct {
	gorm.Model
	Name      string `json:"name"`
	Sound     string  `json:"sound"`
	Lyric     string	`json:"lyric"`
	Owner     string  `json:"owner"`
	Description string  `json:"description"`
	Duration   float64 `json:"duration"`
	LikeSound uint  `gorm:"default:0" json:"like_sound"`
	View      uint  `gorm:"default:0" json:"view"`
	Score  		float64  `gorm:"default:0" json:"score"`
	STID      uint    `json:"stid"`  // Foreign key สำหรับ SoundType 
	UID       uint     `json:"uid"` // Foreign key สำหรับ Users

	// ความสัมพันธ์กับตารางต่างๆ
	SoundType SoundType `gorm:"foreignKey:STID"`
	Users     Users     `gorm:"foreignKey:UID"`
	Reviews   []Review  `gorm:"foreignKey:SID"`  // เชื่อมโยงกับ Review ผ่าน SID
	Playlists []SoundPlaylist `gorm:"foreignKey:SID"` // เชื่อมโยงกับ SoundPlaylist ผ่าน SID
	Histories []History `gorm:"foreignKey:SID"`   // การเชื่อมโยงกับ History ผ่าน SID
}
