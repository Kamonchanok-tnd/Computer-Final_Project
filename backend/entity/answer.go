package entity

type Answer struct {
    ID          string `gorm:"primaryKey"`
    Description string
    Point       int
    QID         string
}
