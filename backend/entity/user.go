package entity

type User struct {
    ID       string `gorm:"primaryKey"`
    Fname    string
    Lname    string
    CardID   string
    Age      int
    Major    string
    AYID     string
    AY       AcademicYear `gorm:"foreignKey:AYID"`
    GenderID string
    Gender   Gender       `gorm:"foreignKey:GenderID"`
}
