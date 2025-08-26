package assessment

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
)

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

//////////////////////////////////////////////////////////////// USER //////////////////////////////////////////////////////////////////////

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

func GetAllAnswerOptions(c *gin.Context) {
	var answerOptions []entity.AnswerOption
	if err := config.DB().Preload("AssessmentAnswers").Find(&answerOptions).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง AnswerOptions ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, answerOptions)
}

func GetAllCriteria(c *gin.Context) {
	quIDStr := c.Query("qu_id")

	// ถ้าไม่ส่ง qu_id -> พฤติกรรมเดิม
	if quIDStr == "" {
		var criteria []entity.Criteria
		if err := config.DB().
			Preload("Calculations").
			Find(&criteria).Error; err != nil {
			util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Criteria ได้", "FETCH_FAILED")
			return
		}
		c.JSON(http.StatusOK, criteria)
		return
	}

	// มี qu_id -> ดึงเฉพาะ Criteria ที่มี Calculation ของ qu_id นี้
	quID, err := strconv.ParseUint(quIDStr, 10, 64)
	if err != nil {
		util.HandleError(c, http.StatusBadRequest, "qu_id ไม่ถูกต้อง", "INVALID_QU_ID")
		return
	}

	var criteria []entity.Criteria

	// subquery: เลือก c_id จากตาราง calculations ตาม qu_id
	sub := config.DB().
		Model(&entity.Calculation{}).
		Select("c_id").
		Where("qu_id = ?", quID)

	// ดึง Criteria เฉพาะที่อยู่ใน subquery และ preload Calculations เฉพาะของ qu_id นี้
	if err := config.DB().
		Where("id IN (?)", sub).
		Preload("Calculations", "qu_id = ?", quID).
		Find(&criteria).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Criteria ตาม qu_id ได้", "CRITERIA_FETCH_FAILED")
		return
	}

	c.JSON(http.StatusOK, criteria)
}

func GetAllTransaction(c *gin.Context) {
	var transaction []entity.Transaction
	if err := config.DB().Find(&transaction).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึง Transaction ได้", "FETCH_FAILED")
		return
	}
	c.JSON(http.StatusOK, transaction)
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

	// ✅ Log ค่าที่รับมา
	fmt.Printf("รับค่าคำตอบ: %+v\n", input)

	if err := config.DB().Create(&input).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถบันทึกคำตอบได้", "CREATE_FAILED")
		return
	}
	c.JSON(http.StatusCreated, input)
}

