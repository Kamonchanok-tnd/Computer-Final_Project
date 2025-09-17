package entity

import (
	"time"

	"gorm.io/gorm"
)

type ASMR struct {
	gorm.Model
	Time            time.Time       `json:"time" valid:"required~กรุณาระบุเวลา"`
	UID             uint            `json:"uid"  gorm:"not null" valid:"required~กรุณาระบุผู้ใช้"`
	Users           Users           `gorm:"foreignKey:UID" valid:"-"`
	RecentSettings  []RecentSetting `gorm:"foreignKey:ASMRID" valid:"-"`
}
