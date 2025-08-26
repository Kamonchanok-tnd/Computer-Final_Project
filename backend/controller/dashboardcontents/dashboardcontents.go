package dashboardcontents

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"fmt"
	"github.com/gin-gonic/gin"
	"sort"
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


// func GetDailyViewsByTitle(c *gin.Context) {
// 	db := config.DB()
// 	var mirrors []entity.Mirror

// 	// ดึงข้อมูลทั้งหมดเรียงตามวันที่
// 	if err := db.Order("date asc").Find(&mirrors).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
// 		return
// 	}

// 	// สร้าง map เก็บข้อมูลรวมตามเดือน (format: "YYYY-MM")
// 	type MonthlyMirrorUsage struct {
// 		Year  int    `json:"year"`
// 		Month int    `json:"month"`
// 		Title string `json:"title"`
// 		Count int    `json:"count"`
// 	}

// 	monthlyMap := make(map[string]MonthlyMirrorUsage)

// 	for _, m := range mirrors {
// 		year, month, _ := m.Date.Date()
// 		key := fmt.Sprintf("%04d-%02d", year, month)

// 		if existing, exists := monthlyMap[key]; exists {
// 			existing.Count += 1
// 			monthlyMap[key] = existing
// 		} else {
// 			monthlyMap[key] = MonthlyMirrorUsage{
// 				Year:  year,
// 				Month: int(month),
// 				Title: m.Title, // ถ้าต้องการเก็บ title ของวันแรกของเดือน
// 				Count: 1,
// 			}
// 		}
// 	}

// 	// แปลง map เป็น slice
// 	var monthlyList []MonthlyMirrorUsage
// 	for _, v := range monthlyMap {
// 		monthlyList = append(monthlyList, v)
// 	}

// 	// เรียงตามปี-เดือน
// 	sort.Slice(monthlyList, func(i, j int) bool {
// 		if monthlyList[i].Year == monthlyList[j].Year {
// 			return monthlyList[i].Month < monthlyList[j].Month
// 		}
// 		return monthlyList[i].Year < monthlyList[j].Year
// 	})

// 	c.JSON(http.StatusOK, gin.H{"results": monthlyList})
// }


// --------------------------- Mirror ---------------------------
type DailyMirrorUsage struct {
	Day   string `json:"day"`
	Title string `json:"title"` // จะเก็บ Title ของวันแรกที่บันทึก
	Count int    `json:"count"`
}

