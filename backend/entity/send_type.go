package entity
import (
	"gorm.io/gorm"
)
type SendType struct {
	gorm.Model
	Type string `json:"type"`
}