package controller

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"sukjai_project/config"
	"sukjai_project/entity"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/genai"
	"gorm.io/gorm"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Failed to load .env file")
	}
}

func Gemini() {
	ctx := context.Background()

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("GEMINI_API_KEY"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Println("❌ Error creating Gemini client:", err)
		return
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.0-flash",
		genai.Text("นายชื่ออะไร"),
		nil,
	)
	if err != nil {
		log.Println("❌ Error generating content:", err)
		return
	}

	fmt.Println("✅ Gemini response:", result.Text())
}

type Role string

const (
	RoleUser  Role = "user"
	RoleModel Role = "model"
)

func GeminiHistory(c *gin.Context) {
	
	var question entity.Conversation

	if err := c.ShouldBindJSON(&question); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("GEMINI_API_KEY"),
		Backend: genai.BackendGeminiAPI,
	})

	if err != nil {
		log.Println("❌ Error creating Gemini client:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Gemini client"})
		return
	}

	prompt := FormatPrompt()
	

	instruction := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(prompt, genai.RoleUser),
	}

	var historyConversations []entity.Conversation
	if err := config.DB().Where("chat_room_id = ?", question.ChatRoomID).Order("created_at asc").Find(&historyConversations).Error; err != nil {
		log.Println("❌ Error fetching history:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversation history"})
		return
	}

	// ✅ แปลงเป็น []*genai.Content
	var history []*genai.Content
	roleMap := map[uint]genai.Role{
		1: genai.RoleUser,
		2: genai.RoleModel,
	}

	for _, conv := range historyConversations {
		role := roleMap[conv.STID]
		history = append(history, genai.NewContentFromText(conv.Message, role))
	}

	chat, err := client.Chats.Create(ctx, "gemini-2.5-flash", instruction, history)
	if err != nil {
		log.Println("❌ Error creating chat:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create chat"})
		return
	}
	res, err := chat.SendMessage(ctx, genai.Part{Text: question.Message})
	if err != nil {
		log.Println("❌ Error sending message:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	if len(res.Candidates) > 0 {
		answer := res.Candidates[0].Content.Parts[0].Text
		config.DB().Create(&entity.Conversation{
			Message:    question.Message,
			ChatRoomID: question.ChatRoomID,
			STID: 1, // user
		})

		// บันทึกคำตอบ
		config.DB().Create(&entity.Conversation{
			Message:    answer,
			ChatRoomID: question.ChatRoomID,
			STID: 2, // bot
		})
		log.Println("question:",question.Message )
		log.Println("qid:", question.ChatRoomID)

		c.JSON(http.StatusOK, gin.H{"message": res.Candidates[0].Content.Parts[0].Text })

	}
}

func CreateChatRoom(c *gin.Context) {//เอาไว้สร้าง ห้อง chat
	db := config.DB()
	var chatRoom entity.ChatRoom
	if err := c.ShouldBindJSON(&chatRoom); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newChatRoom := entity.ChatRoom{
		StartDate: time.Now(),
		UID:       chatRoom.UID,
	}

	resault := db.Create(&newChatRoom)
	if resault.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": resault.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "create chat room success", "id": newChatRoom.ID})

}

func EndChatRoom(c *gin.Context) {//เอาไว้สิ้นสุด ห้อง chat
	var chatRoom entity.ChatRoom
	id := c.Param("id")
	db := config.DB()
    result := db.First(&chatRoom, id)
   if result.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
       return
   }
   
   chatRoom.EndDate = time.Now()
   chatRoom.IsClose = true
   result = db.Save(&chatRoom)
   if result.Error != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "Updated successful","data":chatRoom})
    

	 //เอาไว้สิ้นสุด ห้อง chat
}

func GetActivePrompt(db *gorm.DB) (*entity.Prompt, error) {

	var prompt entity.Prompt
	if err := db.Where("is_using = ?", true).First(&prompt).Error; err != nil {
		return nil, err
	}
	return &prompt, nil
}

