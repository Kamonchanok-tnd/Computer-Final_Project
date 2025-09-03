package dashboardcontents

import (
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
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

    var totalTaken int64
    var averageScore float64
    var maxScore, minScore int

    // นับจำนวนครั้งทำแบบสอบถาม
    db.Model(&entity.Transaction{}).
        Joins("JOIN assessment_results ON assessment_results.id = transactions.ar_id").
        Where("assessment_results.qu_id = ?", quID).
        Count(&totalTaken)

    // ค่าเฉลี่ย, max, min
    db.Model(&entity.Transaction{}).
        Joins("JOIN assessment_results ON assessment_results.id = transactions.ar_id").
        Where("assessment_results.qu_id = ?", quID).
        Select("AVG(total_score), MAX(total_score), MIN(total_score)").
        Row().
        Scan(&averageScore, &maxScore, &minScore)

    // Trend: คะแนนเฉลี่ยต่อวัน (ล่าสุด 30 วัน)
    var trend []TrendItem
    rows, err := db.Raw(`
        SELECT DATE(assessment_results.date) as date, AVG(transactions.total_score) as avg_score
        FROM transactions
        JOIN assessment_results ON assessment_results.id = transactions.ar_id
        WHERE assessment_results.qu_id = ?
        GROUP BY DATE(assessment_results.date)
        ORDER BY DATE(assessment_results.date)
        LIMIT 30
    `, quID).Rows()
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
