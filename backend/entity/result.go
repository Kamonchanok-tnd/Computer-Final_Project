package entity

type Result struct {
    ID           string `gorm:"primaryKey"`
    Description  string
    CriteriaScore string
    QID          string
}