func FinishAssessment(c *gin.Context) {
	assessmentResultID := c.Param("id")
	log.Println("📥 เรียก FinishAssessment, id =", assessmentResultID)

	if assessmentResultID == "" {
		util.HandleError(c, http.StatusBadRequest, "ต้องมี assessmentResultID", "MISSING_ARID")
		return
	}

	// 1) โหลดคำตอบทั้งหมด
	var answers []entity.AssessmentAnswer
	if err := config.DB().
		Where("ar_id = ?", assessmentResultID).
		Find(&answers).Error; err != nil {
		log.Println("❌ Load answers error:", err)
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึงคำตอบเพื่อคำนวณได้", "FETCH_FAILED")
		return
	}
	log.Printf("📊 ดึง answers ได้ %d records\n", len(answers))

	if len(answers) == 0 {
		log.Println("⚠️ ยังไม่มีคำตอบสำหรับการประเมินนี้")
		util.HandleError(c, http.StatusUnprocessableEntity, "ยังไม่มีคำตอบ", "NO_ANSWERS")
		return
	}

	// 2) รวมคะแนน
	total := 0
	for _, ans := range answers {
		total += ans.Point
	}
	log.Println("📊 รวมคะแนน =", total)

	// 3) โหลด AR
	aridUint, err := strconv.ParseUint(assessmentResultID, 10, 64)
	if err != nil {
		log.Println("❌ แปลง assessmentResultID ไม่ได้:", err)
		util.HandleError(c, http.StatusBadRequest, "รูปแบบ assessmentResultID ไม่ถูกต้อง", "BAD_ARID")
		return
	}

	var ar entity.AssessmentResult
	if err := config.DB().
		Preload("Questionnaire").
		Preload("QuestionnaireGroup").
		Where("id = ?", aridUint).
		First(&ar).Error; err != nil {
		log.Println("❌ Load AR error:", err)
		util.HandleError(c, http.StatusNotFound, "ไม่พบ AssessmentResult", "NOT_FOUND")
		return
	}
	log.Printf("📄 AR โหลดสำเร็จ: QuID=%d, QGID=%d\n", ar.QuID, ar.QGID)

	// 4) เตรียมค่า questionnaire/group
	qName := "ไม่ทราบชื่อแบบสอบถาม"
	testType := ""
	if ar.Questionnaire.ID != 0 {
		qName = ar.Questionnaire.NameQuestionnaire
		if ar.Questionnaire.TestType != nil {
			testType = *ar.Questionnaire.TestType
		}
	}
	groupName := "ไม่ทราบกลุ่ม"
	if ar.QuestionnaireGroup.ID != 0 {
		groupName = ar.QuestionnaireGroup.Name
	}
	log.Println("📄 Questionnaire =", qName, "Group =", groupName, "TestType =", testType)

	// 5) โหลด criteria
	var criteriaList []entity.Criteria
	if err := config.DB().
		Joins("JOIN calculations ON calculations.c_id = criteria.id").
		Where("calculations.qu_id = ?", ar.QuID).
		Find(&criteriaList).Error; err != nil {
		log.Println("❌ Load criteria error:", err)
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถดึงเกณฑ์ได้", "CRITERIA_FETCH_FAILED")
		return
	}
	log.Printf("📊 ดึง criteria ได้ %d records\n", len(criteriaList))

	if len(criteriaList) == 0 {
		util.HandleError(c, http.StatusUnprocessableEntity, "ยังไม่ได้ตั้งค่าเกณฑ์", "NO_CRITERIA")
		return
	}

	// 6) หา criteria ที่ match
	var matchedCriteria entity.Criteria
	found := false
	for _, cr := range criteriaList {
		if total >= cr.MinCriteriaScore && total <= cr.MaxCriteriaScore {
			matchedCriteria = cr
			found = true
			break
		}
	}
	if !found {
		log.Println("❌ คะแนนไม่ตรงกับเกณฑ์ใดเลย")
		util.HandleError(c, http.StatusUnprocessableEntity, "คะแนนไม่ตรงกับเกณฑ์", "NO_MATCHING_CRITERIA")
		return
	}
	log.Println("✅ Match criteria:", matchedCriteria.Description)

	// 7) คำนวณ result/resultLevel
	result := matchedCriteria.Description
	resultLevel := "neutral"

	// min-max score
	minScore, maxScore := math.MaxInt32, math.MinInt32
	for _, cr := range criteriaList {
		if cr.MinCriteriaScore < minScore {
			minScore = cr.MinCriteriaScore
		}
		if cr.MaxCriteriaScore > maxScore {
			maxScore = cr.MaxCriteriaScore
		}
	}
	if minScore == math.MaxInt32 {
		minScore = 0
	}
	if maxScore == math.MinInt32 {
		maxScore = 0
	}

	if len(criteriaList) == 2 {
		if testType == "positive" {
			if matchedCriteria.MaxCriteriaScore == maxScore {
				resultLevel = "happy"
			} else {
				resultLevel = "sad"
			}
		} else if testType == "negative" {
			if matchedCriteria.MinCriteriaScore == minScore {
				resultLevel = "happy"
			} else {
				resultLevel = "sad"
			}
		} else {
			resultLevel = "bored"
		}
	} else {
		boredMid := (minScore + maxScore) / 2
		for _, cr := range criteriaList {
			if strings.Contains(cr.Description, "ปานกลาง") {
				boredMid = (cr.MinCriteriaScore + cr.MaxCriteriaScore) / 2
				break
			}
		}
		if testType == "negative" {
			if total < boredMid {
				resultLevel = "happy"
			} else if total > boredMid {
				resultLevel = "sad"
			} else {
				resultLevel = "bored"
			}
		} else if testType == "positive" {
			if total < boredMid {
				resultLevel = "sad"
			} else if total > boredMid {
				resultLevel = "happy"
			} else {
				resultLevel = "bored"
			}
		} else {
			resultLevel = "bored"
		}
	}
	log.Println("🎯 Result:", result, "Level:", resultLevel)

	// 8) หาค่า MaxScore
	finalMax := 0
	for _, cr := range criteriaList {
		if cr.MaxCriteriaScore > finalMax {
			finalMax = cr.MaxCriteriaScore
		}
	}

	// 9) เตรียม Transaction
	tx := entity.Transaction{
		Description:        qName,
		TotalScore:         total,
		MaxScore:           finalMax,
		Result:             result,
		ResultLevel:        resultLevel,
		TestType:           testType,
		QuestionnaireGroup: groupName,
		ARID:               uint(aridUint),
	}
	log.Printf("📝 เตรียม Transaction: %+v\n", tx)

	// 10) Save Transaction
	if err := config.DB().Create(&tx).Error; err != nil {
		log.Println("❌ Transaction Create Error:", err)
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถบันทึก Transaction ได้", "CREATE_FAILED")
		return
	}
	log.Println("✅ Transaction created, ID =", tx.ID)

	// 11) Response
	c.JSON(http.StatusCreated, gin.H{
		"message":     "ส่งแบบประเมินสำเร็จ",
		"total_score": total,
		"transaction": tx,
	})
}

