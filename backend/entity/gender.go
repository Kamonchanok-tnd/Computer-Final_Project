package entity

type Gender struct {
    ID     string `gorm:"primaryKey"`
    Gender string
}
