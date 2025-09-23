// entity/feedback_seen.go
package entity

import (
    "time"
    "gorm.io/gorm"
)

type FeedbackSeen struct {
    gorm.Model
    UID            uint        `json:"uid" gorm:"index"`
    LastPromptAt   *time.Time  `json:"last_prompt_at,omitempty"`  // เวลาที่ "เด้งถาม" ล่าสุด
    LastSubmitAt   *time.Time  `json:"last_submit_at,omitempty"`  // เวลาที่ "ส่ง" ล่าสุด
    DismissedCount int         `json:"dismissed_count"`

    User Users `gorm:"foreignKey:UID"`
}
