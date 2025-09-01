package questionnaire

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strings"
)

// ฟังก์ชันสำหรับดึงแบบทดสอบทั้งหมด พร้อม preload คำถาม
func GetAllQuestionnaires(c *gin.Context) {
	var questionnaires []entity.Questionnaire
	db := config.DB()

	// ดึงข้อมูลแบบทดสอบทั้งหมดและเรียงลำดับตาม id จากน้อยไปมาก
	if err := db.Preload("Questions").Order("id asc").Find(&questionnaires).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลแบบทดสอบได้"})
		return
	}

	if len(questionnaires) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "ไม่มีแบบทดสอบในระบบ"})
		return
	}

	c.JSON(http.StatusOK, questionnaires)
}



// ฟังก์ชันสำหรับดึงคำถามทั้งหมด พร้อม preload แบบทดสอบที่เชื่อมโยง
func GetAllQuestions(c *gin.Context) {
	var questions []entity.Question
	// ดึงคำถามทั้งหมดพร้อม preload แบบทดสอบที่เชื่อมโยง
	if err := config.DB().Preload("Questionnaire").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": " ❌ ไม่สามารถดึงข้อมูลคำถามได้",
		})
		return
	}

	if len(questions) == 0 {
		c.JSON(http.StatusNoContent, gin.H{
			"message": "ไม่มีคำถามในระบบ",
		})
		return
	}

	c.JSON(http.StatusOK, questions)
}


// ฟังก์ชันสำหรับดึงผู้ใช้ทั้งหมด พร้อม preload แบบทดสอบที่สร้าง
func GetAllUsers(c *gin.Context) {
	var users []entity.Users

	// ดึงข้อมูลผู้ใช้ พร้อม Preload ความสัมพันธ์ เช่น แบบทดสอบที่สร้าง
	if err := config.DB().Preload("Questionnaires").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": " ❌ ไม่สามารถดึงข้อมูลผู้ใช้ได้",
		})
		return
	}

	if len(users) == 0 {
		c.JSON(http.StatusNoContent, gin.H{
			"message": "ไม่มีผู้ใช้ในระบบ",
		})
		return
	}

	c.JSON(http.StatusOK, users)
}

// ฟังก์ชันสำหรับดึงตัวเลือกอารมณ์ทั้งหมด พร้อม preload คำตอบที่เชื่อมโยง
func GetAllEmotionChoices(c *gin.Context) {
	var emotionChoices []entity.EmotionChoice
	db := config.DB()

	// ดึงข้อมูล EmotionChoice ทั้งหมดและ preload AnswerOptions ที่เชื่อมโยงกับ EmotionChoice
	if err := db.Preload("AnswerOptions").Order("id asc").Find(&emotionChoices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล EmotionChoice ได้"})
		return
	}

	// ตรวจสอบว่าไม่มีข้อมูลในระบบ
	if len(emotionChoices) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "ไม่มีข้อมูล EmotionChoice ในระบบ"})
		return
	}

	// ส่งข้อมูล EmotionChoice ที่มีข้อมูล AnswerOptions กลับไปในรูปแบบ JSON
	c.JSON(http.StatusOK, emotionChoices)
}


type CreateQuestionnaireInput struct {
	NameQuestionnaire string  `json:"nameQuestionnaire" binding:"required"`
	Description       string  `json:"description"`
	UID               uint    `json:"uid" binding:"required"`
	Picture           *string `json:"picture"`        // base64 หรือ data URL
	TestType          *string `json:"testType"`       // optional
	ConditionOnID     *uint   `json:"conditionOnID"`  // optional
	ConditionScore    *int    `json:"conditionScore"` // optional
	ConditionType     *string `json:"conditionType"`  // optional
	Quantity          *int    `json:"quantity"`       // optional (ถ้าไม่ส่ง จะตั้งเป็น 0)
	Priority          *int    `json:"priority"`       // optional ถ้ามีใช้
}

