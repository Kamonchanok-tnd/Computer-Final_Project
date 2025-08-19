package entity

import "gorm.io/gorm"

type ArticleType struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
}
