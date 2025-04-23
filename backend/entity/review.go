package entity

type Review struct {
    ID      string `gorm:"primaryKey"`
    Point   int
    Message string
    SID     string
    UID     string
}