func FormatPrompt() string {
	db := config.DB()
	p, err := GetActivePrompt(db)
	if err != nil {
		log.Println("ไม่พบ prompt:", err)
		return err.Error()
	}
	return fmt.Sprintf(
`Objective:
%s

Persona:
%s

Tone:
%s

Instructions:
%s

Constraints:
%s

Context:
%s



`, p.Objective, p.Persona, p.Tone, p.Instruction, p.Constraint, p.Context)
}

func GetConversationHistory(c *gin.Context) {
    db := config.DB()
    chatroomID := c.Param("id")

    // 1. ดึง uid จาก context (สมมติว่ามาจาก JWT middleware)
    uid, exists := c.Get("uid")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // 2. ตรวจสอบว่า chatroom นี้เป็นของ uid จริงหรือไม่
    var chatRoom entity.ChatRoom
    if err := db.Where("id = ? AND uid = ?", chatroomID, uid).First(&chatRoom).Error; err != nil {
        c.JSON(http.StatusForbidden, gin.H{"error": "You do not have access to this chatroom"})
        return
    }

    // 3. ดึง conversation history
    var conversations []entity.Conversation
    if err := db.Where("chat_room_id = ?", chatroomID).Find(&conversations).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // 4. ตอบกลับข้อมูล
    c.JSON(http.StatusOK,conversations)
}


func GetRecentChat(c *gin.Context) {
	uidStr := c.Query("uid") // รับจาก query param เช่น /recent-chat?uid=1
	uid, err := strconv.Atoi(uidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "uid must be an integer"})
		return
	}

	var chatRoom entity.ChatRoom
	db := config.DB()

	result := db.
		Where("is_close = ? AND uid = ?", false, uid).
		Order("created_at DESC").
		First(&chatRoom)

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, gin.H{
				"has_active": false,
				"chat_room_id": 0,
			})
			return
		} else if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

	c.JSON(http.StatusOK, gin.H{
		"has_active": true,
		"chat_room_id": chatRoom.ID,
	})
}

func ClearConversation(c *gin.Context) {
    db := config.DB()
    chatroomID := c.Param("id")

   
    if chatroomID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "chat_room_id is required"})
        return
    }

   
    tx := db.Where("chat_room_id = ?", chatroomID).Delete(&entity.Conversation{})

    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
        return
    }

    
    if tx.RowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"message": "No conversations found to delete"})
        return
    }

  
    c.JSON(http.StatusOK, gin.H{
        "message":       "Conversations cleared successfully",
        "deleted_count": tx.RowsAffected,
    })
}



// dashboard chat

func TotalUser(c*gin.Context) {
		var total int64
		db := config.DB()
		if err := db.Model(&entity.ChatRoom{}).Distinct("uid").Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"total_uid": total,
		})
}


func DashboardOverview(c *gin.Context) {
    type Overview struct {
        TotalChatRooms       int64   `json:"total_chat_rooms"`
        TotalMessages        int64   `json:"total_messages"`
        ActiveUsers          int64   `json:"active_users"`
        AvgAIResponseSeconds float64 `json:"avg_ai_response_seconds"`
    }

    db := config.DB()
    var overview Overview

    // รวมยอดทั้งหมด
    db.Model(&entity.ChatRoom{}).Count(&overview.TotalChatRooms)

    // ข้อความ user เท่านั้น
    db.Model(&entity.Conversation{}).
        Where("st_id = ?", 1).
        Count(&overview.TotalMessages)

    // Active users
    db.Model(&entity.ChatRoom{}).Distinct("uid").Count(&overview.ActiveUsers)

    // avg AI response time (เฉพาะ AI หลัง user ล่าสุด, 7 วันล่าสุด)
    type AIResp struct {
        AvgResponseSec float64
    }
    var aiResp AIResp

    query := `
    WITH user_messages AS (
        SELECT id, created_at
        FROM conversations
        WHERE st_id = 1
          AND created_at >= NOW() - INTERVAL '7 days'
    ),
    ai_messages AS (
        SELECT id, created_at
        FROM conversations
        WHERE st_id = 2
          AND created_at >= NOW() - INTERVAL '7 days'
    ),
    response_times AS (
        SELECT
            ai.id AS ai_id,
            EXTRACT(EPOCH FROM (ai.created_at - um.created_at)) AS response_seconds
        FROM ai_messages ai
        JOIN LATERAL (
            SELECT created_at
            FROM user_messages
            WHERE created_at < ai.created_at
            ORDER BY created_at DESC
            LIMIT 1
        ) um ON TRUE
    )
    SELECT AVG(response_seconds) AS avg_response_sec
    FROM response_times;
    `

    if err := db.Raw(query).Scan(&aiResp).Error; err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    overview.AvgAIResponseSeconds = aiResp.AvgResponseSec

    c.JSON(200, overview)
}



