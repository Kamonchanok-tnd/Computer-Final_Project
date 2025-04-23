package entity

type SoundPlaylist struct {
    ID  string `gorm:"primaryKey"`
    SID string
    PID string
}