// ฟังก์ชันสำหรับสร้างแบบทดสอบ (Questionnaire) 
func CreateQuestionnaire(c *gin.Context) {
	var in CreateQuestionnaireInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}
	if strings.TrimSpace(in.NameQuestionnaire) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุชื่อแบบทดสอบ (nameQuestionnaire)"})
		return
	}
	if in.UID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UID ไม่ถูกต้อง"})
		return
	}

	db := config.DB()
	err := db.Transaction(func(tx *gorm.DB) error {
		qn := entity.Questionnaire{
			NameQuestionnaire: in.NameQuestionnaire,
			Description:       in.Description,
			UID:               in.UID,
			Picture:           in.Picture,
		}

		// ตั้งค่า optional
		if in.TestType != nil && strings.TrimSpace(*in.TestType) != "" {
			qn.TestType = in.TestType // entity เป็น *string อยู่แล้ว
		}
		qn.ConditionOnID = in.ConditionOnID
		qn.ConditionScore = in.ConditionScore
		qn.ConditionType  = in.ConditionType

		// Quantity: ถ้าไม่ส่งมา ให้เป็น 0
		if in.Quantity != nil {
			qn.Quantity = *in.Quantity
		} else {
			qn.Quantity = 0
		}

		// Priority: ถ้ามี field นี้ใน entity และอยากเก็บ
		if in.Priority != nil {
			qn.Priority = *in.Priority
		}

		if err := tx.Create(&qn).Error; err != nil {
			return err
		}

		// ไม่สร้างคำถาม/คำตอบที่นี่!! (ตาม requirement ใหม่)
		c.Set("createdQuestionnaireID", qn.ID)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างแบบทดสอบได้"})
		return
	}

	id := c.MustGet("createdQuestionnaireID").(uint)
	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างแบบทดสอบสำเร็จ",
		"id":      id,
	})
}

type QuestionWithAnswers struct {
	Question entity.Question       `json:"question"`
	Answers  []entity.AnswerOption `json:"answers"`
}

// ฟังก์ชันสำหรับสร้างคำถามพร้อมคำตอบ
func CreateQuestions(c *gin.Context) {
	var input []QuestionWithAnswers
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": " ❌ ข้อมูลคำถามไม่ถูกต้อง"})
		return
	}

	db := config.DB()
	tx := db.Begin()

	for _, item := range input {
		q := item.Question // priority จะถูก bind อัตโนมัติ
		if err := tx.Create(&q).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถบันทึกคำถามได้"})
			return
		}

		for _, a := range item.Answers {
			a.QID = q.ID
			if err := tx.Create(&a).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถบันทึกคำตอบได้"})
				return
			}
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "บันทึกสำเร็จ"})
}


// DTO สำหรับ Calculation
type CalculationDTO struct {
	CID  uint `json:"cid"`
	QuID uint `json:"quid"`
}

// ฟังก์ชันสำหรับสร้าง Calculation
func createCalculation(db *gorm.DB, criteriaID uint, questionnaireID uint) error {
	calculation := entity.Calculation{
		CID:  criteriaID,
		QuID: questionnaireID,
	}

	// บันทึก Calculation
	if err := db.Create(&calculation).Error; err != nil {
		return err
	}
	return nil
}

// DTO สำหรับ Criteria
type CriteriaDTO struct {
	Description string `json:"description"`
	MinScore    int    `json:"minScore"`
	MaxScore    int    `json:"maxScore"`
}

// ฟังก์ชันสำหรับสร้าง Criteria พร้อมสร้าง Calculation
func CreateCriterias(c *gin.Context) {
	var input struct {
		QuestionnaireID uint         `json:"questionnaireId"`
		Criterias       []CriteriaDTO `json:"criterias"`
	}

	// Bind JSON from the request
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ รูปแบบข้อมูลไม่ถูกต้อง"})
		return
	}
	if len(input.Criterias) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ ไม่มีข้อมูลสำหรับบันทึก"})
		return
	}

	db := config.DB()
	tx := db.Begin()

	created := make([]entity.Criteria, 0, len(input.Criterias))
	for _, it := range input.Criterias {
		criteria := entity.Criteria{
			Description:       it.Description,
			MinCriteriaScore:  it.MinScore,
			MaxCriteriaScore:  it.MaxScore,
		}

		// สร้าง Criteria
		if err := tx.Create(&criteria).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ บันทึกเกณฑ์ไม่สำเร็จ"})
			return
		}
		created = append(created, criteria)

		// สร้าง Calculation โดยใช้ QuID และ CID
		if err := createCalculation(tx, criteria.ID, input.QuestionnaireID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ บันทึก Calculation ไม่สำเร็จ"})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ Commit ล้มเหลว"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "บันทึกสำเร็จ",
		"data":    created, // ส่งข้อมูลที่ถูกสร้างกลับไป
	})
}