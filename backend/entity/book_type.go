package entity

type BookType struct {
    ID   string `gorm:"primaryKey"`
    Type string
}
