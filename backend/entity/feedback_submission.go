package entity

import (
	"time"

	"gorm.io/gorm"
)

// การส่งฟีดแบ็ก 1 ครั้งของผู้ใช้ (กล่องรวมคำตอบหลายข้อ)
type FeedbackSubmission struct {
	gorm.Model

	SubmittedAt time.Time `json:"submitted_at"`

	UID  uint  `json:"uid" gorm:"index;uniqueIndex:uniq_user_period"` // ใช้คู่ period_key ถ้าคุมเดือนละครั้ง
	User Users `json:"-"  gorm:"foreignKey:UID;references:ID"`

	// เช่น "2025-09" ถ้าต้องการ enforce เดือนละครั้ง (ดู unique ด้านบน)
	PeriodKey *string `json:"period_key" gorm:"index;uniqueIndex:uniq_user_period"`

	Source *string `json:"source"` // "web" | "app" (optional)

	// ลบ submission → ลบ answers ทั้งหมด
	Answers []FeedbackAnswer `json:"answers,omitempty" gorm:"foreignKey:SubmissionID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
