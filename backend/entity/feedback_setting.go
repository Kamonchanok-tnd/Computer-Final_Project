// entity/feedback_setting.go
package entity

import "gorm.io/gorm"

type FeedbackSetting struct {
    gorm.Model
    Placement   string `json:"placement"`    // "home" (เริ่มจากเคสนี้)
    CadenceDays int    `json:"cadence_days"` // โชว์ซ้ำทุกกี่วัน เช่น 30
    IsEnabled   bool   `json:"is_enabled"`   // เปิด/ปิดการแสดง
}
