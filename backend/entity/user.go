package entity

import (
	"gorm.io/gorm"
	"time"
)

type Users struct {
	gorm.Model
	Username    string `valid:"required~Username is required" json:"username"`
	Password    string `valid:"required~Password is required" json:"password"`
	Email       string `valid:"required~Email is required,email~Email format is invalid" json:"email"`
	Facebook    string `json:"facebook"`
	Line        string `json:"line"`
	PhoneNumber string `valid:"required~Phone number is required,matches(^0[0-9]{9}$)~Phone number format is invalid" json:"phone_number"`

	Role        string `json:"role"`
	Age         int    `json:"age"`
	BirthDate   string `json:"birth_date"`
	Gender      string `json:"gender"`

	PFID      uint    `json:"pfid" gorm:"default:1"`
	ProfileAvatar ProfileAvatar `gorm:"foreignKey:PFID" valid:"-"`

	// เพิ่ม attributes สำหรับการรีเซ็ตรหัสผ่าน
	ResetToken          string    `json:"reset_token" `
	ResetTokenExpiry    time.Time `json:"reset_token_expiry"`

	// ✅ ฟิลด์สำหรับการเก็บ Consent
	ConsentAccepted   bool      `json:"consent_accepted"`    // true = กดยินยอม
	ConsentAcceptedAt time.Time `json:"consent_accepted_at"` // เวลากดยินยอม

	

	// ความสัมพันธ์ One-to-Many กับ Feedback, Like, Mirror, AssessmentResult, Questionnaire, WordHealingContent, ChatRoom
	Feedbacks        []Feedback        `gorm:"foreignKey:UID" valid:"-"` 
	Likes            []Like            `gorm:"foreignKey:UID" valid:"-"`
	Mirrors          []Mirror          `gorm:"foreignKey:UID" valid:"-"`
	Sounds           []Sound           `gorm:"foreignKey:UID" valid:"-"`  // เพิ่ม foreign key สำหรับ Sounds
	Backgrounds      []Background      `gorm:"foreignKey:UID" valid:"-"`
	Reviews          []Review          `gorm:"foreignKey:UID" valid:"-"`
	Playlists        []Playlist        `gorm:"foreignKey:UID" valid:"-"`
	History          []History         `gorm:"foreignKey:UID" valid:"-"`
	AssessmentResults []AssessmentResult `gorm:"foreignKey:UID" valid:"-"`
	Questionnaires    []Questionnaire   `gorm:"foreignKey:UID" valid:"-"`
	ASMR         []ASMR `gorm:"foreignKey:UID" valid:"-"`
	ChatRooms         []ChatRoom           `gorm:"foreignKey:UID" valid:"-"`
	Views []View `gorm:"foreignKey:UID" `

}
