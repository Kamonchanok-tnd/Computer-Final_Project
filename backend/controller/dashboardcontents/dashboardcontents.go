package dashboardcontents

import (
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sukjai_project/config"
	"sukjai_project/entity"
	"time"

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
        Where("sound_types.type = ?", "สวดมนต์"). 
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
// type DailyViewByTitle struct {
// 	Date      string `json:"date"`
// 	Title     string `json:"title"`
// 	TotalViews int    `json:"total_views"`
// }

// // GetDailyViewsByTitle ดึงจำนวนการอ่านต่อวัน พร้อมชื่อเรื่อง
// func GetDailyViewsByTitle(c *gin.Context) {
// 	db := config.DB()

// 	var results []DailyViewByTitle

// 	err := db.Model(&entity.WordHealingContent{}).
// 		Select("DATE(date) as date, name as title, SUM(view_count) as total_views").
// 		Group("DATE(date), name").
// 		Order("DATE(date) ASC").
// 		Scan(&results).Error

// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	if len(results) == 0 {
// 		c.JSON(http.StatusOK, gin.H{"message": "No data found"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"results": results})
// }

type DailyViewByTitle struct {
    Date       string `json:"date"`
    Title      string `json:"title"`
    TotalViews int    `json:"total_views"`
}

// ดึงจำนวนการอ่านต่อวัน พร้อมชื่อเรื่อง
func GetDailyViewsByTitle(c *gin.Context) {
    db := config.DB()

    var results []DailyViewByTitle

    err := db.Model(&entity.View{}).
        Select("DATE(views.created_at) as date, word_healing_contents.name as title, COUNT(views.id) as total_views").
        Joins("JOIN word_healing_contents ON views.whid = word_healing_contents.id").
        Group("DATE(views.created_at), word_healing_contents.name").
        Order("DATE(views.created_at) ASC").
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

	// สร้าง struct สำหรับเก็บข้อมูลรายวัน
	type DailyMirrorUsage struct {
		Year  int    `json:"year"`
		Month int    `json:"month"`
		Day   int    `json:"day"`
		Title string `json:"title"`
		Count int    `json:"count"`
	}

	dailyMap := make(map[string]DailyMirrorUsage)

	for _, m := range mirrors {
		year, month, day := m.Date.Date()
		key := fmt.Sprintf("%04d-%02d-%02d", year, month, day)

		if existing, exists := dailyMap[key]; exists {
			existing.Count += 1
			dailyMap[key] = existing
		} else {
			dailyMap[key] = DailyMirrorUsage{
				Year:  year,
				Month: int(month),
				Day:   day,
				Title: m.Title, // เก็บ title ของวันนั้น
				Count: 1,
			}
		}
	}

	// แปลง map เป็น slice
	var dailyList []DailyMirrorUsage
	for _, v := range dailyMap {
		dailyList = append(dailyList, v)
	}

	// เรียงตามปี-เดือน-วัน
	sort.Slice(dailyList, func(i, j int) bool {
		if dailyList[i].Year != dailyList[j].Year {
			return dailyList[i].Year < dailyList[j].Year
		}
		if dailyList[i].Month != dailyList[j].Month {
			return dailyList[i].Month < dailyList[j].Month
		}
		return dailyList[i].Day < dailyList[j].Day
	})

	c.JSON(http.StatusOK, gin.H{"results": dailyList})
}


// DailyVideoUsage แสดงจำนวนการเล่นวิดีโอต่อวัน
type DailyVideoUsage struct {
	Date      string `json:"date"`
	ViewCount int64  `json:"view_count"`
}

// GET /videos/daily-asmr
// func GetDailyASMRUsage(c *gin.Context) {
// 	db := config.DB()
// 	var results []DailyVideoUsage

// 	err := db.Model(&entity.Sound{}).
// 		Select("DATE(sounds.created_at) as date, SUM(sounds.view) as view_count").
// 		Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
// 		Where("sound_types.type = ?", "ASMR").
// 		Group("DATE(sounds.created_at)").
// 		Order("DATE(sounds.created_at) ASC").
// 		Scan(&results).Error

// 	if err != nil {
// 		c.JSON(500, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(200, gin.H{"results": results})
//}
func GetDailyASMRUsage(c *gin.Context) {
    db := config.DB()
    var results []DailySoundUsage

    err := db.Model(&entity.History{}).
        Select("DATE(histories.created_at) as date, sound_types.type as category, sounds.name as sound_name, COUNT(*) as play_count").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "asmr"). 
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





// GET /videos/daily-breathing
// func GetDailyBreathingUsage(c *gin.Context) {
//     db := config.DB()
//     var results []DailyVideoUsage

//     err := db.Model(&entity.Sound{}).
//         Select("DATE(sounds.created_at) as date, SUM(sounds.view) as view_count").
//         Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
//         Where("sound_types.type = ?", "ฝึกหายใจ").
//         Group("DATE(sounds.created_at)").
//         Order("DATE(sounds.created_at) ASC").
//         Scan(&results).Error

//     if err != nil {
//         c.JSON(500, gin.H{"error": err.Error()})
//         return
//     }

//     c.JSON(200, gin.H{"results": results})
// }

func GetDailyBreathingUsage(c *gin.Context) {
    db := config.DB()
    var results []DailySoundUsage

    err := db.Model(&entity.History{}).
        Select("DATE(histories.created_at) as date, sound_types.type as category, sounds.name as sound_name, COUNT(*) as play_count").
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type = ?", "ฝึกหายใจ"). 
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

    // --- Chat ---
var chat []TopContent
db.Table("chat_rooms").
    Select("'Chat' AS name, 'Chat' AS category, COUNT(DISTINCT uid) AS unique_users").
    Scan(&chat)

// --- Survey (Questionnaire) ---
var survey []TopContent
db.Table("assessment_results").
    Select("'Questionnaire' AS name, 'Questionnaire' AS category, COUNT(DISTINCT uid) AS unique_users").
    Scan(&survey)


    // รวมผลลัพธ์
    results = append(results, wordHealing...)
    results = append(results, asmr...)
    results = append(results, breathing...)
    results = append(results, mirror...)
    results = append(results, meditation...)
    results = append(results, chanting...)
    results = append(results, chat...)     // ✅ เพิ่ม Chat
results = append(results, survey...)   // ✅ เพิ่ม Survey
    // // --- เพิ่ม TotalUsers ---
	// var totalSurvey int64
	// if err := db.Model(&entity.AssessmentResult{}).Distinct("uid").Count(&totalSurvey).Error; err != nil {
	// 	c.JSON(500, gin.H{"error": "Failed to count survey users"})
	// 	return
	// }

	// var totalChat int64
	// if err := db.Model(&entity.ChatRoom{}).Distinct("uid").Count(&totalChat).Error; err != nil {
	// 	c.JSON(500, gin.H{"error": "Failed to count chat users"})
	// 	return
	// }

	c.JSON(200, gin.H{
		// "total_survey_users": totalSurvey,
		// "total_chat_users":   totalChat,
		"results":            results,
	})
}



// Controller ดึงจำนวนการเล่นเสียงสมาธิและสวดมนต์ต่อวัน ต่อเพลง
// Controller ดึงจำนวนการเล่นเสียงแต่ละประเภทต่อเดือน
func GetSoundFourType(c *gin.Context) {
    db := config.DB()
    var results []struct {
        Year      int    `json:"year"`
        Month     int    `json:"month"`
        Day       int    `json:"day"`
        Category  string `json:"category"`
        PlayCount int    `json:"play_count"`
    }

    err := db.Model(&entity.History{}).
        Select(`
            EXTRACT(YEAR FROM histories.created_at) as year,
            EXTRACT(MONTH FROM histories.created_at) as month,
            EXTRACT(DAY FROM histories.created_at) as day,
            sound_types.type as category,
            COUNT(*) as play_count
        `).
        Joins("JOIN sounds ON sounds.id = histories.s_id").
        Joins("JOIN sound_types ON sound_types.id = sounds.st_id").
        Where("sound_types.type IN ?", []string{"สมาธิ", "สวดมนต์", "ฝึกหายใจ", "asmr"}).
        Group("EXTRACT(YEAR FROM histories.created_at), EXTRACT(MONTH FROM histories.created_at), EXTRACT(DAY FROM histories.created_at), sound_types.type").
        Order("EXTRACT(YEAR FROM histories.created_at), EXTRACT(MONTH FROM histories.created_at), EXTRACT(DAY FROM histories.created_at)").
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


// dashboard survey

func GetDashboardSurveyOverview(c *gin.Context) {
	db := config.DB()
    type Overview struct {
        TotalQuestionnaire int64 `json:"total_questionnaires"`
        TotalAssessments   int64 `json:"total_assessments"`
        TotalUsers         int64 `json:"total_users"`
     
        // AverageScore float64 `json:"average_score"`
    }
    
    

	var overview Overview
	var err error

	// 1. นับจำนวนแบบทดสอบทั้งหมด
	if err = db.Model(&entity.Questionnaire{}).Count(&overview.TotalQuestionnaire).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to count questionnaires"})
		log.Println("Error counting questionnaires:", err)
		return
	}

	// 2. นับจำนวนการทำแบบทดสอบทั้งหมด
	if err = db.Model(&entity.AssessmentResult{}).Count(&overview.TotalAssessments).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to count assessments"})
		log.Println("Error counting assessments:", err)
		return
	}

	// 3. นับจำนวนผู้ใช้งานทั้งหมด (จากตาราง AssessmentResult เพื่อกรองผู้ที่ทำแบบทดสอบแล้ว)
	if err = db.Model(&entity.AssessmentResult{}).Distinct("uid").Count(&overview.TotalUsers).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to count unique users"})
		log.Println("Error counting unique users:", err)
		return
	}

	

	c.JSON(200, gin.H{"results": overview})
}

