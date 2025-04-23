package entity

type Prompt struct {
    ID        string `gorm:"primaryKey"`
    Description string
    AdminID   string
}
