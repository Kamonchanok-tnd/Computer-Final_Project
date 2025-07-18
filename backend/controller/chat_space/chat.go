package controller

import (
	"context"
	"fmt"
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

	chat, err := client.Chats.Create(ctx, "gemini-2.0-flash", instruction, history)
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
   if err := c.ShouldBindJSON(&chatRoom); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
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
	var conversations []entity.Conversation
	db := config.DB()
	db.Where("chat_room_id = ?", c.Param("id")).Find(&conversations)
	c.JSON(http.StatusOK, conversations)
}