package entity
import (
	"gorm.io/gorm"
)
type Transaction struct {
	gorm.Model
	Description string `json:"description"`
	TotalScore  int    `json:"total_score"`
	ARID        uint   `json:"arid"`
} 
