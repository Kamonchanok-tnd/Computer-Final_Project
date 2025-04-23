package entity

type Book struct {
    ID        string `gorm:"primaryKey"`
    Name      string
    Author    string
    Photo     string
    Date      string
    Publisher string
    Synopsis  string
    BTID      string
}
