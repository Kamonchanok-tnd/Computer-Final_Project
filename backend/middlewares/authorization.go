package middlewares

import (
	"net/http"
	"strings"
	"sukjai_project/services"
	"github.com/gin-gonic/gin"
	// "strconv"
    "fmt"
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

		// ตั้งค่า userID และ userRole ใน context
		c.Set("uid", claims.ID)       // ของดิว   
        c.Set("role", claims.Role)    // ของดิว
		c.Set("userID", claims.ID)
		c.Set("userRole", claims.Role)
       fmt.Println("Claims ID in Middleware: ", claims.ID)
fmt.Println("Claims Role in Middleware: ", claims.Role)


		// ให้สามารถเข้าถึงได้ถ้าเป็น admin หรือ superadmin
		if claims.Role != "admin" && claims.Role != "superadmin" && claims.Role != "user"{
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			return
		}




		c.Next()
	}
}
