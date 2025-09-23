package entity

import (
	"time"
	"gorm.io/gorm"
)

type Mirror struct {
	gorm.Model
	Date    time.Time `json:"date"    valid:"required~กรุณาระบุวันที่"`
	Title   string    `json:"title"   valid:"stringlength(0|128)~หัวเรื่องยาวเกินไป"`
	Message string    `json:"message" valid:"stringlength(0|1000)~ข้อความยาวเกินไป"`
	EID     uint      `json:"eid"` // อนุญาตว่าง (0 = ไม่มีอิโมจิ)
	UID     uint      `json:"uid"   valid:"required~กรุณาระบุผู้ใช้"`
}