func GetQuestionnaireStats(c *gin.Context) {
    db := config.DB()
    type QuestionnaireStats struct {
        NameQuestionnaire string `json:"name_questionnaire"`
        TotalTaken        int64  `json:"total_taken"`
    }
    
    var stats []QuestionnaireStats

    err := db.Table("assessment_results AS ar").
    Select("q.name_questionnaire, COUNT(ar.id) AS total_taken").
    Joins("JOIN questionnaires q ON ar.qu_id = q.id").
    Group("q.id, q.name_questionnaire").
    Order("total_taken DESC").
    Scan(&stats).Error
    println(stats)

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, stats)
}


func GetSurveyVisualization(c *gin.Context) {
    db := config.DB()

    type Visualization struct {
        NameQuestionnaire string `json:"name_questionnaire"`
        ResultLevel       string `json:"result_level"`
        TotalCount        int64  `json:"total_count"`
        TotalTaken        int64  `json:"total_taken"` // รวมจำนวนครั้งทั้งหมด
    }

    var result []Visualization

    // ดึงข้อมูล grouped by result_level
    err := db.Table("transactions t").
        Select("q.name_questionnaire, t.result AS result_level, COUNT(*) AS total_count").
        Joins("JOIN assessment_results ar ON ar.id = t.ar_id").
        Joins("JOIN questionnaires q ON q.id = ar.qu_id").
        Group("q.name_questionnaire, t.result").
        Order("q.name_questionnaire, total_count DESC").
        Scan(&result).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // สร้าง map สำหรับรวมจำนวนทั้งหมดต่อแบบสอบถาม
    totals := map[string]int64{}
    for _, r := range result {
        totals[r.NameQuestionnaire] += r.TotalCount
    }

    // เพิ่ม TotalTaken ให้แต่ละ record
    for i := range result {
        result[i].TotalTaken = totals[result[i].NameQuestionnaire]
    }

    c.JSON(http.StatusOK, result)
}


