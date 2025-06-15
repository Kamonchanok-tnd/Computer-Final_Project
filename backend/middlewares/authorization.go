package middlewares

import (
   "net/http"
   "strings"
   "sukjai_project/services"
   "github.com/gin-gonic/gin"
)

// Authorizes - ตรวจสอบ Role ใน JWT token
func Authorizes(requiredRole string) gin.HandlerFunc {
   return func(c *gin.Context) {
       // ดึงข้อมูล token จาก Authorization header
       clientToken := c.Request.Header.Get("Authorization")
       if clientToken == "" {
           c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
           return
       }

       // แยก token ออกจาก Bearer
       extractedToken := strings.Split(clientToken, "Bearer ")
       if len(extractedToken) != 2 {
           c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
           return
       }

       clientToken = strings.TrimSpace(extractedToken[1])

       // ตรวจสอบ Token
       jwtWrapper := services.JwtWrapper{
           SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",  // ใช้ SecretKey จาก environment variable
           Issuer:    "AuthService",
       }

       claims, err := jwtWrapper.ValidateToken(clientToken)
       if err != nil {
           c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
           return
       }

       // ตรวจสอบ Role
       if claims.Role != requiredRole {
           c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
           return
       }

       // ถ้าผ่านการตรวจสอบให้ดำเนินการต่อ
       c.Set("userID", claims.ID) // ใช้ claims.ID แทน
       c.Set("userRole", claims.Role)

       c.Next()
   }
}
