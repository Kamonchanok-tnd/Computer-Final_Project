package assessment

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
	"strconv"
	"fmt"
)

func GetAllAnswerOptions(c *gin.Context) {
	var answerOptions []entity.AnswerOption
	if err := config.DB().Preload("AssessmentAnswers").Find(&answerOptions).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง AnswerOptions ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, answerOptions)
}

func GetAllAssessmentAnswers(c *gin.Context) {
	var answers []entity.AssessmentAnswer
	if err := config.DB().Find(&answers).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง AssessmentAnswers ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, answers)
}

func GetAllAssessmentResults(c *gin.Context) {
	var results []entity.AssessmentResult
	if err := config.DB().
		Preload("Answers").
		Preload("Transaction").
		Find(&results).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง AssessmentResults ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, results)
}

func GetAllCalculations(c *gin.Context) {
	var calculations []entity.Calculation
	if err := config.DB().
		Preload("Criteria").
		Find(&calculations).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Calculations ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, calculations)
}

func GetAllCriteria(c *gin.Context) {
	var criteria []entity.Criteria
	if err := config.DB().
		Preload("Calculations").
		Find(&criteria).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Criteria ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, criteria)
}

func GetAllQuestions(c *gin.Context) {
	var questions []entity.Question
	if err := config.DB().
		Preload("Questionnaire").
		Find(&questions).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Questions ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, questions)
}

func GetAllQuestionnaires(c *gin.Context) {
	var questionnaires []entity.Questionnaire
	if err := config.DB().
		Preload("Users").
		Preload("Questions").
		Find(&questionnaires).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Questionnaires ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, questionnaires)
}

func GetAllTransaction(c *gin.Context) {
	var transaction []entity.Transaction
	if err := config.DB().Find(&transaction).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Transaction ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, transaction)
}


func GetAnswerOptionByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var answerOption entity.AnswerOption
	if err := config.DB().Preload("AssessmentAnswers").First(&answerOption, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ AnswerOption", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, answerOption)
}


func GetAssessmentAnswerByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var answer entity.AssessmentAnswer
	if err := config.DB().First(&answer, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ AssessmentAnswer", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, answer)
}

func GetAssessmentResultByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var result entity.AssessmentResult
	if err := config.DB().
		Preload("Answers").
		Preload("Transaction").
		First(&result, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ AssessmentResult", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, result)
}

func GetCalculationByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var calc entity.Calculation
	if err := config.DB().Preload("Criteria").First(&calc, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Calculation", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, calc)
}

func GetCriteriaByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var criteria entity.Criteria
	if err := config.DB().Preload("Calculations").First(&criteria, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Criteria", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, criteria)
}

func GetQuestionByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var question entity.Question
	if err := config.DB().Preload("Questionnaire").First(&question, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Question", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, question)
}


func GetQuestionnaireByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var questionnaire entity.Questionnaire
	if err := config.DB().
		Preload("Users").
		Preload("Questions").
		First(&questionnaire, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Questionnaire", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, questionnaire)
}

func GetTransactionByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var tx entity.Transaction
	if err := config.DB().First(&tx, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Transaction", "NOT_FOUND")
		return
	}
	c.JSON(http.StatusOK, tx)
}

func CreateAssessmentResult(c *gin.Context) {
	var input entity.AssessmentResult
	if err := c.ShouldBindJSON(&input); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "INVALID_INPUT")
		return
	}
	if err := config.DB().Create(&input).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถสร้าง AssessmentResult ได้", "CREATE_FAILED")
		return
	}
	c.JSON(http.StatusCreated, input)
}

func SubmitAssessmentAnswer(c *gin.Context) {
	var input entity.AssessmentAnswer
	if err := c.ShouldBindJSON(&input); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "INVALID_INPUT")
		return
	}
	if err := config.DB().Create(&input).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถบันทึกคำตอบได้", "CREATE_FAILED")
		return
	}
	c.JSON(http.StatusCreated, input)
}

func FinishAssessment(c *gin.Context) {
	assessmentResultID := c.Param("id")

	var answers []entity.AssessmentAnswer
	if err := config.DB().Where("ar_id = ?", assessmentResultID).Find(&answers).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึงคำตอบเพื่อคำนวณได้", "FETCH_FAILED")
		return
	}

	// คำนวณคะแนนรวม
	total := 0
	for _, ans := range answers {
		total += ans.Point
	}

	// สร้าง Transaction
	aridUint, _ := strconv.ParseUint(assessmentResultID, 10, 64)

	tx := entity.Transaction{
		Description: fmt.Sprintf("การประเมินครั้งที่ %s", assessmentResultID),
		TotalScore:  total,
		ARID:        uint(aridUint),
	}

	if err := config.DB().Create(&tx).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถบันทึก Transaction ได้", "CREATE_FAILED")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "ส่งแบบประเมินสำเร็จ",
		"total_score": total,
		"transaction": tx,
	})
}

func GetAllQuestionnaireGroups(c *gin.Context) {
	var groups []entity.QuestionnaireGroup

	// preload แบบสอบถามในแต่ละกลุ่ม
	if err := config.DB().Preload("Questionnaires").Find(&groups).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลกลุ่มแบบสอบถามได้"})
		return
	}

	c.JSON(http.StatusOK, groups)
}