func GetSurveyVisualizationByID(c *gin.Context) {
    // ทำ pie chart
    db := config.DB()
    id := c.Param("id")

    type Visualization struct {
        NameQuestionnaire string `json:"name_questionnaire"`
        ResultLevel       string `json:"result_level"`
        TotalCount        int64  `json:"total_count"`
    }

    var result []Visualization

    err := db.Table("transactions t").
        Select("q.name_questionnaire, t.result AS result_level, COUNT(*) AS total_count").
        Joins("JOIN assessment_results ar ON ar.id = t.ar_id").
        Joins("JOIN questionnaires q ON q.id = ar.qu_id").
        Where("q.id = ?", id).
        Group("q.name_questionnaire, t.result").
        Order("total_count DESC").
        Scan(&result).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, result)
}

func GetAverageScoreCard(c *gin.Context) {
    db := config.DB()

    type TrendItem struct {
        Date string  `json:"date"`
        Avg  float64 `json:"avgScore"`
    }

    type AverageScoreCardResponse struct {
        QuestionnaireID   uint        `json:"questionnaireId"`
        QuestionnaireName string      `json:"questionnaireName"`
        AverageScore      float64     `json:"averageScore"`
        TotalTaken        int64       `json:"totalTaken"`
        MaxScore          int         `json:"maxScore"`
        MinScore          int         `json:"minScore"`
        Trend             []TrendItem `json:"trend"`
    }

    quIDStr := c.Param("id")
    quID, err := strconv.ParseUint(quIDStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid questionnaire id"})
        return
    }

    var questionnaire entity.Questionnaire
    if err := db.First(&questionnaire, quID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "questionnaire not found"})
        return
    }

    gender := c.Query("gender")
    ageMinStr := c.Query("age_min")
    ageMaxStr := c.Query("age_max")

    var whereClauses []string
    var args []interface{}

    whereClauses = append(whereClauses, "assessment_results.qu_id = ?")
    args = append(args, quID)

    if gender != "" {
        whereClauses = append(whereClauses, "users.gender = ?")
        args = append(args, gender)
    }

    now := time.Now()

    if ageMinStr != "" {
        if ageMin, err := strconv.Atoi(ageMinStr); err == nil {
            birthBefore := now.AddDate(-ageMin, 0, 0).Format("2006-01-02")
            // แปลง birth_date (YYYY-MM) เป็น date โดยเติม -01
            whereClauses = append(whereClauses, "TO_DATE(users.birth_date || '-01', 'YYYY-MM-DD') <= ?")
            args = append(args, birthBefore)
        }
    }

    if ageMaxStr != "" {
        if ageMax, err := strconv.Atoi(ageMaxStr); err == nil {
            birthAfter := now.AddDate(-ageMax, 0, 0).Format("2006-01-02")
            whereClauses = append(whereClauses, "TO_DATE(users.birth_date || '-01', 'YYYY-MM-DD') >= ?")
            args = append(args, birthAfter)
        }
    }

    whereSQL := strings.Join(whereClauses, " AND ")

    var totalTaken int64
    var averageScore float64
    var maxScore, minScore int

    db.Model(&entity.Transaction{}).
        Joins("JOIN assessment_results ON assessment_results.id = transactions.ar_id").
        Joins("JOIN users ON users.id = assessment_results.uid").
        Where(whereSQL, args...).
        Count(&totalTaken)

    db.Model(&entity.Transaction{}).
        Joins("JOIN assessment_results ON assessment_results.id = transactions.ar_id").
        Joins("JOIN users ON users.id = assessment_results.uid").
        Where(whereSQL, args...).
        Select("AVG(total_score), MAX(total_score), MIN(total_score)").
        Row().
        Scan(&averageScore, &maxScore, &minScore)

    var trend []TrendItem
    rows, err := db.Raw(`
    SELECT TO_CHAR(TO_DATE(assessment_results.date, 'YYYY-MM-DD'), 'YYYY-MM-DD') as date, 
           AVG(transactions.total_score) as avg
    FROM transactions
    JOIN assessment_results ON assessment_results.id = transactions.ar_id
    JOIN users ON users.id = assessment_results.uid
    WHERE `+whereSQL+`
    GROUP BY TO_CHAR(TO_DATE(assessment_results.date, 'YYYY-MM-DD'), 'YYYY-MM-DD')
    ORDER BY date ASC
    LIMIT 30
`, args...).Rows()

    if err == nil {
        defer rows.Close()
        for rows.Next() {
            var t TrendItem
            rows.Scan(&t.Date, &t.Avg)
            trend = append(trend, t)
        }
    }

    resp := AverageScoreCardResponse{
        QuestionnaireID:   uint(quID),
        QuestionnaireName: questionnaire.NameQuestionnaire,
        AverageScore:      averageScore,
        TotalTaken:        totalTaken,
        MaxScore:          maxScore,
        MinScore:          minScore,
        Trend:             trend,
    }

    c.JSON(http.StatusOK, resp)
}

