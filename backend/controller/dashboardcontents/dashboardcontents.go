package dashboardcontents

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"

	"github.com/gin-gonic/gin"
)

// Response struct
type DailySoundUsage struct {
	Date      string `json:"date"`
	SoundName string `json:"sound_name"`
	PlayCount int64  `json:"play_count"`
}


// Controller ดึงจำนวนการเล่นเสียงสมาธิต่อวัน ต่อเพลง
func GetSoundMeditation(c *gin.Context) {
    db := config.DB()
    var results []DailySoundUsage

    err := db.Model(&entity.History{}).
        Select("DATE(histories.created_at) as date, sound_types.type as category, sounds.name as sound_name, COUNT(*) as play_count").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "สมาธิ"). // ✅ ดึงเฉพาะ type = สมาธิ
        Group("DATE(histories.created_at), sound_types.type, sounds.name").
        Order("DATE(histories.created_at) ASC").
        Scan(&results).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    if len(results) == 0 {
        c.JSON(http.StatusOK, gin.H{"message": "No data found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"debug": "ok", "results": results})
}


// Controller ดึงจำนวนการเล่นเสียงสมาธิต่อวัน ต่อเพลง
func GetSoundChanting(c *gin.Context) {
    db := config.DB()
    var results []DailySoundUsage

    err := db.Model(&entity.History{}).
        Select("DATE(histories.created_at) as date, sound_types.type as category, sounds.name as sound_name, COUNT(*) as play_count").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "สวดมนต์"). // ✅ ดึงเฉพาะ type = สมาธิ
        Group("DATE(histories.created_at), sound_types.type, sounds.name").
        Order("DATE(histories.created_at) ASC").
        Scan(&results).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    if len(results) == 0 {
        c.JSON(http.StatusOK, gin.H{"message": "No data found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"debug": "ok", "results": results})
}