func GetDailyMirrorUsage(c *gin.Context) {
	db := config.DB()
	var mirrors []entity.Mirror

	// ดึงข้อมูลทั้งหมดเรียงตามวันที่
	if err := db.Order("date asc").Find(&mirrors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	// สร้าง map เก็บข้อมูลรวมตามเดือน (format: "YYYY-MM")
	type MonthlyMirrorUsage struct {
		Year  int    `json:"year"`
		Month int    `json:"month"`
		Title string `json:"title"`
		Count int    `json:"count"`
	}

	monthlyMap := make(map[string]MonthlyMirrorUsage)

	for _, m := range mirrors {
		year, month, _ := m.Date.Date()
		key := fmt.Sprintf("%04d-%02d", year, month)

		if existing, exists := monthlyMap[key]; exists {
			existing.Count += 1
			monthlyMap[key] = existing
		} else {
			monthlyMap[key] = MonthlyMirrorUsage{
				Year:  year,
				Month: int(month),
				Title: m.Title, // ถ้าต้องการเก็บ title ของวันแรกของเดือน
				Count: 1,
			}
		}
	}

	// แปลง map เป็น slice
	var monthlyList []MonthlyMirrorUsage
	for _, v := range monthlyMap {
		monthlyList = append(monthlyList, v)
	}

	// เรียงตามปี-เดือน
	sort.Slice(monthlyList, func(i, j int) bool {
		if monthlyList[i].Year == monthlyList[j].Year {
			return monthlyList[i].Month < monthlyList[j].Month
		}
		return monthlyList[i].Year < monthlyList[j].Year
	})

	c.JSON(http.StatusOK, gin.H{"results": monthlyList})
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

    // 1. Word Healing
    // var wordHealing []TopContent
    // db.Model(&entity.WordHealingContent{}).
    //     Select("name, 'WordHealing' AS category, SUM(view_count) AS unique_users").
    //     Group("id, name").
    //     Scan(&wordHealing)

    // 2. ASMR (ใช้ histories)
    var asmr []TopContent
    db.Table("histories").
        Select("sounds.name, 'ASMR' AS category, COUNT(DISTINCT histories.uid) AS unique_users").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "asmr").
        Group("sounds.id, sounds.name").
        Scan(&asmr)

    // 3. Breathing / ฝึกหายใจ (ใช้ histories)
    var breathing []TopContent
    db.Table("histories").
        Select("sounds.name, 'Breathing' AS category, COUNT(DISTINCT histories.uid) AS unique_users").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "ฝึกหายใจ").
        Group("sounds.id, sounds.name").
        Scan(&breathing)

    // 4. Mirror (ดูจาก uid role = user)
    var mirror []TopContent
    db.Table("mirrors").
        Select("mirrors.title AS name, 'Mirror' AS category, COUNT(DISTINCT mirrors.uid) AS unique_users").
        Joins("JOIN users ON users.id = mirrors.uid").
        Where("users.role = ?", "user").
        Group("mirrors.id, mirrors.title").
        Scan(&mirror)

    // 5. Meditation / สมาธิ (ใช้ histories)
    var meditation []TopContent
    db.Table("histories").
        Select("sounds.name, 'Meditation' AS category, COUNT(DISTINCT histories.uid) AS unique_users").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "สมาธิ").
        Group("sounds.id, sounds.name").
        Scan(&meditation)

    // 6. Chanting / สวดมนต์ (ใช้ histories)
    var chanting []TopContent
    db.Table("histories").
        Select("sounds.name, 'Chanting' AS category, COUNT(DISTINCT histories.uid) AS unique_users").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "สวดมนต์").
        Group("sounds.id, sounds.name").
        Scan(&chanting)

    // 7. Like (นับจาก wid)
    var wordHealing []TopContent
db.Table("likes").
    Select("w_id AS name, 'WordHealing' AS category, COUNT(DISTINCT uid) AS unique_users").
    Group("w_id").
    Scan(&wordHealing)


    // รวมผลลัพธ์
    results = append(results, wordHealing...)
    results = append(results, asmr...)
    results = append(results, breathing...)
    results = append(results, mirror...)
    results = append(results, meditation...)
    results = append(results, chanting...)
    //results = append(results, likes...)

    c.JSON(200, gin.H{"results": results})
}



// Controller ดึงจำนวนการเล่นเสียงสมาธิและสวดมนต์ต่อวัน ต่อเพลง
// Controller ดึงจำนวนการเล่นเสียงแต่ละประเภทต่อเดือน
func GetSoundFourType(c *gin.Context) {
    db := config.DB()
    var results []struct {
        Year      int    `json:"year"`
        Month     int    `json:"month"`
        Category  string `json:"category"`
        PlayCount int    `json:"play_count"`
    }

    err := db.Model(&entity.History{}).
        Select("EXTRACT(YEAR FROM histories.created_at) as year, EXTRACT(MONTH FROM histories.created_at) as month, sound_types.type as category, COUNT(*) as play_count").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type IN ?", []string{"สมาธิ", "สวดมนต์", "ฝึกหายใจ", "asmr"}).
        Group("EXTRACT(YEAR FROM histories.created_at), EXTRACT(MONTH FROM histories.created_at), sound_types.type").
        Order("EXTRACT(YEAR FROM histories.created_at), EXTRACT(MONTH FROM histories.created_at)").
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
