package entity

type Playlist struct {
    ID   string `gorm:"primaryKey"`
    Name string
    UID  string
}
