package assessment

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
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

func GetAllScores(c *gin.Context) {
	var scores []entity.Score
	if err := config.DB().Find(&scores).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Scores ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, scores)
}


