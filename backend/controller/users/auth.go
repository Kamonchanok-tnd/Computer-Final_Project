package users

import (
   "errors"
   "net/http"
   "time"
   "github.com/gin-gonic/gin"
   "golang.org/x/crypto/bcrypt"
   "gorm.io/gorm"
   "sukjai_project/config"
   "sukjai_project/entity"
   "sukjai_project/services"
   "regexp"
   "os"
   "fmt" // เพิ่มการนำเข้า fmt เพื่อใช้ Println
)

type (
   Authen struct {
       Email    string `json:"email"`
       Password string `json:"password"`
   }
   
   signUp struct {
       Username   string    `json:"username"`
       Email      string    `json:"email"`
       Password   string    `json:"password"`
       Facebook   string    `json:"facebook"`
       Line       string    `json:"line"`
       PhoneNumber string   `json:"phone_number"`
       Role       string    `json:"role"`
       Age        int       `json:"age"`      
       Gender     string    `json:"gender"`
       BirthDay   time.Time `json:"birthday"`
   }
)

// ตรวจสอบรูปแบบอีเมล
func isValidEmail(email string) bool {
    re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    return re.MatchString(email)
}

func SignUp(c *gin.Context) {
    var payload signUp
    // Bind JSON payload to the struct
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบว่าอีเมลเป็นรูปแบบที่ถูกต้องหรือไม่
    if !isValidEmail(payload.Email) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
        return
    }

    db := config.DB()
    var userCheck entity.Users
    // ตรวจสอบว่าผู้ใช้ที่ใช้ email นี้มีอยู่หรือไม่
    result := db.Where("email = ?", payload.Email).First(&userCheck)
    if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }
    if userCheck.ID != 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
        return
    }

    // ตรวจสอบ Role ว่ามีค่าเป็น "superadmin" หรือ "user" เท่านั้น
    if payload.Role != "superadmin" && payload.Role != "user" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
        return
    }

    // หาก role เป็น superadmin ให้เปลี่ยน role เป็น admin
    if payload.Role == "superadmin" {
        payload.Role = "admin"  // เปลี่ยนเป็น admin
    }

    // ตรวจสอบความปลอดภัยของรหัสผ่าน เช่น ความยาวขั้นต่ำ 6 ตัว
    if len(payload.Password) < 6 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters"})
        return
    }

    // แฮชรหัสผ่านก่อนบันทึก
    hashedPassword, err := config.HashPassword(payload.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
        return
    }

    // สร้างผู้ใช้ใหม่
    user := entity.Users{
        Username:   payload.Username,
        Email:      payload.Email,
        Password:   hashedPassword,
        Facebook:   payload.Facebook,
        Line:       payload.Line,
        PhoneNumber: payload.PhoneNumber,
        Role:       payload.Role, // บันทึก role เป็น admin หากเป็น superadmin
        Age:        payload.Age, 
        Gender:     payload.Gender,
    }

    // บันทึกผู้ใช้ลงในฐานข้อมูล
    if err := db.Create(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})
}

func SignIn(c *gin.Context) {
    var payload Authen
    var user entity.Users
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ค้นหาผู้ใช้ในฐานข้อมูล
    if err := config.DB().Where("email = ?", payload.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid credentials"})
        return
    }

    // ตรวจสอบรหัสผ่านที่แฮชแล้ว
    err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect password"})
        return
    }

    // ทดสอบการอ่าน JWT_SECRET_KEY
    secretKey := os.Getenv("JWT_SECRET_KEY")
    fmt.Println("SecretKey from .env:", secretKey)

    // สร้าง token โดยแทรก role ของผู้ใช้ลงใน JWT
    jwtWrapper := services.JwtWrapper{
        SecretKey:       secretKey,  // ใช้ค่าจาก environment variable
        Issuer:          "AuthService",
        ExpirationHours: 24,
    }

    // พิมพ์ค่า SecretKey ก่อนการสร้าง Token
    fmt.Println("Generating token with SecretKey:", jwtWrapper.SecretKey)

    signedToken, err := jwtWrapper.GenerateToken(user.Email, user.Role, user.ID) // ส่ง role และ ID ไปด้วย
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Error signing token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.ID, "role": user.Role})
}
