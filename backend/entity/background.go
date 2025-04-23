package entity

type Background struct {
    ID     string `gorm:"primaryKey"`
    Name   string
    File   string
    AMID   string
    SID    string
}