// 2. Daily usage
// 2. Daily usage
func DashboardUsage(c *gin.Context) {
	type DailyUsage struct {
		Date         time.Time `json:"date"`
		MessageCount int64     `json:"message_count"`
		DisplayLabel string    `json:"display_label"`
		Hour         int       `json:"hour,omitempty"`
	}

	type ErrorResponse struct {
		Error   string `json:"error"`
		Message string `json:"message"`
	}

	db := config.DB()
	if db == nil {
		c.JSON(500, ErrorResponse{
			Error:   "database_error",
			Message: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้",
		})
		return
	}

	filter := c.DefaultQuery("filter", "user")
	granularity := c.DefaultQuery("granularity", "today")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	// Validate filter
	if filter != "user" && filter != "all" {
		c.JSON(400, ErrorResponse{
			Error:   "invalid_filter",
			Message: "filter ต้องเป็น 'user' หรือ 'all' เท่านั้น",
		})
		return
	}

	// Validate granularity
	validGranularity := map[string]bool{
		"today": true, "day": true, "week": true,
		"month": true, "year": true, "custom": true,
	}
	if !validGranularity[granularity] {
		c.JSON(400, ErrorResponse{
			Error:   "invalid_granularity",
			Message: "granularity ไม่ถูกต้อง (ต้องเป็น today, day, week, month, year, หรือ custom)",
		})
		return
	}

	// Validate custom date range
	if granularity == "custom" {
		if startDate == "" || endDate == "" {
			c.JSON(400, ErrorResponse{
				Error:   "missing_dates",
				Message: "กรุณาระบุ start_date และ end_date สำหรับ custom granularity",
			})
			return
		}

		// Validate date format
		_, err := time.Parse("2006-01-02", startDate)
		if err != nil {
			c.JSON(400, ErrorResponse{
				Error:   "invalid_start_date",
				Message: "start_date ต้องอยู่ในรูปแบบ YYYY-MM-DD",
			})
			return
		}

		_, err = time.Parse("2006-01-02", endDate)
		if err != nil {
			c.JSON(400, ErrorResponse{
				Error:   "invalid_end_date",
				Message: "end_date ต้องอยู่ในรูปแบบ YYYY-MM-DD",
			})
			return
		}
	}

	// timezone Bangkok
	
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		// fallback to UTC+7
		loc = time.FixedZone("UTC+7", 7*60*60)
	}

	now := time.Now().In(loc)
	convQuery := db.Model(&entity.Conversation{})

	// เลือกเฉพาะข้อความจาก user
	if filter == "user" {
		convQuery = convQuery.Where("st_id = ?", 1)
	}

	// Prepare query result
	var convResults []struct {
		Date  time.Time
		Count int64
	}

	// Build query ตาม granularity
	switch granularity {
	case "today":
		start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc).UTC()
		end := start.AddDate(0, 0, 1)
		convQuery = convQuery.
			Select("DATE_TRUNC('hour', created_at) AS date, COUNT(*) AS count").
			Where("created_at >= ? AND created_at < ?", start, end).
			Group("DATE_TRUNC('hour', created_at)").
			Order("DATE_TRUNC('hour', created_at) ASC")

	case "day":
		start := now.AddDate(0, 0, -7).UTC()
		convQuery = convQuery.
			Select("DATE(created_at) AS date, COUNT(*) AS count").
			Where("created_at >= ?", start).
			Group("DATE(created_at)").
			Order("DATE(created_at) ASC")

	case "month":
		start := now.AddDate(0, -6, 0).UTC()
		convQuery = convQuery.
			Select("DATE_TRUNC('month', created_at) AS date, COUNT(*) AS count").
			Where("created_at >= ?", start).
			Group("DATE_TRUNC('month', created_at)").
			Order("DATE_TRUNC('month', created_at) ASC")

	case "year":
		start := now.AddDate(-1, 0, 0).UTC()
		convQuery = convQuery.
			Select("DATE_TRUNC('year', created_at) AS date, COUNT(*) AS count").
			Where("created_at >= ?", start).
			Group("DATE_TRUNC('year', created_at)").
			Order("DATE_TRUNC('year', created_at) ASC")

	case "custom":
		convQuery = convQuery.
			Select("DATE(created_at) AS date, COUNT(*) AS count").
			Where("DATE(created_at) BETWEEN ? AND ?", startDate, endDate).
			Group("DATE(created_at)").
			Order("DATE(created_at) ASC")
	}

	// Execute query with error handling
	if err := convQuery.Scan(&convResults).Error; err != nil {
		c.JSON(500, ErrorResponse{
			Error:   "query_error",
			Message: fmt.Sprintf("เกิดข้อผิดพลาดในการดึงข้อมูล: %v", err),
		})
		return
	}

	// เตรียม results
	var results []DailyUsage

	if granularity == "today" {
		// สร้าง 24 ชั่วโมงเต็ม
		results = make([]DailyUsage, 24)
		for h := 0; h < 24; h++ {
			results[h] = DailyUsage{
				Date:         time.Date(now.Year(), now.Month(), now.Day(), h, 0, 0, 0, loc),
				MessageCount: 0,
				DisplayLabel: fmt.Sprintf("%02d:00", h),
				Hour:         h,
			}
		}
		// Map ข้อมูลจาก DB
		for _, r := range convResults {
			hour := r.Date.In(loc).Hour()
			if hour >= 0 && hour < 24 {
				results[hour].MessageCount = r.Count
			}
		}
	} else {
		// granularity อื่น ๆ
		results = make([]DailyUsage, len(convResults))
		for i, r := range convResults {
			dateInBangkok := r.Date.In(loc)
			var displayLabel string
			switch granularity {
			case "day", "custom":
				displayLabel = dateInBangkok.Format("02/01")
			case "week":
				_, week := dateInBangkok.ISOWeek()
				displayLabel = fmt.Sprintf("W%02d", week)
			case "month":
				displayLabel = dateInBangkok.Format("Jan")
			case "year":
				displayLabel = dateInBangkok.Format("2006")
			default:
				displayLabel = dateInBangkok.Format("02/01")
			}

			results[i] = DailyUsage{
				Date:         dateInBangkok,
				MessageCount: r.Count,
				DisplayLabel: displayLabel,
			}
		}
	}

	// sort
	sort.Slice(results, func(i, j int) bool {
		return results[i].Date.Before(results[j].Date)
	})

	c.JSON(200, results)
}