// GET /assessments/available-next?user_id=1
// GET /assessments/available-next?user_id=1&trigger_context=onLogin&last_quid=4
func GetAvailableGroupsAndNextQuestionnaire(c *gin.Context) {
	uid := c.Query("user_id")
	context := c.Query("trigger_context") // "", "onLogin", "afterChat", "interval"
	lastQuidStr := c.Query("last_quid")

	if uid == "" {
		util.HandleError(c, http.StatusBadRequest, "ต้องมี user_id", "MISSING_USER")
		return
	}

	var lastQuid uint
	if lastQuidStr != "" {
		if parsed, err := strconv.ParseUint(lastQuidStr, 10, 64); err == nil {
			lastQuid = uint(parsed)
		}
	}

	// โหลดกลุ่ม (ถ้าระบุ context มาก็กรองตาม trigger_type)
	var groups []entity.QuestionnaireGroup
	q := config.DB()
	if context != "" {
		q = q.Where("trigger_type = ?", context)
	}
	if err := q.Find(&groups).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "โหลดกลุ่มไม่สำเร็จ", "FETCH_FAILED")
		return
	}

	type NextQ struct {
		ID             uint   `json:"id"`
		Name           string `json:"name"`
		OrderInGroup   uint   `json:"order_in_group"`
		ConditionOnID  *uint  `json:"condition_on_id"`
		ConditionScore *int   `json:"condition_score"`
	}

	type GroupOut struct {
		ID            uint    `json:"id"`
		Name          string  `json:"name"`
		Description   string  `json:"description"`
		FrequencyDays *uint   `json:"frequency_days"`
		TriggerType   *string `json:"trigger_type"`
		Available     bool    `json:"available"`
		Reason        string  `json:"reason"`
		Next          *NextQ  `json:"next"`
		PendingQuids  []uint  `json:"pending_quids"`
	}

	var out []GroupOut

	for _, g := range groups {
		trigger := ""
		if g.TriggerType != nil {
			trigger = *g.TriggerType
		}

		// 1) หาแบบสอบถามที่ยังไม่ได้ทำในกลุ่มนี้ (เรียงลำดับตาม order_in_group)
		var links []entity.QuestionnaireGroupQuestionnaire
		if err := config.DB().
			Preload("Questionnaire").
			Where("questionnaire_group_id = ?", g.ID).
			Order("order_in_group ASC").
			Find(&links).Error; err != nil {
			// ข้ามกลุ่มนี้ถ้าโหลดลิงก์ไม่สำเร็จ
			continue
		}

		var pendingQuids []uint
		var nextQ *NextQ

		for _, l := range links {
			qn := l.Questionnaire

			// 1) ข้ามแบบที่เพิ่งทำล่าสุด (กัน loop วนกลับ)
			if lastQuid != 0 && qn.ID == lastQuid {
				continue
			}

			// 2) ข้ามถ้าเคยทำแบบนี้ไปแล้ว
			// ข้ามถ้าเคยมี AssessmentResult แล้ว (ใช้คอลัมน์ qu_id ให้ตรง schema)
			var cnt int64
			if err := config.DB().Model(&entity.AssessmentResult{}).
				Where("uid = ? AND qu_id = ?", uid, qn.ID).
				Count(&cnt).Error; err != nil {
				log.Println("⚠️ count ar error:", err)
			}
			if cnt > 0 {
				continue
			}
			log.Printf("🔎 check done? uid=%s qu_id=%d -> count=%d", uid, qn.ID, cnt)


			// 3) ตรวจเงื่อนไขพึ่งพา (ถ้ามี)
			if qn.ConditionOnID != nil && qn.ConditionScore != nil && qn.ConditionType != nil {
				var tx entity.Transaction
				// NOTE: ถ้า schema คุณใช้ "quid" ให้ใช้ ar.quid; ถ้าใช้ "qu_id" ให้แก้เป็น ar.qu_id
				err := config.DB().
					Joins("JOIN assessment_results ar ON ar.id = transactions.ar_id").
					Where("ar.uid = ? AND ar.qu_id = ?", uid, *qn.ConditionOnID).
					Order("transactions.created_at DESC").
					First(&tx).Error
				if err != nil {
					// ยังไม่เคยทำตัวที่พึ่งพา → ทำตัวนี้ไม่ได้
					continue
				}

				switch *qn.ConditionType {
				case "greaterThan":
					// อนุญาต ">= threshold" ตามสเปค 9Q หลัง 2Q >= 1
					if tx.TotalScore < *qn.ConditionScore {
						continue
					}
				case "lessThan":
					// อนุญาต "<= threshold"
					if tx.TotalScore > *qn.ConditionScore {
						continue
					}
				default:
					// ไม่รู้จักชนิดเงื่อนไข ก็กันไว้ก่อน
					continue
				}
			}

			// 4) ถึงจุดนี้ “ทำได้”
			pendingQuids = append(pendingQuids, qn.ID)

			// ตัวแรกที่ทำได้คือ nextQ
			if nextQ == nil {
				nextQ = &NextQ{
					ID:             qn.ID,
					Name:           qn.NameQuestionnaire,
					OrderInGroup:   l.OrderInGroup,
					ConditionOnID:  qn.ConditionOnID,
					ConditionScore: qn.ConditionScore,
				}
			}
		}
		

		// 2) ตัดสินใจเรื่อง available/reason ตาม trigger
		available := false
		reason := "ทำครบกลุ่มนี้แล้ว"
		if len(pendingQuids) > 0 {
			switch trigger {
			case "interval":
				// เช็คความถี่ตามวันล่าสุดที่ทำในกลุ่ม
				var lastTx entity.Transaction
				err := config.DB().
					Joins("JOIN assessment_results ar ON ar.id = transactions.ar_id").
					Where("ar.uid = ? AND ar.qg_id = ?", uid, g.ID).
					Order("transactions.created_at DESC").
					First(&lastTx).Error

				if err == nil && g.FrequencyDays != nil {
					wait := time.Duration(*g.FrequencyDays) * 24 * time.Hour
					if time.Since(lastTx.CreatedAt) < wait {
						available = false
						reason = fmt.Sprintf("ต้องรอครบ %d วัน", *g.FrequencyDays)
					} else {
						available = true
						reason = fmt.Sprintf("เหลืออีก %d ฉบับ", len(pendingQuids))
					}
				} else {
					// ไม่เคยทำในกลุ่มนี้หรือไม่กำหนดความถี่
					available = true
					reason = fmt.Sprintf("เหลืออีก %d ฉบับ", len(pendingQuids))
				}
			default: // "onLogin", "afterChat" หรือค่าอื่น
				// 🔁 ไม่ปิดกลุ่ม onLogin หลังทำข้อแรก — ให้ทำต่อจนหมดกลุ่ม
				available = true
				reason = fmt.Sprintf("เหลืออีก %d ฉบับ", len(pendingQuids))
			}
		}

		out = append(out, GroupOut{
			ID:            g.ID,
			Name:          g.Name,
			Description:   g.Description,
			FrequencyDays: g.FrequencyDays,
			TriggerType:   g.TriggerType,
			Available:     available,
			Reason:        reason,
			Next:          nextQ,
			PendingQuids:  pendingQuids,
		})
	}
	

	c.JSON(http.StatusOK, out)
}