// GET /dashboard/questionnaire/detail/:userId
type RespondentTrend struct {
    Date  string  `json:"date"`
    Score float64 `json:"score"`
}

type RespondentWithTrend struct {
    UserID            uint               `json:"user_id"`
    Username          string             `json:"username"`
    QuestionnaireName string             `json:"questionnaire_name"`
    Score             float64            `json:"score"`
    Level             string             `json:"level"`
    TakenAt           string             `json:"taken_at"`
    SurveyType        string             `json:"survey_type"`
    Trend             []RespondentTrend  `json:"trend"`
}


// ฟังก์ชัน API
func GetRespondents(c *gin.Context) {
    db := config.DB()

    type UserSummary struct {
        ID       uint   `json:"id"`
        Username string `json:"username"`
        Avatar   string `json:"avatar"`
        Gender   string `json:"gender"`
        Email    string `json:"email"`
    }

    var respondents []UserSummary

    err := db.Model(&entity.Users{}).
    Distinct("users.id, users.username, pa.avatar AS avatar, users.gender, users.email").
    Joins("JOIN assessment_results ar ON users.id = ar.uid").
    Joins("JOIN profile_avatars pa ON users.pf_id = pa.id").
    Order("users.username").
    Scan(&respondents).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   "cannot fetch latest respondents",
            "details": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK,respondents)
    
}

