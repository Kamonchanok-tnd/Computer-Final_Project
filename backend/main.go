package main

import (
	"log" // เพิ่มการนำเข้า log
	"net/http"
	"os" // เพิ่มการนำเข้า os
	"sukjai_project/config"
	"sukjai_project/controller/admin"
	"sukjai_project/controller/users"
	"sukjai_project/middlewares"

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

   // Auth Routes
   r.POST("/signup", users.SignUp)
   r.POST("/signin", users.SignIn)
   r.POST("/forgot-password", users.ForgotPasswordController)
   

   // Protect routes with role-based access
   router := r.Group("/")
   {
       // Routes for admins only
       router.Use(middlewares.Authorizes("admin"))
       // เพิ่ม route สำหรับการสร้าง Admin
	    router.POST("/create-admin", admin.CreateAdmin)
        router.GET("/admin", admin.GetAllAdmin)
        router.PUT("/admin/:id", admin.EditAdmin)
        router.GET("/admin/:id", admin.GetAdminById) 
        router.PUT("/adminyourself/:id", admin.EditAdminYourself)
    //    router.PUT("/user/:id", users.Update)
    //    router.GET("/users", users.GetAll)
    //    // router.GET("/user/:id", users.Get)
    //    router.DELETE("/user/:id", users.Delete)

        // Routes for admins only
    router.Use(middlewares.Authorizes("superadmin")) // Superadmin can delete admin
    router.DELETE("/admin/:id", admin.DeleteAdmin)  // เพิ่ม route สำหรับลบ Admin





   }

   userRouter := r.Group("/")
   {
       // Routes for users only
       userRouter.Use(middlewares.Authorizes("user"))
       userRouter.GET("/user/:id", users.Get)  // user can view their own information
       router.PUT("/user/:id", users.Update)
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
       c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
       if c.Request.Method == "OPTIONS" {
           c.AbortWithStatus(204)
           return
       }
       c.Next()
   }
}
