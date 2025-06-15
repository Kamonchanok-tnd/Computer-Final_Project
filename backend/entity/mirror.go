package entity

import (
	"time"
	"gorm.io/gorm"
)

type Mirror struct {
	gorm.Model
	Date    time.Time `json:"date"`
	Title   string    `json:"title"`
	Message string    `json:"message"`
	EID     uint      `json:"eid"`
	UID     uint      `json:"uid"`
}
