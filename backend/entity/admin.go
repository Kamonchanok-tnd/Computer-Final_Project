package entity

type Admin struct {
    ID       string `gorm:"primaryKey"`
    FName    string
    LName    string
    Age      int
    GenderID string
}
