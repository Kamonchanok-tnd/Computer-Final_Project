package middlewares

import (
   "net/http"
   "strings"
   "sukjai_project/services"
   "github.com/gin-gonic/gin"
//    "log" // เพิ่มการนำเข้าคำสั่ง log
//    "fmt"
"strconv"
)

/// Authorizes - ตรวจสอบ Role ใน JWT token
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
            SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx", 
            Issuer:    "AuthService",
        }

        claims, err := jwtWrapper.ValidateToken(clientToken)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
            return
        }

        if claims == nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Claims are nil"})
            return
        }

        // ตรวจสอบว่าเส้นทางนี้ต้องการ "id" หรือไม่
        // ถ้าเส้นทางไม่ต้องการ ID เช่น /admin
        idParamRequired := c.Param("id") != ""

        if idParamRequired {
            // แปลง c.Param("id") จาก string เป็น uint
            userIDParam, err := strconv.ParseUint(c.Param("id"), 10, 32) // ใช้ ParseUint
            if err != nil {
                c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid ID parameter"})
                return
            }

            // ตรวจสอบ Role และ ID ของผู้ใช้
            if claims.Role != requiredRole && uint(userIDParam) != claims.ID && requiredRole != "any" {
                c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
                return
            }
        } else {
            // ถ้าเส้นทางไม่ต้องการ ID เช่น /admin, ให้ตรวจสอบแค่ role
            if claims.Role != requiredRole && requiredRole != "any" {
                c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
                return
            }
        }

        // ตั้งค่า userID และ userRole ใน context
        c.Set("userID", claims.ID)
        c.Set("userRole", claims.Role)

        c.Next()
    }
}
