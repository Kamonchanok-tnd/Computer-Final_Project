package entity

import (
	"gorm.io/gorm"
)

type Emotion struct {
	gorm.Model
	Mood    string `json:"mood" valid:"required~Mood is required,stringlength(1|128)~Name too long"`
	Picture string `json:"picture" valid:"required~Picture is required,imageSource~picture must be .png/.jpg/.jpeg/.webp/.svg or data URL base64"`
}
