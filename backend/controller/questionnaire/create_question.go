package questionnaire

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	
)

// ฟังก์ชันสำหรับดึงรายการแบบทดสอบทั้งหมด
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



// ฟังก์ชันสำหรับดึงคำถามทั้งหมด
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


// ฟังก์ชันสำหรับดึงผู้ใช้งานทั้งหมด พร้อม Preload แบบทดสอบที่ผู้ใช้สร้าง
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


// ฟังก์ชันสำหรับดึงข้อมูล EmotionChoice ทั้งหมดพร้อม AnswerOptions
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



// ฟังก์ชันสำหรับสร้างเเบบทดสอบ
func CreateQuestionnaire(c *gin.Context) {
	type AnswerInput struct {
		Description string `json:"description"`
		Point       int    `json:"point"`
		EmotionChoiceID *uint  `json:"EmotionChoiceID"`
	}

	type QuestionInput struct {
		NameQuestion string        `json:"nameQuestion"`
		Answers      []AnswerInput `json:"answers"`
	}

	type Input struct {
		NameQuestionnaire string          `json:"nameQuestionnaire"`
		Description       string          `json:"description"`
		Quantity          int             `json:"quantity"`
		UID               uint            `json:"uid"`
		TestType          string          `json:"testType"`       // เพิ่มฟิลด์ TestType สำหรับประเภทแบบทดสอบ
		ConditionOnID     *uint           `json:"conditionOnID"`  // เลือกแบบทดสอบก่อนหน้า
		ConditionScore    *int            `json:"conditionScore"` // คะแนนที่ต้องได้
		ConditionType     *string         `json:"conditionType"`  // เงื่อนไขคะแนน
		Questions         []QuestionInput `json:"questions"`
	}

	var input Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	db := config.DB()
	tx := db.Begin()

	// 🔹 สร้าง Questionnaire
	questionnaire := entity.Questionnaire{
		NameQuestionnaire: input.NameQuestionnaire,
		Description:       input.Description,
		Quantity:          input.Quantity,
		UID:               input.UID,
		TestType:          &input.TestType, //ใช้ &input.TestType เพื่อแปลง string เป็น *string
	}

	// ถ้ามีเงื่อนไข (ConditionOnID, ConditionScore, ConditionType ไม่เป็น nil)
	if input.ConditionOnID != nil || input.ConditionScore != nil || input.ConditionType != nil {
		questionnaire.ConditionOnID = input.ConditionOnID
		questionnaire.ConditionScore = input.ConditionScore
		questionnaire.ConditionType = input.ConditionType
	}

	// บันทึกข้อมูล Questionnaire ลงในฐานข้อมูล
	if err := tx.Create(&questionnaire).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถสร้างแบบทดสอบได้"})
		return
	}

	// 🔹 วนลูปสร้าง Questions และ AnswerOptions
	for _, q := range input.Questions {
		question := entity.Question{
			NameQuestion:  q.NameQuestion,
			QuID:          questionnaire.ID,
		}

		if err := tx.Create(&question).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถสร้างคำถามได้"})
			return
		}

		for _, a := range q.Answers {
			answer := entity.AnswerOption{
				Description: a.Description,
				Point:       a.Point,
				QID:         question.ID,
			}

			if a.EmotionChoiceID != nil {
            answer.EmotionChoiceID = answer.EmotionChoiceID
        }

			if err := tx.Create(&answer).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถสร้างคำตอบได้"})
				return
			}
		}
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างแบบทดสอบสำเร็จ",
		"id": questionnaire.ID,
	})
}



// ฟังก์ชันสำหรับสร้างคำถาม, คำตอบเเละลำดับ
type QuestionWithAnswers struct {
	Question entity.Question       `json:"question"`
	Answers  []entity.AnswerOption `json:"answers"`
}

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
