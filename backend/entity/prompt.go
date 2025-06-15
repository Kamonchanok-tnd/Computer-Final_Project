package entity
import (
	"gorm.io/gorm"
)

type Prompt struct {
	gorm.Model
	Description string `json:"description"`
	Using       bool   `json:"using"`
}
