package entity

import (
	"time"
	"gorm.io/gorm"
	"fmt"
	"strings"
)

// Struct พร้อม valid tag สำหรับ govalidator
type WordHealingContent struct {
	gorm.Model
	Name        string     `json:"name"         valid:"required~Name is required"`
	Author      string     `json:"author"       valid:"required~Author is required"`
	Photo       *string    `json:"photo"        gorm:"type:text;null"` // optional
	NoOfLike    int        `json:"no_of_like"`
	Date        time.Time  `json:"date"`
	Content     string     `json:"content"      valid:"required~Content is required"`
	ArticleType string     `json:"article_type" valid:"required~Article type is required"`
	ViewCount   int        `json:"view_count"`
    Views []View `gorm:"foreignKey:UID"`
}

// ชุดค่าที่อนุญาตของ ArticleType
var allowedArticleTypeSet = map[string]struct{}{
	"quote": {},
	"poem":  {},
	"story": {},
}

// ฟังก์ชันตรวจ Business Rules
func ValidateWordHealingContent(w WordHealingContent) error {
	if strings.TrimSpace(w.Name) == "" {
		return fmt.Errorf("Name is required")
	}
	if strings.TrimSpace(w.Author) == "" {
		return fmt.Errorf("Author is required")
	}
	if w.Photo != nil && strings.TrimSpace(*w.Photo) == "" {
		return fmt.Errorf("Photo cannot be empty when provided")
	}
	if w.NoOfLike < 0 {
		return fmt.Errorf("NoOfLike must be >= 0")
	}
	if w.ViewCount < 0 {
		return fmt.Errorf("ViewCount must be >= 0")
	}
	if w.Date.IsZero() {
		return fmt.Errorf("Date is required")
	}
	if w.Date.After(time.Now()) {
		return fmt.Errorf("Date cannot be in the future")
	}
	if strings.TrimSpace(w.Content) == "" {
		return fmt.Errorf("Content is required")
	}
	if strings.TrimSpace(w.ArticleType) == "" {
		return fmt.Errorf("Article type is required")
	}
	if _, ok := allowedArticleTypeSet[strings.ToLower(strings.TrimSpace(w.ArticleType))]; !ok {
		return fmt.Errorf("Article type must be one of: quote, poem, story")
	}
	return nil
}