func GetUserKPI(c *gin.Context) {
    db := config.DB()
    userID := c.Param("id")

    type UserKPI struct {
        TotalTaken    int        `json:"total_taken"`     // จำนวนครั้งที่เริ่มทำ
        Completed     int        `json:"completed"`       // จำนวนที่เสร็จแล้ว
        LastTakenDate string `json:"last_taken_date"` // วันที่ทำล่าสุด
    }

    var kpi UserKPI

    // Single GORM query
    err := db.Model(&entity.AssessmentResult{}).
        Select(`
            COUNT(DISTINCT assessment_results.id) AS total_taken,
            COUNT(DISTINCT transactions.id) AS completed,
            MAX(assessment_results.created_at) AS last_taken_date
        `).
        Joins("LEFT JOIN transactions ON transactions.ar_id = assessment_results.id").
        Where("assessment_results.uid = ?", userID).
        Scan(&kpi).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   "cannot fetch KPI",
            "details": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, kpi)
}

func GetUserAssessmentSummary(c *gin.Context) {
    db := config.DB()
    userID := c.Param("id")

    type UserAssessmentSummary struct {
        QuestionnaireName string `json:"questionnaire_name"`
        CountTaken        int    `json:"count_taken"`
    }

    var summary []UserAssessmentSummary

    err := db.Model(&entity.AssessmentResult{}).
        Select("questionnaires.name_questionnaire AS questionnaire_name, COUNT(*) AS count_taken").
        Joins("JOIN questionnaires ON questionnaires.id = assessment_results.qu_id").
        Where("assessment_results.uid = ?", userID).
        Group("questionnaires.id, questionnaires.name_questionnaire").
        Order("count_taken DESC").
        Scan(&summary).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   "cannot fetch user assessment summary",
            "details": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, summary)
}


