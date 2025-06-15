package entity

import (
	"gorm.io/gorm"
)

type Like struct {
	gorm.Model
	UID uint   `json:"uid"`
	WID uint   `json:"wid"`
}
