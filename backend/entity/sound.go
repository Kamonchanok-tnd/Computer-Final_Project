package entity

type Sound struct {
    ID      string `gorm:"primaryKey"`
    Name    string
    Sound   string
    Lyric   string
    STID    string
    AMID    string
}
