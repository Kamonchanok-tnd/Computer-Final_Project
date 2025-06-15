package main

import (
   "net/http"
   "github.com/gin-gonic/gin"
   "sukjai_project/config"

   "sukjai_project/controller/users"
   "sukjai_project/middlewares"
)

const PORT = "8000"

func main() {
   // open connection database
   config.ConnectionDB()
   // Generate databases
   config.SetupDatabase()

   r := gin.Default()
   r.Use(CORSMiddleware())

   // Auth Routes
   r.POST("/signup", users.SignUp)
   r.POST("/signin", users.SignIn)

   // Protect routes with role-based access
   router := r.Group("/")
   {
       // Routes for admins only
       router.Use(middlewares.Authorizes("admin"))
       router.PUT("/user/:id", users.Update)
       router.GET("/users", users.GetAll)
       router.GET("/user/:id", users.Get)
       router.DELETE("/user/:id", users.Delete)

       // Routes for users only
       // Add more routes for users here if needed
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
