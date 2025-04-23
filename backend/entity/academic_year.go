package entity

type AcademicYear struct {
    ID   string `gorm:"primaryKey"`
    Year string
}
