package entity

import (
	"gorm.io/gorm"
)

// ปรับเล็กน้อย: เพิ่ม index ช่วยค้นเร็วกขึ้น (ไม่เปลี่ยนโครง)
type Feedback struct {
    gorm.Model
    FeedbackText string `json:"feedback_text"`
    SID          uint   `json:"sid" gorm:"index"`
    UID          uint   `json:"uid" gorm:"index"`

    User  Users `gorm:"foreignKey:UID"`
    Score Score `gorm:"foreignKey:SID"`
}
