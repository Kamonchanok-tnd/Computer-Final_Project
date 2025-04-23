package entity

type Mirror struct {
    ID      string `gorm:"primaryKey"`
    Date    string
    Title   string
    Mode    string
    Message string
    UID     string
}
