package entity

import (
	"time"
	"gorm.io/gorm"
)

type WordHealingContent struct {
	gorm.Model

	Name     string    `json:"name" valid:"required~Name is required"`
	Author   string    `json:"author"  valid:"required~Author is required"`
	NoOfLike int       `json:"no_of_like"`
	Date     time.Time `json:"date"`
	Content string     `json:"content" valid:"required~Content is required"`

	ArticleTypeID uint        `json:"article_type_id" valid:"required~Article type is required"`
	ArticleType ArticleType   `json:"article_type" valid:"-" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	Photo *string    `json:"photo" gorm:"type:text;null" valid:"-"`
	ViewCount int    `json:"view_count"`
	Views     []View `valid:"-" gorm:"foreignKey:UID"`
}

