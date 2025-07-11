package main

import (
	"log" // เพิ่มการนำเข้า log
	"net/http"
	"os" // เพิ่มการนำเข้า os
	"sukjai_project/config"
    
	"sukjai_project/controller/admin"
	controller "sukjai_project/controller/chat_space"
    "sukjai_project/controller/resettoken"
    "sukjai_project/controller/users"
    "sukjai_project/middlewares"
    "sukjai_project/controller/prompt"

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

    gin.SetMode(gin.DebugMode)  // เพิ่มบรรทัดนี้เพื่อให้ log แสดงใน terminal

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
    log.Println("JWT_SECRET_KEY:", secretKey)  // แสดงค่า JWT_SECRET_KEY ในคอนโซล

    // ทดสอบการส่งอีเมล
    // err := users.SendEmail("b6526436@g.sut.ac.th", "Test Subject", "<h1>This is a test email</h1>")
    // if err != nil {
    //     fmt.Println("Error:", err)
    // } else {
    //     fmt.Println("Test email sent successfully!")
    // }

    // Auth Routes
    r.POST("/signup", users.SignUp)
    r.POST("/signin", users.SignIn)
    r.POST("/forgot-password", users.ForgotPasswordController)
    r.POST("/validate-reset-token", resettoken.ValidateResetTokenController)
    r.PATCH("/update-password", resettoken.UpdatePasswordController) // ฟังก์ชันอัพเดตรหัสผ่านใหม่
    r.POST("/gemini", controller.GeminiHistory)
    r.GET("/conversation/:id", controller.GetConversationHistory)
    r.POST("/new-chat", controller.CreateChatRoom)
    r.PATCH("/end-chat/:id", controller.EndChatRoom)
    // Protect routes with role-based access
    router := r.Group("/")
    {
        // Routes for admins only
        router.Use(middlewares.Authorizes("admin"))
        router.GET("/admin", admin.GetAllAdmin)
        router.GET("/admin/:id", admin.GetAdminById) 
        router.PUT("/adminyourself/:id", admin.EditAdminYourself)

        router.POST("/admin/prompt", prompt.CreatePrompt)
        router.GET("/admin/prompt", prompt.GetAllPrompts)
        router.DELETE("/admin/prompt/:id", prompt.DeletePrompt)
        router.PUT("/admin/prompt/:id", prompt.UpdatePrompt)
        router.POST("/admin/prompt/use/:id", prompt.UsePrompt)
        router.GET("/admin/prompt/:id", prompt.GetPromptByID)


        
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
        
        //chat space
        
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
