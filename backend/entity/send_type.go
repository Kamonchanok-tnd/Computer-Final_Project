package entity

type SendType struct {
    ID   string `gorm:"primaryKey"`
    Type string
    Chats []Chat `gorm:"foreignKey:STID"`
}
