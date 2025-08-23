package assessment

import (
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
	"strconv"
	"fmt"
	"gorm.io/gorm"
	"time"
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

// ดึงกลุ่มแบบสอบถามแบบ “เรียงตาม OrderInGroup”
// GET /questionnaire-groups/:id
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
        ID            uint    `json:"id"`
        Name          string  `json:"name"`
        Description   string  `json:"description"`
        FrequencyDays *uint   `json:"frequency_days"`
        Items         []Q     `json:"questionnaires"`
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
// PATCH /questionnaire-groups/:id/frequency
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
    if err := config.DB().Model(&entity.QuestionnaireGroup{}).
        Where("id = ?", id).
        Update("frequency_days", body.FrequencyDays).Error; err != nil {
        util.HandleError(c, http.StatusInternalServerError, "อัปเดตความถี่ไม่สำเร็จ", "UPDATE_FAILED")
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "updated"})
}


// จัดลำดับแบบสอบถามในกลุ่ม (drag & drop แล้วส่งมาเป็น array)
// PUT /questionnaire-groups/:id/order
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


// บอก “กลุ่มไหนพร้อมให้ทำ” ตามความถี่ (FrequencyDays)
// GET /questionnaire-groups/available?user_id=123
func GetAvailableGroupsForUser(c *gin.Context) {
    uid := c.Query("user_id")
    if uid == "" {
        util.HandleError(c, http.StatusBadRequest, "ต้องมี user_id", "MISSING_USER")
        return
    }

    var groups []entity.QuestionnaireGroup
    if err := config.DB().Find(&groups).Error; err != nil {
        util.HandleError(c, http.StatusInternalServerError, "โหลดกลุ่มไม่สำเร็จ", "FETCH_FAILED")
        return
    }

    type item struct {
        ID            uint   `json:"id"`
        Name          string `json:"name"`
        Description   string `json:"description"`
        FrequencyDays *uint  `json:"frequency_days"`
        Available     bool   `json:"available"`
        Reason        string `json:"reason"`
    }
    var out []item

    for _, g := range groups {
        // แนวคิด: ดูจาก Transaction/AssessmentResult ล่าสุดใน group นี้ (ต้องมีวิธีผูก group กับ result/tx ของ user)
        // ตัวอย่างเชิงแนวทาง: ถ้าไม่มี FrequencyDays => ยังไม่เคยทำ -> available
        // ถ้ามี FrequencyDays => ถ้าห่างจากครั้งล่าสุด >= N วัน -> available
        // *** ปรับ logic ให้ตรงกับ schema จริงของคุณ ***

        available := true
        reason := "first time"

        if g.FrequencyDays != nil {
            // หาเวลาทำล่าสุดในกลุ่มนี้ (ตัวอย่าง query ทั่วไป—คุณต้องปรับให้ตรงกับโครงสร้างจริง)
            var lastTx entity.Transaction
            err := config.DB().
                Joins("JOIN assessment_results ar ON ar.id = transactions.arid").
                Where("ar.uid = ? AND ar.group_id = ?", uid, g.ID). // ถ้าไม่มี group_id ใน AR ให้ปรับเป็นเงื่อนไขที่หา last ของกลุ่ม
                Order("transactions.created_at DESC").
                First(&lastTx).Error

            if err == nil {
                days := *g.FrequencyDays
                // เช็คเวลา (ตัวอย่างแบบง่าย)
                if time.Since(lastTx.CreatedAt) < (time.Duration(days) * 24 * time.Hour) {
                    available = false
                    reason = fmt.Sprintf("ต้องรอครบ %d วัน", days)
                } else {
                    reason = "ครบกำหนดรอบ"
                }
            } else {
                reason = "ยังไม่เคยทำกลุ่มนี้"
            }
        }

        out = append(out, item{
            ID: g.ID, Name: g.Name, Description: g.Description,
            FrequencyDays: g.FrequencyDays, Available: available, Reason: reason,
        })
    }

    c.JSON(http.StatusOK, out)
}

// GET /assessments/next?user_id=123&group_id=1
func GetNextQuestionnaire(c *gin.Context) {
    uid := c.Query("user_id")
    gid := c.Query("group_id")
    if uid == "" || gid == "" {
        util.HandleError(c, http.StatusBadRequest, "ต้องมี user_id และ group_id", "MISSING_PARAMS")
        return
    }

    // ดึงรายการ questionnaire ของ group นี้ตามลำดับ
    var links []entity.QuestionnaireGroupQuestionnaire
    if err := config.DB().
        Preload("Questionnaire").
        Where("questionnaire_group_id = ?", gid).
        Order("order_in_group ASC").
        Find(&links).Error; err != nil {
        util.HandleError(c, http.StatusInternalServerError, "โหลดรายการแบบสอบถามไม่สำเร็จ", "FETCH_FAILED")
        return
    }

    // หาว่า user ทำไปถึงไหนแล้วในกลุ่มนี้ (ปรับ logic ให้ตรง schema จริงของคุณ)
    // ไอเดีย: ดู AssessmentResult ล่าสุดต่อ questionnaire (ของ user) ว่าทำครบ/ยัง
    for _, l := range links {
        q := l.Questionnaire

        // ข้ามถ้าทำเสร็จแล้ว (ตัวอย่าง query; ปรับให้ตรง schema)
        var done int64
        config.DB().
            Model(&entity.AssessmentResult{}).
            Where("uid = ? AND quid = ?", uid, q.ID).
            Count(&done)
        if done > 0 {
            continue
        }

        // ตรวจเงื่อนไขก่อนหน้า (เช่น 9Q ต้องผ่าน 2Q >= 1)
        if q.ConditionOnID != nil && q.ConditionScore != nil {
            // ดึงคะแนนล่าสุดของ ConditionOnID
            var tx entity.Transaction
            // ตัวอย่าง: join AR (ต้องมี mapping UID + QuID)
            err := config.DB().
                Joins("JOIN assessment_results ar ON ar.id = transactions.arid").
                Where("ar.uid = ? AND ar.quid = ?", uid, *q.ConditionOnID).
                Order("transactions.created_at DESC").
                First(&tx).Error
            if err != nil || tx.TotalScore < *q.ConditionScore {
                // ไม่ถึงเกณฑ์ → ข้ามไปตัวถัดไป
                continue
            }
        }

        // เจอข้อถัดไปที่ควรทำ
        c.JSON(http.StatusOK, gin.H{
            "group_id": gid,
            "next": gin.H{
                "id":              q.ID,
                "name":            q.NameQuestionnaire,
                "order_in_group":  l.OrderInGroup,
                "condition_on_id": q.ConditionOnID,
                "condition_score": q.ConditionScore,
            },
        })
        return
    }

    // ถ้าไม่มีอะไรให้ทำแล้ว
    c.JSON(http.StatusOK, gin.H{
        "group_id": gid,
        "next":     nil,
        "message":  "ทำแบบสอบถามในกลุ่มนี้ครบแล้ว",
    })
}

