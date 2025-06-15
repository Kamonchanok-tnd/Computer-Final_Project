package users

import (
   "net/http"
   "github.com/gin-gonic/gin"
   "sukjai_project/config"
   "sukjai_project/entity"
)

func GetAll(c *gin.Context) {
   var users []entity.Users
   db := config.DB()
   // ดึงข้อมูลผู้ใช้ทั้งหมดในฐานข้อมูล โดยไม่ต้อง Preload "Gender"
   results := db.Find(&users)
   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }
   if len(users) == 0 {
       c.JSON(http.StatusNoContent, gin.H{"message": "No users found"})
       return
   }
   c.JSON(http.StatusOK, users)
}

func Get(c *gin.Context) {
   ID := c.Param("id")
   var user entity.Users
   db := config.DB()
   // ค้นหาผู้ใช้ตาม ID โดยไม่ต้อง Preload "Gender"
   results := db.First(&user, ID)
   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
       return
   }
   if user.ID == 0 {
       c.JSON(http.StatusNoContent, gin.H{"message": "User not found"})
       return
   }
   c.JSON(http.StatusOK, user)
}

func Update(c *gin.Context) {
   var user entity.Users
   UserID := c.Param("id")
   db := config.DB()
   result := db.First(&user, UserID)
   if result.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "User ID not found"})
       return
   }

   // Bind the incoming request payload to user
   if err := c.ShouldBindJSON(&user); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
       return
   }

   // Check if the password is being updated, if so hash it
   if user.Password != "" {
       hashedPassword, err := config.HashPassword(user.Password)
       if err != nil {
           c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
           return
       }
       user.Password = hashedPassword
   }

   // Save the updated user
   result = db.Save(&user)
   if result.Error != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update user"})
       return
   }

   c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func Delete(c *gin.Context) {
   id := c.Param("id")
   db := config.DB()
   var user entity.Users
   result := db.First(&user, id)
   if result.Error != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
       return
   }

   // Delete the user from the database
   if tx := db.Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete user"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
