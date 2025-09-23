package entity

import (
	"gorm.io/gorm"
)

type Sound struct {
	gorm.Model
	Name      string `json:"name" valid:"required~Name is required"`
	Sound     string  `json:"sound" valid:"required~Sound path is required,youtube_url~Sound must be a valid YouTube URL"`
	Lyric     string	`json:"lyric"`
	Owner     string  `json:"owner" valid:"required~Owner is required"`
	Description string  `json:"description"`
	Duration   uint `json:"duration" valid:"required~Duration is required"`
	LikeSound uint  `gorm:"default:0" json:"like_sound"`
	View      uint  `gorm:"default:0" json:"view"`
	Score  		float64  `gorm:"default:0" json:"score"`
	STID      uint    `json:"stid" valid:"required~SoundType is required"`
	UID       uint     `json:"uid" valid:"required~UID is required"`

	// ความสัมพันธ์กับตารางต่างๆ
	SoundType SoundType `gorm:"foreignKey:STID" valid:"-"`
	Users     Users    `gorm:"foreignKey:UID" valid:"-"`
	Reviews   []Review  `gorm:"foreignKey:SID" valid:"-"`// เชื่อมโยงกับ Review ผ่าน SID
	Playlists []SoundPlaylist `gorm:"foreignKey:SID" valid:"-"` // เชื่อมโยงกับ SoundPlaylist ผ่าน SID
	Histories []History `gorm:"foreignKey:SID" valid:"-"`   // การเชื่อมโยงกับ History ผ่าน SID
}