// 3. Top users
func DashboardTopUsers(c *gin.Context) {
	///api/dashboard/users/top → Top Users (ตามจำนวนข้อความ)
	type TopUser struct {
		UID         uint  `json:"uid"`
		MessageCount int64 `json:"message_count"`
	}
	db := config.DB()
	var results []TopUser
	db.Model(&entity.Conversation{}).
		Select("chat_rooms.uid as uid, COUNT(conversations.id) as message_count").
		Joins("JOIN chat_rooms ON chat_rooms.id = conversations.chat_room_id").
		Group("chat_rooms.uid").
		Order("message_count DESC").
		Limit(10).
		Scan(&results)


	c.JSON(http.StatusOK, results)
}

// 4. Sessions status
func DashboardSessionsGender(c *gin.Context) {
    // /api/dashboard/sessions/status → ห้องเปิด-ปิด + เพศ
    type SessionGender struct {
        Gender  string `json:"gender"`
        Count   int64  `json:"count"`
    }

    db := config.DB()
    var results []SessionGender

    // JOIN users เพื่อนับจำนวนห้องแยกตามเพศและสถานะห้อง
	err := db.Table("chat_rooms").
	Select("users.gender, COUNT(chat_rooms.id) as count").
	Joins("JOIN users ON users.id = chat_rooms.uid").
	Group("users.gender").
	Scan(&results).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, results)
}


