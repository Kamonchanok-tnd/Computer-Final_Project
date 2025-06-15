package entity

import (
	"gorm.io/gorm"
)

type BotModel struct {
	gorm.Model
	Name    string `json:"name"`
	ModelAi   string `json:"model_ai"`
	Using   bool   `json:"using"`
	APIKeys string `json:"api_keys"`
}