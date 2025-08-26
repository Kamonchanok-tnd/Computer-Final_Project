package entity

import (
	"gorm.io/gorm"
	"time"
)

// บันทึกการเข้าใช้งานเว็บของผู้ใช้
type UserActivity struct {
	gorm.Model
	UID    uint      `json:"uid"`                    // เชื่อมกับ Users
	User      Users     `gorm:"foreignKey:UID"`
	Action    string    `json:"action"`                     // เช่น "login", "visit_page"
	Page      string    `json:"page"`                       // หน้าไหนที่เข้า เช่น "/dashboard"
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
