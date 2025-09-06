// package entity

package entity

import (
	"time"
)


type View struct {
	ID        uint      `gorm:"primaryKey"`

	UID       *uint     `gorm:"index;column:uid"`  // null = ผู้ใช้ไม่ล็อกอินก็ได้
	User      Users     `gorm:"foreignKey:UID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	WHID      uint      `gorm:"index;column:whid"` // อ้างไปที่ WordHealingContent.ID
	WordHealingContent   WordHealingContent `gorm:"foreignKey:WHID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	// meta เผื่อใช้ภายหลัง (ไม่จำเป็นต้องส่งมาก็ได้)
	ReadMS      int       `gorm:"default:0"`   // เวลาที่อ่าน (มิลลิวินาที)
	PctScrolled int       `gorm:"default:0"`   // % ที่เลื่อนอ่านสูงสุด
	CreatedAt   time.Time                      // เวลาเกิด record (ตอนถูกนับวิว)

}

