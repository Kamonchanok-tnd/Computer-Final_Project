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
    // Get the userID and userRole from context after the token has been validated
    userID := c.GetString("userID") // Get user ID from the validated token
    userRole := c.GetString("userRole") // Get user role (admin or superadmin)
    log.Println("User ID from context in controller: ", userID)
	log.Println("User Role from context in controller: ", userRole)
	log.Println("ID from URL in Controller: ", c.Param("id"))


    // Get admin ID from URL
    id := c.Param("id")

    // เพิ่มการแปลง types สำหรับการเปรียบเทียบ
    if fmt.Sprint(userID) != id && userRole != "superadmin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this admin's data"})
        return
    }

    // Continue with the update logic
    var admin entity.Users
    db := config.DB()

    // Bind JSON body to admin object
    if err := c.ShouldBindJSON(&admin); err != nil {
        log.Println("Error binding JSON:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Find the admin by ID in the database
    var existingAdmin entity.Users
    result := db.Where("id = ?", id).First(&existingAdmin)

    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
            return
        }
        log.Println("Error fetching admin:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admin"})
        return
    }

    // Update the admin's information with new data
    existingAdmin.Username = admin.Username
    existingAdmin.Email = admin.Email
    existingAdmin.PhoneNumber = admin.PhoneNumber
    existingAdmin.Age = admin.Age  // age is already int, no need for strconv.Atoi
    existingAdmin.Gender = admin.Gender

    // Optional: Update ResetToken and ResetTokenExpiry if they are provided
    if admin.ResetToken != "" {
        existingAdmin.ResetToken = admin.ResetToken
        existingAdmin.ResetTokenExpiry = admin.ResetTokenExpiry
    }

    // Save the updated admin data to the database
    if err := db.Save(&existingAdmin).Error; err != nil {
        log.Println("Error updating admin:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update admin"})
        return
    }

    // Respond with the updated admin data
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "data":    existingAdmin,
        "message": "Admin updated successfully",
    })
}

// GetAdminById retrieves a user (admin) information by ID from the 'users' table
func GetAdminById(c *gin.Context) {
    // Get the user ID from the URL parameter
    id := c.Param("id")

    db := config.DB()  // Initialize the database connection

    // Initialize a variable to store the user data (from the 'users' table)
    var user entity.Users

    // Query the database for the user by ID
    result := db.Where("id = ?", id).First(&user)

    // Check if the user was found
    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }
        log.Println("Error fetching user:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
        return
    }

    // Return the user data (admin) in the response
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "data":    user,
        "message": "User retrieved successfully",
    })
}

// DeleteAdmin deletes an admin by ID
func DeleteAdmin(c *gin.Context) {
    // Get the userRole from context after the token has been validated
    userRole := c.GetString("userRole") // Get user role (superadmin)

    // Get admin ID from URL
    id := c.Param("id")

    // Check if the user is a superadmin
    if userRole != "superadmin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this admin"})
        return
    }

    // Initialize the database connection
    db := config.DB()

    // Find the admin by ID in the database
    var admin entity.Users
    result := db.Where("id = ?", id).First(&admin)

    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
            return
        }
        log.Println("Error fetching admin:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admin"})
        return
    }

    // Delete the admin from the database
    if err := db.Delete(&admin).Error; err != nil {
        log.Println("Error deleting admin:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete admin"})
        return
    }

    // Respond with a success message
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "message": "Admin deleted successfully",
    })
}

func EditAdminYourself(c *gin.Context) {
	 // Get the userID and userRole from context after the token has been validated
    userID := c.GetString("userID") // Get user ID from the validated token
    userRole := c.GetString("userRole") // Get user role (admin or superadmin)
    log.Println("User ID from context in controller: ", userID)
	log.Println("User Role from context in controller: ", userRole)
	log.Println("ID from URL in Controller: ", c.Param("id"))


    // Get admin ID from URL
    id := c.Param("id")

    // เพิ่มการแปลง types สำหรับการเปรียบเทียบ
    if fmt.Sprint(userID) != id && userRole != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this admin's data"})
        return
    }

    // Continue with the update logic
    var admin entity.Users
    db := config.DB()

    // Bind JSON body to admin object
    if err := c.ShouldBindJSON(&admin); err != nil {
        log.Println("Error binding JSON:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Find the admin by ID in the database
    var existingAdmin entity.Users
    result := db.Where("id = ?", id).First(&existingAdmin)

    if result.Error != nil {
        if result.Error.Error() == "record not found" {
            c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
            return
        }
        log.Println("Error fetching admin:", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admin"})
        return
    }

    // Update the admin's information with new data
    existingAdmin.Username = admin.Username
    existingAdmin.Email = admin.Email
    existingAdmin.PhoneNumber = admin.PhoneNumber
    existingAdmin.Age = admin.Age  // age is already int, no need for strconv.Atoi
    existingAdmin.Gender = admin.Gender

    // Optional: Update ResetToken and ResetTokenExpiry if they are provided
    if admin.ResetToken != "" {
        existingAdmin.ResetToken = admin.ResetToken
        existingAdmin.ResetTokenExpiry = admin.ResetTokenExpiry
    }

    // Save the updated admin data to the database
    if err := db.Save(&existingAdmin).Error; err != nil {
        log.Println("Error updating admin:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update admin"})
        return
    }

    // Respond with the updated admin data
    c.JSON(http.StatusOK, gin.H{
        "status":  "success",
        "data":    existingAdmin,
        "message": "Admin updated successfully",
    })
}