func GetPrePostTransactionsCompare(c *gin.Context) {
    db := config.DB()
    uidStr := c.Query("uid")
    description := c.Query("description")

    uid, err := strconv.Atoi(uidStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid uid"})
        return
    }

    type ResultItem struct {
        QuestionnaireGroup string    `json:"questionnaire_group"`
        TotalScore         int       `json:"total_score"`
        Date               time.Time `json:"date"`
        SessionNumber      int       `json:"session_number"`
    }

    var results []ResultItem

    sql := `
    WITH t AS (
        SELECT t.questionnaire_group,
               t.total_score,
               ar.created_at AS ar_created_at
        FROM transactions t
        JOIN assessment_results ar ON ar.id = t.ar_id
        WHERE ar.uid = ? 
          AND t.description = ?
          AND t.questionnaire_group IN ('Pre-test','Post-test','Post-test Interval')
    )
    SELECT t.questionnaire_group,
           t.total_score,
           t.ar_created_at AS date,
           SUM(CASE WHEN t.questionnaire_group IN ('Pre-test','Post-test Interval') THEN 1 ELSE 0 END)
           OVER (PARTITION BY ? ORDER BY t.ar_created_at ROWS UNBOUNDED PRECEDING) AS session_number
    FROM t
    ORDER BY t.ar_created_at
    `

    err = db.Raw(sql, uid, description, description).Scan(&results).Error
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, results)
}



func GetStandaloneTransactionsPersonal(c *gin.Context) {
    db := config.DB()
    uidStr := c.Query("uid")
    description := c.Query("description") // แบบสอบถาม เช่น 'แบบวัดระดับความสุข คะแนน 0-10'
   

    uid, err := strconv.Atoi(uidStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid uid"})
        return
    }

    type ResultItem struct {
        QuestionnaireGroup string    `json:"questionnaire_group"`
        TotalScore         int       `json:"total_score"`
        Date               time.Time `json:"date"`
    }

    var results []ResultItem
    err = db.Table("transactions t").
        Select("t.questionnaire_group, t.total_score, ar.created_at AS date").
        Joins("JOIN assessment_results ar ON ar.id = t.ar_id").
        Where("ar.uid = ? AND t.description = ? ", uid, description, ).
        Order("ar.created_at ASC").
        Scan(&results).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, results)
}

func GetDescriptionSummary(c *gin.Context) {
    db := config.DB()
    uidStr := c.Query("uid")
    description := c.Query("description")

    type QuestionnaireSummary struct {
        LatestScore   int      `json:"latest_score"`
        PreviousScore *int     `json:"previous_score"` // pointer เผื่อไม่มี previous
        LatestResult  string   `json:"latest_result"`
        AverageScore  float64  `json:"average_score"`
    }
    

    uid, err := strconv.Atoi(uidStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid uid"})
        return
    }

    var result QuestionnaireSummary

    subQuery := db.Table("transactions t2").
        Select("t2.total_score, t2.result, ROW_NUMBER() OVER(ORDER BY ar.created_at DESC, t2.id DESC) AS rn").
        Joins("JOIN assessment_results ar ON ar.id = t2.ar_id").
        Where("ar.uid = ? AND t2.description = ?", uid, description)

    err = db.Table("transactions t").
        Select(`
            MAX(CASE WHEN sub.rn = 1 THEN sub.total_score END) AS latest_score,
            MAX(CASE WHEN sub.rn = 2 THEN sub.total_score END) AS previous_score,
            MAX(CASE WHEN sub.rn = 1 THEN sub.result END) AS latest_result,
            ROUND(AVG(sub.total_score)::numeric, 2) AS average_score
        `).
        Joins("JOIN (?) sub ON true", subQuery). // join inline subquery
        Scan(&result).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, result)
}
