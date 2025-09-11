package entity
import (
	"gorm.io/gorm"
	"time"
)
type ASMR struct {
	gorm.Model
	Time time.Time
	UID uint `gorm:"not null"`
	Users Users `gorm:"foreignKey:UID"`
	RecentSettings []RecentSetting `gorm:"foreignKey:ASMRID"` // ระบุ foreignKey
}