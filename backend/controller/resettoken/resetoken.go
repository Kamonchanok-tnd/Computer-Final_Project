package resettoken

import (
	"net/http"
	"time"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"sukjai_project/config"
	"sukjai_project/entity"
	"golang.org/x/crypto/bcrypt"
)

// สร้าง JWT สำหรับผู้ใช้ที่ยืนยันการรีเซ็ตรหัสผ่าน
func GenerateJWT(user entity.Users) (string, error) {
    claims := jwt.MapClaims{
        "id":  user.ID,
        "exp": time.Now().Add(time.Hour * 24).Unix(), // กำหนดวันหมดอายุให้กับ token
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signedToken, err := token.SignedString([]byte("your_secret_key")) // ใช้ secret key ในการเซ็น token
    if err != nil {
        return "", err
    }

    return signedToken, nil
}

// ValidateResetTokenController: ฟังก์ชันตรวจสอบ reset token
func ValidateResetTokenController(c *gin.Context) {
    var payload struct {
        Token string `json:"token" binding:"required"`
    }

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกรหัสยืนยันที่ถูกต้อง"})
        return
    }

    db := config.DB()

    var user entity.Users
    if err := db.Where("reset_token = ?", payload.Token).First(&user).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบรหัสยืนยันนี้ หรือรหัสหมดอายุ"})
        return
    }

    if user.ResetTokenExpiry.Before(time.Now()) {
        c.JSON(http.StatusGone, gin.H{"error": "รหัสยืนยันหมดอายุ กรุณาขอใหม่"})
        return
    }

    // สร้าง JWT token สำหรับการรีเซ็ตรหัสผ่าน
    token, err := GenerateJWT(user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง JWT token ได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "รหัสยืนยันถูกต้อง",
        "jwt":     token, // ส่ง JWT token ที่ใช้ในการรีเซ็ตรหัสผ่าน
        "id":      user.ID,
    })
}


// UpdatePasswordController: ฟังก์ชันสำหรับอัพเดตรหัสผ่านใหม่
// UpdatePasswordController: ฟังก์ชันสำหรับอัพเดตรหัสผ่านใหม่
func UpdatePasswordController(c *gin.Context) {
    // โครงสร้างสำหรับรับข้อมูลจาก JSON
    var resetPayload struct {
        ID          uint   `json:"id"`
        NewPassword string `json:"new_password"`
    }

    // Bind JSON Payload
    if err := c.ShouldBindJSON(&resetPayload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
        return
    }

    db := config.DB()

    // ดึงข้อมูลผู้ใช้ตาม ID
    var user entity.Users
    if err := db.First(&user, resetPayload.ID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    // ตรวจสอบความถูกต้องของรหัสผ่านใหม่
    if resetPayload.NewPassword == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "New password is required"})
        return
    }

    // แฮชรหัสผ่านใหม่
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(resetPayload.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    // อัปเดตรหัสผ่าน และล้าง ResetToken
    user.Password = string(hashedPassword)
    user.ResetToken = ""               // Clear ResetToken
    user.ResetTokenExpiry = time.Time{} // Clear ResetTokenExpiry

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    if err := db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
        return
    }

    // ตอบกลับสำเร็จ
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "message": "Password reset successfully",
    })
}