//////////////////////////////////////////////////////////////// ADMIN //////////////////////////////////////////////////////////////////////

func GetAllQuestionnaireGroups(c *gin.Context) {
	var groups []entity.QuestionnaireGroup

	// preload แบบสอบถามในแต่ละกลุ่ม
	if err := config.DB().Preload("Questionnaires").Find(&groups).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลกลุ่มแบบสอบถามได้"})
		return
	}

	c.JSON(http.StatusOK, groups)
}

// ดึงกลุ่มแบบสอบถามแบบ “เรียงตาม OrderInGroup”
func GetQuestionnaireGroupByID(c *gin.Context) {
	id := c.Param("id")

	var group entity.QuestionnaireGroup
	// ดึงกลุ่ม + join table + เรียงตาม order
	if err := config.DB().
		Preload("QuestionnaireGroupQuestionnaires", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_in_group ASC")
		}).
		Preload("QuestionnaireGroupQuestionnaires.Questionnaire").
		First(&group, id).Error; err != nil {
		util.HandleError(c, http.StatusNotFound, "ไม่พบ Group", "NOT_FOUND")
		return
	}

	// แปลงเป็น payload ที่ frontend ใช้ง่าย
	type Q struct {
		ID             uint   `json:"id"`
		Name           string `json:"name"`
		OrderInGroup   uint   `json:"order_in_group"`
		ConditionOnID  *uint  `json:"condition_on_id"`
		ConditionScore *int   `json:"condition_score"`
	}
	payload := struct {
		ID            uint   `json:"id"`
		Name          string `json:"name"`
		Description   string `json:"description"`
		FrequencyDays *uint  `json:"frequency_days"`
		Items         []Q    `json:"questionnaires"`
	}{
		ID:            group.ID,
		Name:          group.Name,
		Description:   group.Description,
		FrequencyDays: group.FrequencyDays,
	}

	for _, link := range group.QuestionnaireGroupQuestionnaires {
		payload.Items = append(payload.Items, Q{
			ID:             link.Questionnaire.ID,
			Name:           link.Questionnaire.NameQuestionnaire,
			OrderInGroup:   link.OrderInGroup,
			ConditionOnID:  link.Questionnaire.ConditionOnID,
			ConditionScore: link.Questionnaire.ConditionScore,
		})
	}

	c.JSON(http.StatusOK, payload)
}

