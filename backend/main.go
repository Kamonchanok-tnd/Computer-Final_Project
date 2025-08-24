package main

import (
	"log" // เพิ่มการนำเข้า log
	"net/http"
	"os" // เพิ่มการนำเข้า os
	"sukjai_project/config"
	history "sukjai_project/controller/History"
	"sukjai_project/controller/admin"
	"sukjai_project/controller/assessment"
	"sukjai_project/controller/background"
	"sukjai_project/controller/breathing"
	controller "sukjai_project/controller/chat_space"
	"sukjai_project/controller/emotion"
	"sukjai_project/controller/meditation"
	"sukjai_project/controller/mirror"
	"sukjai_project/controller/playlist"
	"sukjai_project/controller/prompt"
	"sukjai_project/controller/questionnaire"
	"sukjai_project/controller/resettoken"
	"sukjai_project/controller/reviewsound"
	"sukjai_project/controller/soundplaylist"
	"sukjai_project/controller/sounds"
	"sukjai_project/controller/users"
	"sukjai_project/controller/wordhealingmessage"
	"sukjai_project/middlewares"


	// "fmt"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv" // เพิ่มการนำเข้า godotenv
)

const PORT = "8000"

func init() {
	// โหลดไฟล์ .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {

	gin.SetMode(gin.DebugMode) // เพิ่มบรรทัดนี้เพื่อให้ log แสดงใน terminal

	// open connection database
	config.ConnectionDB()
	// Generate databases
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// ทดสอบการดึงค่า JWT_SECRET_KEY จาก .env
	secretKey := os.Getenv("JWT_SECRET_KEY")
	if secretKey == "" {
		log.Fatal("JWT_SECRET_KEY is not set in the environment")
	}
	log.Println("JWT_SECRET_KEY:", secretKey) // แสดงค่า JWT_SECRET_KEY ในคอนโซล

	// ทดสอบการส่งอีเมล
	// err := users.SendEmail("b6526436@g.sut.ac.th", "Test Subject", "<h1>This is a test email</h1>")
	// if err != nil {
	//     fmt.Println("Error:", err)
	// } else {
	//     fmt.Println("Test email sent successfully!")
	// }

	// Auth Routes
	r.Static("/BgImage", "./images/background")
	r.Static("/images/emoji", "./images/emoji")
	r.Static("/images/emotion_choice", "./images/emotion_choice")

	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)
	r.POST("/forgot-password", users.ForgotPasswordController)
	r.POST("/validate-reset-token", resettoken.ValidateResetTokenController)
	r.PATCH("/update-password", resettoken.UpdatePasswordController) // ฟังก์ชันอัพเดตรหัสผ่านใหม่
	r.GET("/recent", controller.GetRecentChat)

	

	// Protect routes with role-based access
	router := r.Group("/")
	{
		// Routes for admins only
		router.Use(middlewares.Authorizes("admin"))

		router.GET("/admin", admin.GetAllAdmin)
		router.GET("/admin/:id", admin.GetAdminById)
		router.PUT("/adminyourself/:id", admin.EditAdminYourself)

        // Prompt routes
		router.POST("/admin/prompt", prompt.CreatePrompt)
		router.GET("/admin/prompt", prompt.GetAllPrompts)
		router.DELETE("/admin/prompt/:id", prompt.DeletePrompt)
		router.PUT("/admin/prompt/:id", prompt.UpdatePrompt)
		router.POST("/admin/prompt/use/:id", prompt.NowPrompt)
		router.GET("/admin/prompt/:id", prompt.GetPromptByID)

        //router.POST("/admin/prompt", prompt.CreatePrompt)
        //router.GET("/admin/prompt", prompt.GetAllPrompts)
       // router.DELETE("/admin/prompt/:id", prompt.DeletePrompt)
        // router.PUT("/admin/prompt/:id", prompt.UpdatePrompt)
        // router.POST("/admin/prompt/use/:id", prompt.NowPrompt)
        // router.GET("/admin/prompt/:id", prompt.GetPromptByID)
        
		//Questionnaire routes
        router.GET("/questionnaires", questionnaire.GetAllQuestionnaires)                  // route ดึงแบบทดสอบทั้งหมด
        router.GET("/users", questionnaire.GetAllUsers)                                    // route ดึงผู้ใช้ทั้งหมด
		router.GET("/getallemotionchoices", questionnaire.GetAllEmotionChoices)            // route ดึงตัวเลือกอีโมจิทั้งหมด
        router.POST("/createQuestionnaires", questionnaire.CreateQuestionnaire)            // route สำหรับสร้างแบบทดสอบ (Questionnaire)
        router.POST("/createQuestions", questionnaire.CreateQuestions)                     // route สำหรับสร้างข้อคำถามเเละคำตอบ (Questions and Answers)
        router.POST("/createCriterias", questionnaire.CreateCriterias)                     // route สำหรับสร้างเกณฑ์การให้คะแนน (Criterias)

        router.DELETE("/deletequestionnaire/:id", questionnaire.DeleteQuestionnaire)       // route สำหรับลบเเบบทดสอบ คำถามเเละคำตอบ
        router.DELETE("/deletequestion/:id", questionnaire.DeleteQuestion)                 // route สำหรับลบคำถามเเละคำตอบ พร้อมอัพเดตจำนวนข้อ
        router.DELETE("/deleteanswer/:id", questionnaire.DeleteAnswer)                     // route สำหรับลบคำตอบ

		router.GET("/getquestionnaire/:id", questionnaire.GetQuestionnaire)         // route สำหรับดึงค่าเก่าเเบบทดสอบ
		router.PATCH("/updatequestionnaire/:id", questionnaire.UpdateQuestionnaire) // route สำหรับเเก้ไขเเบบทดสอบ

        // Assessment routes
        router.GET("/admin/questionnaire-groups", assessment.GetAllQuestionnaireGroups)
        router.GET("/admin/questionnaire-groups/:id", assessment.GetQuestionnaireGroupByID)
        router.PATCH("/admin/questionnaire-groups/:id/frequency", assessment.UpdateQuestionnaireGroupFrequency)
		router.PUT("/admin/questionnaire-groups/:id/order", assessment.ReorderQuestionnairesInGroup)


        //Healing mesage route
        router.GET("/getallwordhealingmessage", wordhealingmessage.GetAllWordhealingmessages)           // route ดึงบทความทั้งหมด
        router.POST("/createwordhealingmessage", wordhealingmessage.CreateWordHealingMessages)          // route สำหรับสร้างบทความ (WordHealingMesasage)
        router.DELETE("/deletewordhealingmessage/:id", wordhealingmessage.DeleteWordHealingContent)     // route สำหรับลบบทความ (WordHealingMesasage)
        router.GET("/getwordhealingmessage/:id", wordhealingmessage.GetWordHealingMessage)              // route สำหรับดึงค่าเก่าบทความ
        router.PATCH("/updatewordhealingmessage/:id", wordhealingmessage.UpdateWordHealingMessage)      // route สำหรับเเก้ไขเเบบบทความ
		router.PATCH("/updateviewcountmessage/:id", wordhealingmessage.UpdateViewcountMessage)          // route สำหรับเพิ่มจำนวนการเข้าชมบทความ
        router.GET("/getarticletype", wordhealingmessage.GetArticleTypes)                               // route สำหรับดึงประเภทของบทความไปใช้ใน dropdown


		// //Healing mesage route
		// router.GET("/getallwordhealingmessage", wordhealingmessage.GetAllWordhealingmessages)       // route ดึงบทความทั้งหมด
		// router.POST("/createwordhealingmessage", wordhealingmessage.CreateWordHealingMessages)      // route สำหรับสร้างบทความ (WordHealingMesasage)
		// router.DELETE("/deletewordhealingmessage/:id", wordhealingmessage.DeleteWordHealingContent) // route สำหรับลบบทความ (WordHealingMesasage)
		// router.GET("/getwordhealingmessage/:id", wordhealingmessage.GetWordHealingMessage)          // route สำหรับดึงค่าเก่าบทความ
		// router.PATCH("/updatewordhealingmessage/:id", wordhealingmessage.UpdateWordHealingMessage)  // route สำหรับเเก้ไขเเบบบทความ
		// router.GET("/getarticletype", wordhealingmessage.GetArticleTypes)                           // route สำหรับดึงประเภทของบทความไปใช้ใน dropdown

        // Video routes
        router.POST("/videos", meditation.CreateVideo)
		router.GET("/sound-types", meditation.GetSoundTypes)
		router.GET("/AllSounds", sounds.GetAllSounds)
		router.GET("/Sound/:id", sounds.GetSoundByID)
		router.PATCH("/Sound/Update/:id", sounds.EditSound)
		router.DELETE("/Sound/Delete/:id", sounds.DeleteSoundByID)
		router.GET("/sounds/type/:typeID", sounds.GetSoundsByType)

		//review sound
		router.POST("/ReviewSound", reviewsound.CreateReview)
		router.PATCH("/UpdateReviewSound", reviewsound.UpdateReview)
		router.GET("/ReviewSound/:uid/:sid", reviewsound.CheckReview)

		//Playlist
		router.POST("/Playlist", playlist.CreatePlaylist)
		router.GET("/Playlist/:uid", playlist.GetPlaylistByUID)
		router.GET("/PlaylistByID/:id", playlist.GetPlaylistByID)
		router.DELETE("/Playlist/:id", playlist.DeletePlaylistByID)
		router.PATCH("/Playlist/:id", playlist.EditPlaylistByID)

		//SoundPlaylist
		router.POST("/CreateSoundPlaylist", soundplaylist.CreateSoundPlaylist)
		router.GET("/SoundPlaylistByPID/:pid", soundplaylist.GetSoundPlaylistByPID)
		router.DELETE("/DeleteSoundPlaylist/:id", soundplaylist.DeleteSoundPlaylistByID)
		router.GET("/CheckFirstSoundPlaylist/:pid", soundplaylist.GetTopSoundPlaylistByPID)
		router.DELETE("/DeleteSoundPlaylistByPID/:pid", soundplaylist.DeleteSoundPlaylistByPID)

		//Background
		router.GET("/Background", background.GetBackground)

		//history
		router.POST("/History", history.CreateHistory)

		// Routes for superadmin only
		router.Use(middlewares.Authorizes("superadmin"))
		router.DELETE("/admin/:id", admin.DeleteAdmin)
		router.PUT("/admin/:id", admin.EditAdmin)
		router.POST("/create-admin", admin.CreateAdmin)

	}

	userRouter := r.Group("/")
	{
		// Routes for users only
		userRouter.Use(middlewares.Authorizes("user"))
		userRouter.GET("/user/:id", users.Get)
		userRouter.PUT("/user/:id", users.Update)

		userRouter.GET("/emotions", emotion.GetEmotions)
		userRouter.GET("/emotions/:id", emotion.GetEmotionByID)
		// routes/mirror.go หรือที่คุณ register route
		userRouter.GET("/mirror/summary", mirror.GetMonthlySummary)
		userRouter.POST("/mirror", mirror.CreateMirror)
		userRouter.GET("/mirror/:date", mirror.GetMirrorByDate)
		userRouter.PUT("/mirror/:id", mirror.UpdateMirror)
		userRouter.DELETE("/mirror/:id", mirror.DeleteMirror)
		userRouter.GET("/sounds/meditation", meditation.GetMeditationSounds)
		userRouter.GET("/sounds/breathing", breathing.GetBreathingSounds)

        userRouter.GET("/getallwordhealingmessageforuser", wordhealingmessage.GetAllWordhealingmessagesForUser)    // route ดึงบทความทั้งหมดโดย user
        userRouter.POST("/article/:id/like", wordhealingmessage.LikeArticle)                                       // route สำหรีบ like บทความของ  user
		userRouter.DELETE("/article/:id/like", wordhealingmessage.LikeArticle)                                     // route สำหรีบ unlike บทความของ  user
	    userRouter.GET("/article/:id/liked", wordhealingmessage.CheckLikedArticle)                                 // route ดึงบทความของที่ถูกใจ user
       
        userRouter.POST("/sounds/:id/like", sounds.LikeSound)
        userRouter.GET("/sounds/:id/liked", sounds.CheckLikedSound)
        userRouter.POST("/sounds/:id/view", sounds.AddSoundView)
		userRouter.POST("/sounds/:id/view-block/:uid", sounds.AddSoundViewBlock)

		//playlist
		userRouter.GET("/playlists", playlist.GetPlaylistsByUserAndType)

		//assessment
		userRouter.GET("/assessment/AnswerOptions", assessment.GetAllAnswerOptions)
		userRouter.GET("/assessment/AssessmentAnswers", assessment.GetAllAssessmentAnswers)
		userRouter.GET("/assessment/AssessmentResults", assessment.GetAllAssessmentResults)
		userRouter.GET("/assessment/Calculations", assessment.GetAllCalculations)
		userRouter.GET("/assessment/Criteria", assessment.GetAllCriteria)
		userRouter.GET("/assessment/Questions", assessment.GetAllQuestions)
		userRouter.GET("/assessment/Questionnaires", assessment.GetAllQuestionnaires)
		userRouter.GET("/assessment/Transaction", assessment.GetAllTransaction)
		userRouter.GET("/assessment/AnswerOptions/:id", assessment.GetAnswerOptionByID)
		userRouter.GET("/assessment/AssessmentAnswers/:id", assessment.GetAssessmentAnswerByID)
		userRouter.GET("/assessment/AssessmentResults/:id", assessment.GetAssessmentResultByID)
		userRouter.GET("/assessment/Calculations/:id", assessment.GetCalculationByID)
		userRouter.GET("/assessment/Criteria/:id", assessment.GetCriteriaByID)
		userRouter.GET("/assessment/Questions/:id", assessment.GetQuestionByID)
		userRouter.GET("/assessment/Questionnaires/:id", assessment.GetQuestionnaireByID)
		userRouter.GET("/assessment/Transactions/:id", assessment.GetTransactionByID)
		userRouter.POST("/assessment/result", assessment.CreateAssessmentResult)
		userRouter.POST("/assessment/answer", assessment.SubmitAssessmentAnswer)
		userRouter.POST("/assessment/finish/:id", assessment.FinishAssessment)
		userRouter.GET("/questionnaire-groups", assessment.GetAllQuestionnaireGroups)
		userRouter.GET("/questionnaire-groups/:id", assessment.GetQuestionnaireGroupByID)
		userRouter.GET("/questionnaire-groups/available", assessment.GetAvailableGroupsForUser)
		userRouter.GET("/assessments/next", assessment.GetNextQuestionnaire)

		//chat space
		userRouter.POST("/gemini", controller.GeminiHistory)
		userRouter.GET("/conversation/:id", controller.GetConversationHistory)
		userRouter.POST("/new-chat", controller.CreateChatRoom)
		userRouter.PATCH("/end-chat/:id", controller.EndChatRoom)
		// userRouter.GET("/recent", controller.GetRecentChat)
	}

	

    r.GET("/", func(c *gin.Context) {
        c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
    })

    // Run the server
    r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE,PATCH")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
