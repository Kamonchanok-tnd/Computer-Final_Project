package entity

type ChatRoom struct {
    ID   string `gorm:"primaryKey"`
    UID  string
    User User `gorm:"foreignKey:UID"`
    Chats []Chat `gorm:"foreignKey:ChatRoomID"`
}
