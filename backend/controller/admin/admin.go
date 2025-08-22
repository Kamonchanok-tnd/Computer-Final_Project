package admin

import (
   "net/http"
   "github.com/gin-gonic/gin"
   "sukjai_project/config"
   "sukjai_project/entity"
//    "sukjai_project/middlewares"
   "log"
//    "strconv"
"fmt"
)

// GetAllAdmin retrieves all users with role 'admin' from the 'users' table
func GetAllAdmin(c *gin.Context) {
   var users []entity.Users
   db := config.DB()  // Initialize the database connection

   // Query for users with the role 'admin'
   results := db.Where("role = ?", "admin").Find(&users)

   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }
   if len(users) == 0 {
       c.JSON(http.StatusNoContent, gin.H{"message": "No admin users found"})
       return
   }
   c.JSON(http.StatusOK, users)
}

// EditAdmin updates an admin's information by ID
func EditAdmin(c *gin.Context) {
    // ดึง userID และ userRole จาก context หลังจากตรวจสอบ token
    userID := c.GetString("userID")     // ดึง user ID จาก token
    userRole := c.GetString("userRole") // ดึง role (admin หรือ superadmin)
    log.Println("User ID จาก context:", userID)
    log.Println("User Role จาก context:", userRole)
    log.Println("ID จาก URL:", c.Param("id"))

    // ดึง admin ID จาก URL
    id := c.Param("id")

    // ตรวจสอบสิทธิ์: แก้ไขตัวเอง หรือ superadmin เท่านั้น
    if fmt.Sprint(userID) != id && userRole != "superadmin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ดูแลระบบนี้"})
        return
    }

    db := config.DB()

    // Bind JSON body ไปยัง admin object
    var admin entity.Users
    if err := c.ShouldBindJSON(&admin); err != nil {
        log.Println("เกิดข้อผิดพลาดในการรับข้อมูล:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    // ค้นหาผู้ดูแลระบบตาม ID
    var existingAdmin entity.Users
    result := db.Where("id = ?", id).First(&existingAdmin)
    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ดูแลระบบ"})
            return
        }
        log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ"})
        return
    }

    // อัปเดตข้อมูลผู้ดูแลระบบ
    existingAdmin.Username = admin.Username
    existingAdmin.Email = admin.Email
    existingAdmin.PhoneNumber = admin.PhoneNumber
    existingAdmin.Age = admin.Age
    existingAdmin.Gender = admin.Gender

    // อัปเดต ResetToken และ ResetTokenExpiry หากมีข้อมูล
    if admin.ResetToken != "" {
        existingAdmin.ResetToken = admin.ResetToken
        existingAdmin.ResetTokenExpiry = admin.ResetTokenExpiry
    }

    // บันทึกข้อมูลผู้ดูแลระบบที่แก้ไขแล้ว
    if err := db.Save(&existingAdmin).Error; err != nil {
        log.Println("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ดูแลระบบ:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ดูแลระบบ"})
        return
    }

    // ส่งข้อมูลผู้ดูแลระบบที่แก้ไขแล้วกลับ
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "data":    existingAdmin,
        "message": "แก้ไขข้อมูลผู้ดูแลระบบเรียบร้อยแล้ว",
    })
}

// GetAdminById retrieves a user (admin) information by ID from the 'users' table
func GetAdminById(c *gin.Context) {
    // ดึง user ID จาก URL parameter
    id := c.Param("id")

    db := config.DB()  // เรียกใช้งาน database

    // ประกาศตัวแปรสำหรับเก็บข้อมูลผู้ใช้
    var user entity.Users

    // ค้นหาผู้ใช้จากฐานข้อมูลตาม ID
    result := db.Where("id = ?", id).First(&user)

    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้"})
            return
        }
        log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้"})
        return
    }

    // ส่งข้อมูลผู้ใช้กลับ
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "data":    user,
        "message": "โหลดข้อมูลผู้ใช้เรียบร้อยแล้ว",
    })
}

// DeleteAdmin deletes an admin by ID
func DeleteAdmin(c *gin.Context) {
    // Get the userRole from context after the token has been validated
    userRole := c.GetString("userRole") // Get user role (superadmin)

    // Check if the user is a superadmin
    if userRole != "superadmin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "คุณไม่มีสิทธิ์ในการลบผู้ดูแลระบบ"})
        return
    }

    // Get admin ID from URL
    id := c.Param("id")

    // Initialize the database connection
    db := config.DB()

    // Count the total number of admins (admin + superadmin)
    var adminCount int64
    if err := db.Model(&entity.Users{}).
        Where("role IN ?", []string{"admin", "superadmin"}).
        Count(&adminCount).Error; err != nil {
        log.Println("เกิดข้อผิดพลาดในการนับผู้ดูแลระบบ:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบจำนวนผู้ดูแลระบบ"})
        return
    }

    // Find the admin to delete
    var admin entity.Users
    result := db.Where("id = ?", id).First(&admin)
    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ดูแลระบบ"})
            return
        }
        log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ"})
        return
    }

    // Prevent deletion if only one admin remains
    if adminCount <= 1 {
        c.JSON(http.StatusForbidden, gin.H{"error": "ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้"})
        return
    }

    // Delete the admin from the database
    if err := db.Delete(&admin).Error; err != nil {
        log.Println("เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ"})
        return
    }

    // Respond with success
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "message": "ลบผู้ดูแลระบบเรียบร้อยแล้ว",
    })
}


func EditAdminYourself(c *gin.Context) {
    // Get the userID and userRole from context after the token has been validated
    userID := c.GetString("userID")   // Get user ID from the validated token
    userRole := c.GetString("userRole") // Get user role (admin or superadmin)
    log.Println("User ID จาก context:", userID)
    log.Println("User Role จาก context:", userRole)
    log.Println("ID จาก URL:", c.Param("id"))

    // Get admin ID from URL
    id := c.Param("id")

    // ตรวจสอบสิทธิ์: แก้ไขเฉพาะตัวเอง หรือ admin ที่มีสิทธิ์
    if fmt.Sprint(userID) != id && userRole != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ดูแลระบบนี้"})
        return
    }

    db := config.DB()

    // Bind JSON body to admin object
    var admin entity.Users
    if err := c.ShouldBindJSON(&admin); err != nil {
        log.Println("เกิดข้อผิดพลาดในการรับข้อมูล:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    // Find the admin by ID in the database
    var existingAdmin entity.Users
    result := db.Where("id = ?", id).First(&existingAdmin)
    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ดูแลระบบ"})
            return
        }
        log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ"})
        return
    }

    // Update the admin's information with new data
    existingAdmin.Username = admin.Username
    existingAdmin.Email = admin.Email
    existingAdmin.PhoneNumber = admin.PhoneNumber
    existingAdmin.Age = admin.Age
    existingAdmin.Gender = admin.Gender

    // Optional: Update ResetToken and ResetTokenExpiry if provided
    if admin.ResetToken != "" {
        existingAdmin.ResetToken = admin.ResetToken
        existingAdmin.ResetTokenExpiry = admin.ResetTokenExpiry
    }

    // Save the updated admin data to the database
    if err := db.Save(&existingAdmin).Error; err != nil {
        log.Println("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ดูแลระบบ:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ดูแลระบบ"})
        return
    }

    // Respond with the updated admin data
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "data":    existingAdmin,
        "message": "แก้ไขข้อมูลผู้ดูแลระบบเรียบร้อยแล้ว",
    })
}
