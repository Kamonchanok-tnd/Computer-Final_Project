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
   "fmt"
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
       BirthDate   string `json:"birth_date"`
       Gender     string    `json:"gender"`
       PersonType string  `json:"person_type"`
       Faculty    string  `json:"faculty"`
       Year       string    `json:"year"`
       ConsentAccepted   bool      `json:"consent_accepted"`
       ConsentAcceptedAt time.Time `json:"consent_accepted_at"`
   }
)

// ตรวจสอบรูปแบบอีเมล
func isValidEmail(email string) bool {
    re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    return re.MatchString(email)
}

// ตรวจสอบรูปแบบเบอร์โทร (ตัวอย่าง regex เบอร์โทรไทย)
func isValidPhoneNumber(phone string) bool {
    re := regexp.MustCompile(`^(0[689]{1}[0-9]{8})$`) 
    return re.MatchString(phone)
}

func SignUp(c *gin.Context) {
    var payload signUp
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
        return
    }

    if !isValidEmail(payload.Email) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบอีเมลไม่ถูกต้อง"})
        return
    }

    // ✅ ตรวจสอบเบอร์โทร
    if !isValidPhoneNumber(payload.PhoneNumber) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบเบอร์โทรไม่ถูกต้อง"})
        return
    }

    db := config.DB()
    var userCheck entity.Users
    result := db.Where("email = ?", payload.Email).First(&userCheck)
    if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้"})
        return
    }
    if userCheck.ID != 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "อีเมลนี้ถูกใช้งานแล้ว"})
        return
    }

    // ✅ ตรวจสอบเบอร์โทรซ้ำ
    var phoneCheck entity.Users
    result = db.Where("phone_number = ?", payload.PhoneNumber).First(&phoneCheck)
    if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบเบอร์โทร"})
        return
    }
    if phoneCheck.ID != 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "เบอร์โทรนี้ถูกใช้งานแล้ว"})
        return
    }


    if payload.Role != "superadmin" && payload.Role != "user" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "บทบาทไม่ถูกต้อง"})
        return
    }

    if payload.Role == "superadmin" {
        payload.Role = "admin"
    }

    if len(payload.Password) < 6 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"})
        return
    }

    hashedPassword, err := config.HashPassword(payload.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน"})
        return
    }

    user := entity.Users{
        Username:         payload.Username,
        Email:            payload.Email,
        Password:         hashedPassword,
        Facebook:         payload.Facebook,
        Line:             payload.Line,
        PhoneNumber:      payload.PhoneNumber,
        Role:             payload.Role,
        Age:              payload.Age, 
        BirthDate:        payload.BirthDate,
        Gender:           payload.Gender,
        ConsentAccepted:  payload.ConsentAccepted,
        ConsentAcceptedAt: payload.ConsentAcceptedAt,
        PersonType: payload.PersonType,
        Faculty:    payload.Faculty,
        Year:       payload.Year,
    }

    if err := db.Create(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้"})
        return
    }

    if user.Role == "user" {
        activity := entity.UserActivity{
            UID:    user.ID,
            Action: "create_account",
            Page:   "/signup",
        }

        if err := db.Create(&activity).Error; err != nil {
            fmt.Println("ไม่สามารถบันทึกกิจกรรมผู้ใช้ใหม่:", err)
        }
    }

    c.JSON(http.StatusCreated, gin.H{"message": "ลงทะเบียนสำเร็จ"})
}

func SignIn(c *gin.Context) {
    var payload Authen
    var user entity.Users
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
        return
    }

    if err := config.DB().Where("email = ?", payload.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
        return
    }

    err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสผ่านไม่ถูกต้อง"})
        return
    }

    secretKey := os.Getenv("JWT_SECRET_KEY")
    fmt.Println("SecretKey from .env:", secretKey)

    jwtWrapper := services.JwtWrapper{
        SecretKey:       secretKey,
        Issuer:          "AuthService",
        ExpirationHours: 24,
    }

    fmt.Println("Generating token with SecretKey:", jwtWrapper.SecretKey)

    signedToken, err := jwtWrapper.GenerateToken(user.Email, user.Role, user.ID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "เกิดข้อผิดพลาดในการสร้างโทเคน"})
        return
    }
    
    if user.Role == "user" {
        activity := entity.UserActivity{
            UID:    user.ID,
            Action: "login",
            Page:   "/login",
        }

        if err := config.DB().Create(&activity).Error; err != nil {
            fmt.Println("ไม่สามารถบันทึกกิจกรรมการเข้าสู่ระบบ:", err)
        }
    }

    c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.ID, "role": user.Role})
}
