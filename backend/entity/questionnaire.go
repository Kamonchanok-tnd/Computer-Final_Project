package entity

type Questionnaire struct {
    ID       string `gorm:"primaryKey"`
    NameQus  string
    AID      string
}
