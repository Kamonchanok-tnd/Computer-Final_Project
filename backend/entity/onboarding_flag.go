package entity

import "time"

type OnboardingFlag struct {
	ID          uint      `gorm:"primaryKey"`
	UID         uint      `gorm:"uniqueIndex;not null"`
	MirrorSeen  bool      `gorm:"not null;default:false"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
