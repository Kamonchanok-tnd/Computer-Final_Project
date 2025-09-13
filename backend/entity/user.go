package entity

import (
	"gorm.io/gorm"
	"time"
)

type Users struct {
	gorm.Model
	Username    string `valid:"required~กรุณากรอกชื่อผู้ใช้" json:"username"`
	Password    string `valid:"required~กรุณากรอกรหัสผ่าน" json:"password"`
	Email       string `valid:"required~กรุณากรอกอีเมล,email~รูปแบบอีเมลไม่ถูกต้อง" json:"email"`
	Facebook    string `json:"facebook"`
	Line        string `json:"line"`
	PhoneNumber string `valid:"required~กรุณากรอกเบอร์โทรศัพท์,matches(^0[0-9]{9}$)~รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" json:"phone_number"`

	Role        string `json:"role"`
	Age         int    `json:"age"`
	BirthDate   string `json:"birth_date"`
	Gender      string `json:"gender"`


	PFID          uint          `json:"pfid" gorm:"default:1"`
	ProfileAvatar ProfileAvatar `gorm:"foreignKey:PFID" valid:"required~กรุณาเพิ่ม Avatar;required~กรุณากรอกชื่อ Avatar"`


	ResetToken       string    `json:"reset_token"`
	ResetTokenExpiry time.Time `json:"reset_token_expiry"`

	ConsentAccepted   bool      `json:"consent_accepted"`    // true = กดยินยอม
	ConsentAcceptedAt time.Time `json:"consent_accepted_at"` // เวลากดยินยอม

	Feedbacks         []Feedback         `gorm:"foreignKey:UID" valid:"-"`
	Likes             []Like             `gorm:"foreignKey:UID" valid:"-"`
	Mirrors           []Mirror           `gorm:"foreignKey:UID" valid:"-"`
	Sounds            []Sound            `gorm:"foreignKey:UID" valid:"-"`
	Backgrounds       []Background       `gorm:"foreignKey:UID" valid:"-"`
	Reviews           []Review           `gorm:"foreignKey:UID" valid:"-"`
	Playlists         []Playlist         `gorm:"foreignKey:UID" valid:"-"`
	History           []History          `gorm:"foreignKey:UID" valid:"-"`
	AssessmentResults []AssessmentResult `gorm:"foreignKey:UID" valid:"-"`
	Questionnaires    []Questionnaire    `gorm:"foreignKey:UID" valid:"-"`
	ASMR              []ASMR             `gorm:"foreignKey:UID" valid:"-"`
	ChatRooms         []ChatRoom         `gorm:"foreignKey:UID" valid:"-"`
	Views             []View             `gorm:"foreignKey:UID"`
}
