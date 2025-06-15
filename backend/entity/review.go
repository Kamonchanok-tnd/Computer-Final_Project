package entity

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Point int
	SID   uint // foreign key สำหรับ Sound
	UID   uint // foreign key สำหรับ Users

	// ความสัมพันธ์
	Sound Sound `gorm:"foreignKey:SID"` // เชื่อมโยงกับ Sound ผ่าน SID
	Users Users `gorm:"foreignKey:UID"`
}
