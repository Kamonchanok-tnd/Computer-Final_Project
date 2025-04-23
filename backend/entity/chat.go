package entity

type Chat struct {
    ID           string `gorm:"primaryKey"`
    Message      string
    Field        string
    ChatRoomID   string
    ChatRoom     ChatRoom `gorm:"foreignKey:ChatRoomID"`
    STID         string
    SendType     SendType `gorm:"foreignKey:STID"`
}
