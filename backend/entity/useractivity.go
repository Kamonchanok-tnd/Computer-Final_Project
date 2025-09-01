package entity

import (
	"gorm.io/gorm"
	"errors"
	"time"
)

// บันทึกการเข้าใช้งานเว็บของผู้ใช้
type UserActivity struct {
	gorm.Model
	UID      uint     `json:"uid" valid:"required~User ID is required"` // เชื่อมกับ Users
	User     Users     `gorm:"foreignKey:UID"`
	Action   string    `json:"action" valid:"required~Action is required"`
	Page     string    `json:"page" valid:"required~Page is required"`
 	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// ตรวจค่า UID เอง
func (u UserActivity) Validate() error {
	if u.UID == 0 {
		return errors.New("User ID is required")
	}
	if u.Action == "" {
		return errors.New("Action is required")
	}
	if u.Page == "" {
		return errors.New("Page is required")
	}
	return nil
}


