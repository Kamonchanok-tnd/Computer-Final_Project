package entity

import (
	"gorm.io/gorm"
)

type Users struct {
	gorm.Model
	Username    string `valid:"required~Username is required" json:"username"`
	Password    string `valid:"required~Password is required" json:"password"`
	Email       string `valid:"required~Email is required,email~Email format is invalid" json:"email"`
	Facebook    string `json:"facebook"`
	Line        string `json:"line"`
	PhoneNumber string `json:"phone_number"`
	Role        string `json:"role"`
	Age         int    `json:"age"`
	Gender      string `json:"gender"`
	

	// ความสัมพันธ์ One-to-Many กับ Feedback, Like, Mirror, AssessmentResult, Questionnaire, WordHealingContent, ChatRoom
	Feedbacks        []Feedback        `gorm:"foreignKey:UID"` 
	Likes            []Like            `gorm:"foreignKey:UID"`
	Mirrors          []Mirror          `gorm:"foreignKey:UID"`
	Sounds           []Sound           `gorm:"foreignKey:UID"`  // เพิ่ม foreign key สำหรับ Sounds
	Backgrounds      []Background      `gorm:"foreignKey:UID"`
	Reviews          []Review          `gorm:"foreignKey:UID"`
	Playlists        []Playlist        `gorm:"foreignKey:UID"`
	History          []History         `gorm:"foreignKey:UID"`
	AssessmentResults []AssessmentResult `gorm:"foreignKey:UID"`
	Questionnaires    []Questionnaire   `gorm:"foreignKey:UID"`
	ASMR         []ASMR `gorm:"foreignKey:UID"`
	ChatRooms         []ChatRoom           `gorm:"foreignKey:UID"`
}