// อัปเดตความถี่ของกลุ่ม (เปลี่ยน 14 เป็น 7/21 ฯลฯ)
type updateFreqReq struct {
	FrequencyDays *uint `json:"frequency_days"` // null = ทำครั้งเดียว
}

func UpdateQuestionnaireGroupFrequency(c *gin.Context) {
	id := c.Param("id")
	var body updateFreqReq

	if err := c.ShouldBindJSON(&body); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "INVALID_INPUT")
		return
	}

	// ✅ สร้าง description ตาม FrequencyDays
	var description string
	if body.FrequencyDays == nil {
		description = "หลังใช้แอปพลิเคชัน 1 ครั้ง"
	} else {
		description = fmt.Sprintf("หลังใช้แอปพลิเคชันทุกๆ %d วัน", *body.FrequencyDays)
	}

	// ✅ อัปเดตทั้ง frequency_days และ description
	if err := config.DB().Model(&entity.QuestionnaireGroup{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"frequency_days": body.FrequencyDays,
			"description":    description,
		}).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "อัปเดตความถี่ไม่สำเร็จ", "UPDATE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "updated",
		"description": description,
	})
}

// จัดลำดับแบบสอบถามในกลุ่ม (drag & drop แล้วส่งมาเป็น array)
type reorderReq struct {
	QuestionnaireIDs []uint `json:"questionnaire_ids"` // ลำดับใหม่จากซ้าย→ขวา
}

