package admin

import (
   "net/http"
   "github.com/gin-gonic/gin"
   "sukjai_project/config"
   "sukjai_project/entity"
   "log"
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
    var admin entity.Users
    db := config.DB()  // Initialize the database connection

    // Bind JSON body to the admin object
    if err := c.ShouldBindJSON(&admin); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Get admin ID from the URL
    id := c.Param("id")

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

    // Check if the current user has 'admin' role
    if existingAdmin.Role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this admin"})
        return
    }

    // Update the admin's information with new data
    existingAdmin.Username = admin.Username
    existingAdmin.Email = admin.Email
    existingAdmin.PhoneNumber = admin.PhoneNumber
    existingAdmin.Age = admin.Age
    existingAdmin.Gender = admin.Gender

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
