package entity

import "gorm.io/gorm"


// entity/emotion_choice.go (เหมือนเดิม)
type EmotionChoice struct {
    gorm.Model
    Name    string `json:"name"    valid:"required~กรุณาระบุชื่ออารมณ์,stringlength(1|128)~ชื่ออารมณ์ยาวเกินไป"`
    Picture string `json:"picture" valid:"required~กรุณาระบุรูปภาพ,imageSource~รูปภาพต้องเป็นไฟล์ .png/.jpg/.jpeg/.webp/.svg หรือ data URL แบบ base64"`
    AnswerOptions []AnswerOption `gorm:"foreignKey:EmotionChoiceID" json:"answerOptions" valid:"-"`
}
