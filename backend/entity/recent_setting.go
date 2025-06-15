package entity
import (
	"gorm.io/gorm"
)
type RecentSetting struct {
	gorm.Model
	Volume int
	ASMRID uint   // foreign key สำหรับ ASMR
	SID    uint

	// ความสัมพันธ์กับ ASMR
	ASMR ASMR `gorm:"foreignKey:ASMRID"`
	Sound Sound `gorm:"foreignKey:SID"`
}