// 5. Sessions duration
func DashboardSessionsDuration(c *gin.Context) {
	///api/dashboard/sessions/duration → คำนวณเวลาการใช้งานเฉลี่ย
	type SessionDuration struct {
		ChatRoomID uint    `json:"chat_room_id"`
		Duration   float64 `json:"duration_seconds"`
	}
	db := config.DB()
	var results []SessionDuration
	var chatrooms []entity.ChatRoom
	db.Find(&chatrooms)

	for _, cr := range chatrooms {
		duration := cr.EndDate.Sub(cr.StartDate).Seconds()
		results = append(results, SessionDuration{
			ChatRoomID: cr.ID,
			Duration:   duration,
		})
	}

	c.JSON(http.StatusOK, results)
}

// GET /api/dashboard/active_users?granularity=day
func DashboardActiveUsers(c *gin.Context) {
    db := config.DB()
    granularity := c.Query("granularity") // "day", "week", "month"

    type ActiveUsers struct {
        Period string `json:"period"`
        Count  int64  `json:"count"`
    }

    var results []ActiveUsers

    query := db.Model(&entity.ChatRoom{}).
    Select("DATE(chat_rooms.created_at) as period, COUNT(DISTINCT chat_rooms.uid) as count").
    Joins("JOIN conversations ON conversations.chat_room_id = chat_rooms.id").
    Group("DATE(chat_rooms.created_at)").
    Order("DATE(chat_rooms.created_at) ASC")


    switch granularity {
    case "week":
		query = db.Model(&entity.ChatRoom{}).
			Select("DATE_TRUNC('week', chat_rooms.created_at) as period, COUNT(DISTINCT chat_rooms.uid) as count").
			Joins("JOIN conversations ON conversations.chat_room_id = chat_rooms.id").
			Group("DATE_TRUNC('week', chat_rooms.created_at)").
			Order("DATE_TRUNC('week', chat_rooms.created_at) ASC")
	
	case "month":
		query = db.Model(&entity.ChatRoom{}).
			Select("DATE_TRUNC('month', chat_rooms.created_at) as period, COUNT(DISTINCT chat_rooms.uid) as count").
			Joins("JOIN conversations ON conversations.chat_room_id = chat_rooms.id").
			Group("DATE_TRUNC('month', chat_rooms.created_at)").
			Order("DATE_TRUNC('month', chat_rooms.created_at) ASC")
	
    }

    if err := query.Scan(&results).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		println(err.Error())
        return
    }

    c.JSON(http.StatusOK, results)
}

// GET /api/dashboard/cohort?days=30
func DashboardCohort(c *gin.Context) {
    db := config.DB()
    days := 30 // default last 30 days

    type Cohort struct {
        SignupDate string `json:"signup_date"`
        DayOffset  int    `json:"day_offset"`
        Active     int64  `json:"active_users"`
    }

    var results []Cohort

    query := `
        WITH first_chat AS (
            SELECT uid, MIN(created_at)::date AS signup_date
            FROM chat_rooms
            GROUP BY uid
        ),
        activity AS (
            SELECT fc.signup_date,
                   (c.created_at::date - fc.signup_date) AS day_offset,
                   c.uid
            FROM first_chat fc
            JOIN chat_rooms cr ON cr.uid = fc.uid
            JOIN conversations c ON c.chat_room_id = cr.id
        )
        SELECT signup_date, day_offset, COUNT(DISTINCT uid) as active_users
        FROM activity
        WHERE day_offset < ?
        GROUP BY signup_date, day_offset
        ORDER BY signup_date, day_offset
    `

    if err := db.Raw(query, days).Scan(&results).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, results)
}
