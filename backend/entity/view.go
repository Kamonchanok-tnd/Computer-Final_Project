package entity

import (
	"time"
)


type View struct {
	ID uint `gorm:"primaryKey" json:"id" valid:"-"`

	UID  *uint `gorm:"index;column:uid" json:"uid" valid:"-"` // อนุญาตว่าง (guest)
	User Users `gorm:"foreignKey:UID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-" valid:"-"`

	WHID               uint               `gorm:"index;column:whid" json:"whid" valid:"required~กรุณาระบุเนื้อหา (WHID)"`
	WordHealingContent WordHealingContent `gorm:"foreignKey:WHID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-" valid:"-"`

	ReadMS      int       `gorm:"default:0" json:"readMS"      valid:"int,range(0|864000000)~เวลาที่อ่านต้องอยู่ระหว่าง 0–864000000 มิลลิวินาที"` // 0..10 วัน
	PctScrolled int       `gorm:"default:0" json:"pctScrolled" valid:"int,range(0|100)~เปอร์เซ็นต์การเลื่อนต้องอยู่ระหว่าง 0–100"`
	CreatedAt   time.Time `json:"createdAt"` // ให้ GORM จัดการเวลา
}