func ReorderQuestionnairesInGroup(c *gin.Context) {
	gid := c.Param("id")

	var body reorderReq
	if err := c.ShouldBindJSON(&body); err != nil || len(body.QuestionnaireIDs) == 0 {
		util.HandleError(c, http.StatusBadRequest, "payload ไม่ถูกต้อง", "INVALID_INPUT")
		return
	}

	// loop อัปเดต order_in_group
	for idx, qid := range body.QuestionnaireIDs {
		if err := config.DB().Model(&entity.QuestionnaireGroupQuestionnaire{}).
			Where("questionnaire_group_id = ? AND questionnaire_id = ?", gid, qid).
			Update("order_in_group", idx+1).Error; err != nil {
			util.HandleError(c, http.StatusInternalServerError, "อัปเดตลำดับไม่สำเร็จ", "UPDATE_FAILED")
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "reordered"})
}

// เพิ่มแบบสอบถามเข้าไปในกลุ่ม
type addQuestionnaireToGroupReq struct {
	QuestionnaireID uint `json:"questionnaire_id"`
}

func AddQuestionnaireToGroup(c *gin.Context) {
	groupID, _ := strconv.Atoi(c.Param("id"))
	var body addQuestionnaireToGroupReq
	if err := c.ShouldBindJSON(&body); err != nil || body.QuestionnaireID == 0 {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "INVALID_INPUT")
		return
	}

	// นับว่ามีอยู่แล้วไหม
	var count int64
	config.DB().Model(&entity.QuestionnaireGroupQuestionnaire{}).
		Where("questionnaire_group_id = ? AND questionnaire_id = ?", groupID, body.QuestionnaireID).
		Count(&count)
	if count > 0 {
		util.HandleError(c, http.StatusConflict, "แบบสอบถามนี้อยู่ในกลุ่มแล้ว", "ALREADY_EXISTS")
		return
	}

	// หา Order สูงสุดก่อนหน้า
	var maxOrder uint
	config.DB().Model(&entity.QuestionnaireGroupQuestionnaire{}).
		Where("questionnaire_group_id = ?", groupID).
		Select("COALESCE(MAX(order_in_group), 0)").Scan(&maxOrder)

	link := entity.QuestionnaireGroupQuestionnaire{
		QuestionnaireGroupID: uint(groupID),
		QuestionnaireID:      body.QuestionnaireID,
		OrderInGroup:         maxOrder + 1,
	}

	if err := config.DB().Create(&link).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถเพิ่มแบบสอบถามได้", "CREATE_FAILED")
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "เพิ่มแบบสอบถามสำเร็จ"})
}

// ลบแบบสอบถามออกจากกลุ่ม
func RemoveQuestionnaireFromGroup(c *gin.Context) {
	groupID, _ := strconv.Atoi(c.Param("id"))
	qid, _ := strconv.Atoi(c.Param("qid"))

	if err := config.DB().Where("questionnaire_group_id = ? AND questionnaire_id = ?", groupID, qid).
		Delete(&entity.QuestionnaireGroupQuestionnaire{}).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ไม่สามารถลบแบบสอบถามได้", "DELETE_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบแบบสอบถามสำเร็จ"})
}

// ฟังก์ชัน: ดึงแบบสอบถามที่มีอยู่ในกลุ่ม
func GetAvailableQuestionnairesForGroup(c *gin.Context) {
	groupID := c.Param("id")

	// ดึง ID แบบสอบถามที่มีอยู่ในกลุ่มนี้ (เท่านั้น)
	var existingIDs []uint
	config.DB().Model(&entity.QuestionnaireGroupQuestionnaire{}).
		Where("questionnaire_group_id = ?", groupID).
		Pluck("questionnaire_id", &existingIDs)

	// ดึงแบบสอบถามที่ "ยังไม่อยู่ในกลุ่มนี้"
	var list []entity.Questionnaire
	if len(existingIDs) == 0 {
		// ถ้ายังไม่มีแบบสอบถามในกลุ่มเลย → แสดงทั้งหมด
		config.DB().Find(&list)
	} else {
		config.DB().Where("id NOT IN ?", existingIDs).Find(&list)
	}

	type Out struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}
	var out []Out
	for _, q := range list {
		out = append(out, Out{ID: q.ID, Name: q.NameQuestionnaire})
	}

	c.JSON(http.StatusOK, out)
}
