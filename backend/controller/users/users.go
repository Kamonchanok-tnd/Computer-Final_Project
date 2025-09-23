package users

import (
   "net/http"
   "github.com/gin-gonic/gin"
   "sukjai_project/config"
   "sukjai_project/entity"
   "sukjai_project/services"
//    "fmt"
   "os"
   "log"  // เพิ่มการใช้ log
//    "strconv" 
)

func GetAll(c *gin.Context) {
   var users []entity.Users
   db := config.DB()
   // ดึงข้อมูลผู้ใช้ทั้งหมดในฐานข้อมูล โดยไม่ต้อง Preload "Gender"
   results := db.Find(&users)
   if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้"})
       return
   }
   if len(users) == 0 {
        c.JSON(http.StatusNoContent, gin.H{"message": "ไม่พบข้อมูลผู้ใช้"})
       return
   }
   c.JSON(http.StatusOK, users)
}

func Get(c *gin.Context) {
    // รับค่า Authorization header
    token := c.GetHeader("Authorization")

    // เพิ่ม Log เพื่อตรวจสอบ token ที่ได้รับ
    log.Printf("Received Authorization Header: %v", token)

    // ตรวจสอบว่า token ไม่เป็นค่าว่าง
    if token == "" {
        log.Println("No Authorization header provided")  // พิมพ์ log หากไม่มี token
        c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่ได้ส่งค่า Authorization header มา"})
        return
    }

    // ตรวจสอบว่า token เริ่มต้นด้วย Bearer หรือไม่
    if len(token) < 7 || token[:7] != "Bearer " {
        log.Println("Authorization header is malformed")  // พิมพ์ log หาก token ไม่ถูกต้อง
        c.JSON(http.StatusUnauthorized, gin.H{"error": "รูปแบบ Authorization header ไม่ถูกต้อง"})
        return
    }

    token = token[7:] // ตัดคำว่า "Bearer " ออก

    // ตรวจสอบและ validate token
    jwtWrapper := services.JwtWrapper{
        SecretKey:       os.Getenv("JWT_SECRET_KEY"),  // ใช้ key ที่ถูกต้อง
        Issuer:          "AuthService",
        ExpirationHours: 24,
    }

    claims, err := jwtWrapper.ValidateToken(token)
    if err != nil {
        log.Printf("Invalid or expired token: %v", err)  // พิมพ์ log เมื่อเกิด error ในการ validate token
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Token ไม่ถูกต้องหรือหมดอายุ"})
        return
    }

    log.Printf("Token validated successfully, claims: %v", claims)  // พิมพ์ log เมื่อ token ถูกต้อง

    // ถ้า token ถูกต้อง, ดำเนินการค้นหาผู้ใช้
    ID := c.Param("id")
    var user entity.Users
    db := config.DB()

    // ค้นหาผู้ใช้ตาม ID
    results := db.Preload("ProfileAvatar").First(&user, ID)
    if results.Error != nil {
        log.Printf("User not found: %v", results.Error)  // พิมพ์ log หากไม่พบผู้ใช้
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้"})
        return
    }

    // ส่งข้อมูลผู้ใช้กลับไป
    c.JSON(http.StatusOK, user)
}


func Update(c *gin.Context) {
	// รับค่า Authorization header
	token := c.GetHeader("Authorization")

	// เพิ่ม Log เพื่อตรวจสอบ token ที่ได้รับ
	log.Printf("Received Authorization Header: %v", token)

	// ตรวจสอบว่า token ไม่เป็นค่าว่าง
	if token == "" {
		log.Println("No Authorization header provided")  // พิมพ์ log หากไม่มี token
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่ได้ส่งค่า Authorization header มา"})
		return
	}

	// ตรวจสอบว่า token เริ่มต้นด้วย Bearer หรือไม่
	if len(token) < 7 || token[:7] != "Bearer " {
		log.Println("Authorization header is malformed")  // พิมพ์ log หาก token ไม่ถูกต้อง
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รูปแบบ Authorization header ไม่ถูกต้อง"})
		return
	}

	token = token[7:] // ตัดคำว่า "Bearer " ออก

	// ตรวจสอบและ validate token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       os.Getenv("JWT_SECRET_KEY"),  // ใช้ key ที่ถูกต้อง
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	claims, err := jwtWrapper.ValidateToken(token)
	if err != nil {
		log.Printf("Invalid or expired token: %v", err)  // พิมพ์ log เมื่อเกิด error ในการ validate token
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token ไม่ถูกต้องหรือหมดอายุ"})
		return
	}

	log.Printf("Token validated successfully, claims: %v", claims)  // พิมพ์ log เมื่อ token ถูกต้อง

	// ถ้า token ถูกต้อง, ดำเนินการอัปเดตข้อมูลผู้ใช้
	ID := c.Param("id")
	var user entity.Users
	db := config.DB()

	// ค้นหาผู้ใช้ตาม ID
	results := db.First(&user, ID)
	if results.Error != nil {
		log.Printf("User not found: %v", results.Error)  // พิมพ์ log หากไม่พบผู้ใช้
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้"})
		return
	}

	// Binding JSON data (จาก body ของ request) ไปยัง struct
	if err := c.ShouldBindJSON(&user); err != nil {
		log.Printf("Error binding data: %v", err)  // พิมพ์ log หากไม่สามารถ bind ข้อมูล
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	// อัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
	if err := db.Save(&user).Error; err != nil {
		log.Printf("Error updating user: %v", err)  // พิมพ์ log หากไม่สามารถอัปเดตข้อมูลได้
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้"})
		return
	}

	// ส่งข้อมูลผู้ใช้ที่อัปเดตแล้วกลับไป
	c.JSON(http.StatusOK, user)
}

func Delete(c *gin.Context) {
   id := c.Param("id")
   db := config.DB()
   var user entity.Users
   result := db.First(&user, id)
   if result.Error != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้ใช้"})
       return
   }

   // Delete the user from the database
   if tx := db.Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {
       c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถลบผู้ใช้ได้"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "ลบผู้ใช้เรียบร้อยแล้ว"})
}
