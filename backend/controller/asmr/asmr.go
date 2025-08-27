package asmr

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateASMR บันทึกข้อมูล ASMR ของผู้ใช้ พร้อม recent settings
func CreateASMR(c *gin.Context) {
	db := config.DB()

	// รับข้อมูลจาก JSON
	var input struct {
		UID            uint `json:"uid" binding:"required"`
		Duration       int  `json:"duration"` // นาทีที่ผู้ใช้เลือกฟัง
		RecentSettings []struct {
			SID    uint `json:"sid"`
			Volume int  `json:"volume"`
		} `json:"recentSettings"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง ASMR record
	asmr := entity.ASMR{
		UID:  input.UID,
		Time: time.Now(),
	}

	if err := db.Create(&asmr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ASMR record"})
		return
	}

	// บันทึก recent settings ถ้ามี
	for _, rs := range input.RecentSettings {
		recent := entity.RecentSetting{
			ASMRID: asmr.ID,
			SID:    rs.SID,
			Volume: rs.Volume,
		}
		if err := db.Create(&recent).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create recent setting"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ASMR record created successfully",
		"asmr":    asmr,
	})
}
