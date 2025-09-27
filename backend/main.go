package main

import (
	"log" // เพิ่มการนำเข้า log
	"net/http"
	"os" // เพิ่มการนำเข้า os
	"sukjai_project/config"
	history "sukjai_project/controller/History"
	profileavatar "sukjai_project/controller/ProfileAvatar"
	"sukjai_project/controller/admin"
	"sukjai_project/controller/asmr"
	"sukjai_project/controller/assessment"
	"sukjai_project/controller/background"
	"sukjai_project/controller/breathing"
	controller "sukjai_project/controller/chat_space"
	"sukjai_project/controller/dashboardcontents"
	"sukjai_project/controller/emotion"
	"sukjai_project/controller/exportexcel"
	"sukjai_project/controller/meditation"
	"sukjai_project/controller/mirror"
	"sukjai_project/controller/playlist"
	"sukjai_project/controller/prompt"
	"sukjai_project/controller/questionnaire"
	"sukjai_project/controller/resettoken"
	"sukjai_project/controller/reviewsound"
	"sukjai_project/controller/soundplaylist"
	"sukjai_project/controller/sounds"
	"sukjai_project/controller/useractivity"
	"sukjai_project/controller/users"
	"sukjai_project/controller/handler"
	"sukjai_project/controller/wordhealingmessage"
	"sukjai_project/middlewares"
	"sukjai_project/controller/articletype"

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
	r.Static("/images/profile", "./images/avatar")

	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)
	r.POST("/forgot-password", users.ForgotPasswordController)
	r.POST("/validate-reset-token", resettoken.ValidateResetTokenController)
	r.PATCH("/update-password", resettoken.UpdatePasswordController) // ฟังก์ชันอัพเดตรหัสผ่านใหม่
	r.GET("/recent", controller.GetRecentChat)
	r.GET("/excel", exportexcel.ExportExcel)

	r.POST("/gemini", controller.GeminiHistory)

	

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
		router.GET("/questionnaires", questionnaire.GetAllQuestionnaires)       // route ดึงแบบทดสอบทั้งหมด
		router.GET("/users", questionnaire.GetAllUsers)                         // route ดึงผู้ใช้ทั้งหมด
		router.GET("/getallemotionchoices", questionnaire.GetAllEmotionChoices) // route ดึงตัวเลือกอีโมจิทั้งหมด
		router.POST("/createQuestionnaires", questionnaire.CreateQuestionnaire) // route สำหรับสร้างแบบทดสอบ (Questionnaire)
		router.POST("/createQuestions", questionnaire.CreateQuestions)          // route สำหรับสร้างข้อคำถามเเละคำตอบ (Questions and Answers)
		router.POST("/createCriterias", questionnaire.CreateCriterias)          // route สำหรับสร้างเกณฑ์การให้คะแนน (Criterias)

		router.DELETE("/deletequestionnaire/:id", questionnaire.DeleteQuestionnaire)    // route สำหรับลบเเบบทดสอบ คำถามเเละคำตอบ
		

		router.GET("/getquestionnaire/:id", questionnaire.GetQuestionnaire)                                        // route สำหรับดึงค่าเก่าเเบบทดสอบ
		router.PATCH("/updatequestionnaire/:id", questionnaire.UpdateQuestionnaire)                                // route สำหรับเเก้ไขเเบบทดสอบ
		router.GET("/getquestionandanswerbyquestionnaireid/:id", questionnaire.GetQuestionAnswerByQuetionnaireID)  // route ดึงคำถามเเละคำตอบตามไอดีแบบทดสอบ
		router.PATCH("/updatequestionandanswer/:id", questionnaire.UpdateQuestionAndAnswer)                        // route เเก้ไขคำถามเเละคำตอบตามไอดีคำถาม
		router.GET("/getallcriteria/by-questionnaire/:id", questionnaire.GetCriteriaByQuestionnaireID)             // route ดึงเกณฑ์การให้คะแนนตามไอดีแบบทดสอบ
	    router.PATCH("/updatecriteria/by-questionnaire/:id", questionnaire.UpdateCriteriaByQuestionnaireID)        // route เเก้ไขเกณฑ์การให้คะแนนตามไอดีแบบทดสอบ

		// Assessment routes
		router.GET("/admin/questionnaire-groups", assessment.GetAllQuestionnaireGroups)
		router.GET("/admin/questionnaire-groups/:id", assessment.GetQuestionnaireGroupByID)
		router.PATCH("/admin/questionnaire-groups/:id/frequency", assessment.UpdateQuestionnaireGroupFrequency)
		router.PUT("/admin/questionnaire-groups/:id/order", assessment.ReorderQuestionnairesInGroup)
		router.POST("/admin/questionnaire-groups/:id/add-questionnaire", assessment.AddQuestionnaireToGroup)
		router.DELETE("/admin/questionnaire-groups/:id/remove-questionnaire/:qid", assessment.RemoveQuestionnaireFromGroup)
		router.GET("/admin/questionnaire-groups/:id/available-questionnaires", assessment.GetAvailableQuestionnairesForGroup)

		//Healing mesage route
		router.GET("/getallwordhealingmessage", wordhealingmessage.GetAllWordhealingmessages)       // route ดึงบทความทั้งหมด
		router.POST("/createwordhealingmessage", wordhealingmessage.CreateWordHealingMessages)      // route สำหรับสร้างบทความ (WordHealingMesasage)
		router.DELETE("/deletewordhealingmessage/:id", wordhealingmessage.DeleteWordHealingContent) // route สำหรับลบบทความ (WordHealingMesasage)
		router.GET("/getwordhealingmessage/:id", wordhealingmessage.GetWordHealingMessage)          // route สำหรับดึงค่าเก่าบทความ
		router.PATCH("/updatewordhealingmessage/:id", wordhealingmessage.UpdateWordHealingMessage)  // route สำหรับเเก้ไขเเบบบทความ
		router.PATCH("/updateviewcountmessage/:id", wordhealingmessage.UpdateViewcountMessage)      // route สำหรับเพิ่มจำนวนการเข้าชมบทความ
		router.GET("/getarticletype", wordhealingmessage.GetArticleTypes)                           // route สำหรับดึงประเภทของบทความไปใช้ใน dropdown
		router.POST("/views/count", wordhealingmessage.CountView)                                   
        router.GET("/views/by-message/:id", wordhealingmessage.ListViewsByMessage)                  


        // Video routes
        router.POST("/videos", meditation.CreateVideo)
		
		// // Video routes
		// router.POST("/videos", meditation.CreateVideo)

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
		router.GET("/Playlist/:uid/:stid", playlist.GetPlaylistByUID)
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

		
		router.GET("/sounds/daily-usage", dashboardcontents.GetSoundMeditation)
		router.GET("/sounds/chanting", dashboardcontents.GetSoundChanting)
		router.GET("/word-healing", dashboardcontents.GetDailyViewsByTitle)
		router.GET("/mirror", dashboardcontents.GetDailyMirrorUsage)
		router.GET("/asmr", dashboardcontents.GetDailyASMRUsage)
		router.GET("/breathing", dashboardcontents.GetDailyBreathingUsage)


		router.GET("/summarycontents", dashboardcontents.GetTopContentComparison)
		router.GET("/sound/four-type", dashboardcontents.GetSoundFourType)  

		//dashboard chatspace
		router.GET("/chat_rooms/count_uid", controller.TotalUser)

		router.GET("/dashboard/overview", controller.DashboardOverview)
		router.GET("/dashboard/usage/daily", controller.DashboardUsage)
		router.GET("/dashboard/users/top", controller.DashboardTopUsers)
		router.GET("/dashboard/sessions/gender", controller.DashboardSessionsGender)
		router.GET("/dashboard/sessions/duration", controller.DashboardSessionsDuration)
		router.GET("/dashboard/visit-frequency", controller.DashboardActiveUsers)
		router.GET("/dashboard/retention-rate", useractivity.GetRetentionRate)

		//dashboard questionaire
		router.GET("/dashboard/questionaire/overview",dashboardcontents.GetDashboardSurveyOverview )
		router.GET("/dashboard/questionaire/stats",dashboardcontents.GetQuestionnaireStats )
		router.GET("/dashboard/questionaire/resultsoverview",dashboardcontents.GetSurveyVisualization )
		router.GET("/dashboard/questionaire/resultsoverview/:id",dashboardcontents.GetSurveyVisualizationByID )
		router.GET("/dashboard/questionnaire/:id/average-score", dashboardcontents.GetAverageScoreCard)
		
	

		
		router.GET("/dashboard/questionnaire/user", dashboardcontents.GetRespondents)
		router.GET("/dashboard/questionnaire/user/overiew/:id", dashboardcontents.GetUserKPI)
		router.GET("/dashboard/questionnaire/user/bar/:id", dashboardcontents.GetUserAssessmentSummary)
		router.GET("/dashboard/questionnaire/user/prepost", dashboardcontents.GetPrePostTransactionsCompare)
		router.GET("/dashboard/questionnaire/user/personal", dashboardcontents.GetStandaloneTransactionsPersonal)
		router.GET("/dashboard/questionnaire/user/detail", dashboardcontents.GetDescriptionSummary)


		// router.GET


		router.GET("/visit-frequency", useractivity.GetVisitFrequency)
		router.GET("/retention-rate", useractivity.GetRetentionRate)
		router.GET("/new-users", useractivity.GetNewuser)
		router.GET("/returning-users", useractivity.GetReturningUsers)
	

	


		// Routes for superadmin only
		router.Use(middlewares.Authorizes("superadmin"))
		router.DELETE("/admin/:id", admin.DeleteAdmin)
		router.PUT("/admin/:id", admin.EditAdmin)
		router.POST("/create-admin", admin.CreateAdmin)



		// ArticleType routes
		router.GET("/articletypes", articletype.GetAllArticleTypes)            // ดึงประเภทบทความทั้งหมด
		router.GET("/articletype/:id", articletype.GetArticleTypeByID)         // ดึงประเภทบทความตาม id
		router.POST("/createarticletype", articletype.CreateArticleType)       // สร้างประเภทบทความ
		router.PATCH("/updatearticletype/:id", articletype.UpdateArticleType)  // แก้ไขประเภทบทความ
		router.DELETE("/deletearticletype/:id", articletype.DeleteArticleType) // ลบแบบ soft delete

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
		userRouter.GET("/onboarding/mirror", handler.GetMirrorOnboarding)
	userRouter.POST("/onboarding/mirror/seen", handler.SetMirrorOnboardingSeen)

		userRouter.GET("/mirror/summary", mirror.GetMonthlySummary)
		userRouter.POST("/mirror", mirror.CreateMirror)
		userRouter.GET("/mirror/:date", mirror.GetMirrorByDate)
		userRouter.PUT("/mirror/:id", mirror.UpdateMirror)
		userRouter.DELETE("/mirror/:id", mirror.DeleteMirror)
		userRouter.GET("/sounds/meditation", meditation.GetMeditationSounds)
		userRouter.GET("/sounds/breathing", breathing.GetBreathingSounds)

		userRouter.GET("/getallwordhealingmessageforuser", wordhealingmessage.GetAllWordhealingmessagesForUser) // route ดึงบทความทั้งหมดโดย user
		userRouter.POST("/article/:id/like", wordhealingmessage.LikeArticle)                                    // route สำหรีบ like บทความของ  user
		userRouter.DELETE("/article/:id/like", wordhealingmessage.LikeArticle)                                  // route สำหรีบ unlike บทความของ  user
		userRouter.GET("/article/:id/liked", wordhealingmessage.CheckLikedArticle)                              // route ดึงบทความของที่ถูกใจ user

		userRouter.POST("/sounds/:id/like", sounds.LikeSound)
		userRouter.GET("/sounds/:id/liked", sounds.CheckLikedSound)
		userRouter.POST("/sounds/:id/view", sounds.AddSoundView)
		userRouter.POST("/sounds/:id/view-block/:uid", sounds.AddSoundViewBlock)

		//playlist
		userRouter.GET("/playlists", playlist.GetPlaylistsByUserAndType)

		//assessment
		userRouter.GET("/assessment/AnswerOptions", assessment.GetAllAnswerOptions)
		userRouter.GET("/assessment/getallemotionchoices", questionnaire.GetAllEmotionChoices)
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
		userRouter.GET("/assessments/available-next", assessment.GetAvailableGroupsAndNextQuestionnaire)
		userRouter.GET("/assessments/transactions", assessment.GetTransactions)

		//chat space
		// userRouter.POST("/gemini", controller.GeminiHistory)
		userRouter.GET("/conversation/:id", controller.GetConversationHistory)
		userRouter.POST("/new-chat", controller.CreateChatRoom)
		userRouter.PATCH("/end-chat/:id", controller.EndChatRoom)
		// userRouter.GET("/recent", controller.GetRecentChat). LogActivity
		userRouter.DELETE("/conversation/:id", controller.ClearConversation)

		//profile
		userRouter.GET("/profile", profileavatar.GetAllProfile)

		//asmr
		userRouter.POST("/createasmr", asmr.CreateASMR)

		//log ข้อมูล
		userRouter.POST("/activity", useractivity.LogActivity)


	
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
