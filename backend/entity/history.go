package entity

type History struct {
    ID   string `gorm:"primaryKey"`
    UID  string
    SID  string
}
