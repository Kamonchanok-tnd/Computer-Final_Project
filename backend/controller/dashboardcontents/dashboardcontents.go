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


// DailyViewByTitle แสดงจำนวนการอ่านต่อวัน ต่อเรื่อง
type DailyViewByTitle struct {
	Date      string `json:"date"`
	Title     string `json:"title"`
	TotalViews int    `json:"total_views"`
}

// GetDailyViewsByTitle ดึงจำนวนการอ่านต่อวัน พร้อมชื่อเรื่อง
func GetDailyViewsByTitle(c *gin.Context) {
	db := config.DB()

	var results []DailyViewByTitle

	err := db.Model(&entity.WordHealingContent{}).
		Select("DATE(date) as date, name as title, SUM(view_count) as total_views").
		Group("DATE(date), name").
		Order("DATE(date) ASC").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(results) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No data found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}


// --------------------------- Mirror ---------------------------
type DailyMirrorUsage struct {
	Day   string `json:"day"`
	Title string `json:"title"` // จะเก็บ Title ของวันแรกที่บันทึก
	Count int    `json:"count"`
}

func GetDailyMirrorUsage(c *gin.Context) {
	db := config.DB()
	var mirrors []entity.Mirror

	if err := db.Order("date asc").Find(&mirrors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	dailyMap := make(map[string]DailyMirrorUsage)
	for _, m := range mirrors {
		day := m.Date.Format("2006-01-02")
		if _, exists := dailyMap[day]; !exists {
			dailyMap[day] = DailyMirrorUsage{
				Day:   day,
				Title: m.Title,
				Count: 1,
			}
		}
	}

	var dailyList []DailyMirrorUsage
	for _, v := range dailyMap {
		dailyList = append(dailyList, v)
	}

	c.JSON(http.StatusOK, gin.H{"results": dailyList})
}


// DailyVideoUsage แสดงจำนวนการเล่นวิดีโอต่อวัน
type DailyVideoUsage struct {
	Date      string `json:"date"`
	ViewCount int64  `json:"view_count"`
}

// GET /videos/daily-asmr
func GetDailyASMRUsage(c *gin.Context) {
	db := config.DB()
	var results []DailyVideoUsage

	err := db.Model(&entity.Sound{}).
		Select("DATE(sounds.created_at) as date, SUM(sounds.view) as view_count").
		Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
		Where("sound_types.type = ?", "ASMR").
		Group("DATE(sounds.created_at)").
		Order("DATE(sounds.created_at) ASC").
		Scan(&results).Error

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"results": results})
}


// GET /videos/daily-breathing
func GetDailyBreathingUsage(c *gin.Context) {
    db := config.DB()
    var results []DailyVideoUsage

    err := db.Model(&entity.Sound{}).
        Select("DATE(sounds.created_at) as date, SUM(sounds.view) as view_count").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "ฝึกหายใจ").
        Group("DATE(sounds.created_at)").
        Order("DATE(sounds.created_at) ASC").
        Scan(&results).Error

    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"results": results})
}



type TopContent struct {
    Name        string `json:"name"`
    Category    string `json:"category"`
    UniqueUsers int    `json:"unique_users"`
}

func GetTopContentComparison(c *gin.Context) {
    db := config.DB()
    var results []TopContent

    // 1. Word Healing / สวดมนต์
    var wordHealing []TopContent
db.Model(&entity.WordHealingContent{}).
    Select("name, 'WordHealing' AS category, SUM(view_count) AS unique_users").
    Group("id, name").
    Scan(&wordHealing)

    // 4. Mirror / ระบายความรู้สึก
    var mirror []TopContent
    db.Model(&entity.Mirror{}).
        Select("title AS name, 'Mirror' AS category, COUNT(DISTINCT uid) AS unique_users").
        Group("id, title").
        Scan(&mirror)

   
	// 2. ASMR
var asmr []TopContent
db.Table("sounds").
    Select("name, 'ASMR' AS category, SUM(view) AS unique_users").
    Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
    Where("sound_types.type = ?", "asmr").
    Group("sounds.id, sounds.name").
    Scan(&asmr)

// 3. Breathing / ฝึกหายใจ
var breathing []TopContent
db.Table("sounds").
    Select("name, 'Breathing' AS category, SUM(view) AS unique_users").
    Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
    Where("sound_types.type = ?", "ฝึกหายใจ").
    Group("sounds.id, sounds.name").
    Scan(&breathing)

// 5. Meditation / สมาธิ
var meditation []TopContent
db.Table("sounds").
    Select("name, 'Meditation' AS category, SUM(view) AS unique_users").
    Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
    Where("sound_types.type = ?", "สมาธิ").
    Group("sounds.id, sounds.name").
    Scan(&meditation)

// 6. Chanting / สวดมนต์
var chanting []TopContent
db.Table("sounds").
    Select("name, 'Chanting' AS category, SUM(view) AS unique_users").
    Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
    Where("sound_types.type = ?", "สวดมนต์").
    Group("sounds.id, sounds.name").
    Scan(&chanting)




    // รวมทุกประเภท
    results = append(results, wordHealing...)
    results = append(results, asmr...)
    results = append(results, breathing...)
    results = append(results, mirror...)
    results = append(results, meditation...)
	results = append(results, chanting...)

    c.JSON(200, gin.H{"results": results})
}

