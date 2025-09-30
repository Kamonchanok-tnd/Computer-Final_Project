package articletype
import (
	"net/http"
	"strconv"
	"strings"
	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"sukjai_project/config"
	"sukjai_project/entity"
)

// ---------- Helpers ----------
func trimAT(a *entity.ArticleType) {
	a.Name = strings.TrimSpace(a.Name)
	a.Description = strings.TrimSpace(a.Description)
}

// GET /article-types
func GetAllArticleTypes(c *gin.Context) {
	db := config.DB()

	var types []entity.ArticleType
	if err := db.Order("id asc").Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงประเภทบทความได้"})
		return
	}

	if len(types) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "ยังไม่มีประเภทบทความ"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GET /article-types/:id
func GetArticleTypeByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var at entity.ArticleType
	if err := db.First(&at, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประเภทบทความที่ระบุ"})
		return
	}

	c.JSON(http.StatusOK, at)
}

// POST /article-types
func CreateArticleType(c *gin.Context) {
	db := config.DB()

	var input entity.ArticleType
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
		return
	}

	trimAT(&input)

	// Validate ตาม valid tag ใน struct
	if ok, err := govalidator.ValidateStruct(input); !ok {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	// กันชื่อซ้ำ (case-insensitive เล็กน้อยโดยการ trim + เทียบตรง)
	var cnt int64
	if err := db.Model(&entity.ArticleType{}).
		Where("name = ?", input.Name).
		Count(&cnt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบข้อมูลซ้ำไม่สำเร็จ"})
		return
	}
	if cnt > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "มีชื่อประเภทบทความนี้อยู่แล้ว"})
		return
	}

	at := entity.ArticleType{
		Name:        input.Name,
		Description: input.Description,
	}

	if err := db.Create(&at).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกประเภทบทความไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusCreated, at)
}

// PATCH /article-types/:id
func UpdateArticleType(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var exist entity.ArticleType
	if err := db.First(&exist, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประเภทบทความที่ระบุ"})
		return
	}

	var in struct {
		Name        *string `json:"name"        valid:"optional~ok,stringlength(1|128)~ชื่อประเภทบทความยาวเกินไป"`
		Description *string `json:"description" valid:"optional~ok,stringlength(1|1000)~คำอธิบายยาวเกินไป"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
		return
	}

	// สร้างตัว temp สำหรับ validate ตาม tag (เฉพาะฟิลด์ที่ส่งมา)
	temp := entity.ArticleType{
		Name:        exist.Name,
		Description: exist.Description,
	}
	if in.Name != nil {
		temp.Name = strings.TrimSpace(*in.Name)
	}
	if in.Description != nil {
		temp.Description = strings.TrimSpace(*in.Description)
	}

	if ok, err := govalidator.ValidateStruct(temp); !ok {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	// เช็คชื่อซ้ำถ้ามีส่งชื่อใหม่มาและต่างจากเดิม
	if in.Name != nil && temp.Name != exist.Name {
		var cnt int64
		if err := db.Model(&entity.ArticleType{}).
			Where("name = ?", temp.Name).
			Count(&cnt).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบข้อมูลซ้ำไม่สำเร็จ"})
			return
		}
		if cnt > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "มีชื่อประเภทบทความนี้อยู่แล้ว"})
			return
		}
	}

	// อัปเดต
	exist.Name = temp.Name
	exist.Description = temp.Description

	if err := db.Save(&exist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตประเภทบทความไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, exist)
}


// DELETE /article-types/:id  (Soft delete)
func DeleteArticleType(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	// กันกรณี id ไม่ใช่ตัวเลข
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสไม่ถูกต้อง"})
		return
	}

	// ดึงเฉพาะรายการที่ยังไม่ถูกลบ (ปกติ GORM จะไม่เห็นรายการที่ลบไปแล้วอยู่แล้ว)
	var at entity.ArticleType
	if err := db.First(&at, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประเภทบทความที่ระบุ"})
		return
	}


	// ตรวจว่าถูกใช้งานอยู่หรือไม่ (มีบทความ/ข้อความอ้างถึงอยู่)
	var useCount int64
	if err := db.Model(&entity.WordHealingContent{}).
		Where("article_type_id = ? AND deleted_at IS NULL", id).
		Count(&useCount).Error; err != nil {
	c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถตรวจสอบการใช้งานได้"})
	return
	}
	if useCount > 0 {
	c.JSON(http.StatusConflict, gin.H{
		"error":  "ประเภทนี้กำลังถูกเรียกใช้ ไม่สามารถลบได้",
		"code":   "IN_USE",   // ให้ FE จับ pattern นี้
		"usages": useCount,
	})
	return
	}

	// Soft delete: ตั้งค่า deleted_at (เพราะใช้ gorm.Model)
	if err := db.Delete(&at).Error; err != nil {
		// ถ้ามี FK constraint อาจลบไม่ได้
		c.JSON(http.StatusConflict, gin.H{"error": "ไม่สามารถลบได้ อาจถูกใช้งานอยู่"})
		return
	}

	
	c.JSON(http.StatusOK, gin.H{
		"message": "ลบแบบ soft delete สำเร็จ",
		"id":      at.ID,
	})
}
