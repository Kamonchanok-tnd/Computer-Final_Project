// package questionnaire

// import (
// 	"strconv"
// 	"net/http"
// 	"sukjai_project/config"
// 	"sukjai_project/entity"
// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
//     "fmt"
	
// )

// // ✅ ดึงข้อมูลแบบทดสอบพร้อมคำถาม
// func GetQuestionnaire(c *gin.Context) {
// 	fmt.Println("📥 เรียกเข้าฟังก์ชัน GetQuestionnaire แล้ว")

// 	// อ่าน param ID
// 	idParam := c.Param("id")
// 	fmt.Println("🧩 รับ param id =", idParam)

// 	id, err := strconv.Atoi(idParam)
// 	if err != nil {
// 		fmt.Println("❌ แปลง id ไม่สำเร็จ:", err)
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
// 		return
// 	}

// 	fmt.Println("🔍 กำลังค้นหาแบบสอบถามใน DB ด้วย ID =", id)

// 	var questionnaire entity.Questionnaire
// 	err = config.DB().
// 		Preload("Questions", func(db *gorm.DB) *gorm.DB {
// 			return db.Order("priority ASC")
// 		}).
// 		Preload("Questions.AnswerOptions").
// 		First(&questionnaire, id).Error

// 	if err != nil {
// 		fmt.Println("❌ ไม่พบแบบสอบถามหรือ error อื่น:", err)
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
// 		return
// 	}

// 	fmt.Println("✅ พบแบบสอบถาม ส่งกลับ client:", questionnaire.ID)
// 	c.JSON(http.StatusOK, questionnaire)
// }




// //✅ โครงสร้างอัพเดตเเบบทดสอบ, คำถาม, คำตอบเเละลำดับ
// type UpdateQuestionnaireRequest struct {
//     Name        string `json:"name"`
//     Description string `json:"description"`
//     Questions   []struct {
//         ID           *uint  `json:"id"`
//         NameQuestion string `json:"nameQuestion"`
//         Priority     int    `json:"priority"`
//         Answers      []struct {
//             ID          *uint  `json:"id"`
//             Description string `json:"description"`
//             Point       int    `json:"point"`
//         } `json:"answers"`
//     } `json:"questions"`
// }


// // ✅ อัพเดตเเบบทดสอบ, คำถาม, คำตอบเเละลำดับ
// func UpdateQuestionnaire(c *gin.Context) {
//     id, err := strconv.Atoi(c.Param("id"))
//     if err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
//         return
//     }

//     var req UpdateQuestionnaireRequest
//     if err := c.ShouldBindJSON(&req); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }

//     var questionnaire entity.Questionnaire
//     if err := config.DB().Preload("Questions.AnswerOptions").First(&questionnaire, id).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
//         return
//     }

//     // ✅ อัปเดตข้อมูลหลัก
//     questionnaire.NameQuestionnaire = req.Name
//     questionnaire.Description = req.Description
//     config.DB().Save(&questionnaire)

//     // Track IDs ที่เหลืออยู่
//     var keepQuestionIDs []uint
//     var keepAnswerIDs []uint

//     // ✅ อัปเดตคำถามและคำตอบ
//     for _, q := range req.Questions {
//         var question entity.Question
//         if q.ID != nil {
//             // อัปเดตคำถามที่มีอยู่
//             if err := config.DB().First(&question, *q.ID).Error; err == nil {
//                 question.NameQuestion = q.NameQuestion
//                 question.Priority = q.Priority
//                 config.DB().Save(&question)
//                 keepQuestionIDs = append(keepQuestionIDs, question.ID)
//             }
//         } else {
//             // สร้างคำถามใหม่
//             question = entity.Question{
//                 NameQuestion: q.NameQuestion,
//                 Priority:     q.Priority,
//                 QuID:         questionnaire.ID,
//             }
//             config.DB().Create(&question)
//             keepQuestionIDs = append(keepQuestionIDs, question.ID)

//             // อัปเดตจำนวนคำถามในแบบทดสอบ
//             questionnaire.Quantity = len(keepQuestionIDs)
//             config.DB().Save(&questionnaire) // อัปเดตจำนวนข้อในแบบทดสอบ
//         }

//         // อัปเดตหรือสร้างคำตอบ
//         for _, a := range q.Answers {
//             var answer entity.AnswerOption
//             if a.ID != nil {
//                 // อัปเดตคำตอบที่มีอยู่
//                 if err := config.DB().First(&answer, *a.ID).Error; err == nil {
//                     answer.Description = a.Description
//                     answer.Point = a.Point
//                     config.DB().Save(&answer)
//                     keepAnswerIDs = append(keepAnswerIDs, answer.ID)
//                 }
//             } else {
//                 // สร้างคำตอบใหม่
//                 answer = entity.AnswerOption{
//                     Description: a.Description,
//                     Point:       a.Point,
//                     QID:         question.ID,
//                 }
//                 config.DB().Create(&answer)
//                 keepAnswerIDs = append(keepAnswerIDs, answer.ID)
//             }
//         }
//     }

//     // ✅ ลบคำถามที่หายไป
//     var oldQuestions []entity.Question
//     config.DB().Where("qu_id = ?", questionnaire.ID).Find(&oldQuestions)
//     for _, oldQ := range oldQuestions {
//         if !contains(keepQuestionIDs, oldQ.ID) {
//             config.DB().Delete(&oldQ)
//         }
//     }

//     // ✅ ลบคำตอบที่หายไป
//     var oldAnswers []entity.AnswerOption
//     config.DB().Joins("JOIN questions ON questions.id = answer_options.qid").
//         Where("questions.qu_id = ?", questionnaire.ID).
//         Find(&oldAnswers)
//     for _, oldA := range oldAnswers {
//         if !contains(keepAnswerIDs, oldA.ID) {
//             config.DB().Delete(&oldA)
//         }
//     }

//     c.JSON(http.StatusOK, gin.H{"message": "Update successful"})
// }

// // ✅ Helper ฟังก์ชัน
// func contains(slice []uint, value uint) bool {
//     for _, v := range slice {
//         if v == value {
//             return true
//         }
//     }
//     return false
// }




package questionnaire

import (
	"net/http"
	"strconv"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ✅ ดึงข้อมูลแบบทดสอบพร้อมคำถามและตัวเลือก
func GetQuestionnaire(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var questionnaire entity.Questionnaire
	err = config.DB().
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("priority ASC")
		}).
		Preload("Questions.AnswerOptions").
		First(&questionnaire, id).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
		return
	}

	c.JSON(http.StatusOK, questionnaire)
}

// ✅ Request Struct
type UpdateQuestionnaireRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Questions   []struct {
		ID           *uint   `json:"id"`
		NameQuestion string  `json:"nameQuestion"`
		Priority     int     `json:"priority"`
		Picture      *string `json:"picture"` // ✅ รองรับ null หรือ Base64
		Answers      []struct {
			ID          *uint  `json:"id"`
			Description string `json:"description"`
			Point       int    `json:"point"`
		} `json:"answers"`
	} `json:"questions"`
}

// ✅ ฟังก์ชันอัปเดตแบบสอบถาม
func UpdateQuestionnaire(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req UpdateQuestionnaireRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var questionnaire entity.Questionnaire
	if err := config.DB().Preload("Questions.AnswerOptions").First(&questionnaire, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
		return
	}

	// ✅ อัปเดตข้อมูลหลัก
	questionnaire.NameQuestionnaire = req.Name
	questionnaire.Description = req.Description
	config.DB().Save(&questionnaire)

	var keepQuestionIDs []uint
	var keepAnswerIDs []uint

	// ✅ อัปเดตคำถามและคำตอบ
	for _, q := range req.Questions {
		var question entity.Question
		if q.ID != nil {
			// ✅ แก้คำถามเดิม
			if err := config.DB().First(&question, *q.ID).Error; err == nil {
				question.NameQuestion = q.NameQuestion
				question.Priority = q.Priority
				// ✅ ตรวจสอบว่า picture เป็น null หรือไม่
				if q.Picture != nil {
					question.Picture = q.Picture // ถ้ามีรูปใหม่ ให้เก็บ Base64
				} else {
					question.Picture = nil // ถ้าลบรูป (ส่ง null)
				}
				config.DB().Model(&question).Select("*").Updates(map[string]interface{}{
					"name_question": question.NameQuestion,
					"priority":      question.Priority,
					"picture":       question.Picture,
				})
				keepQuestionIDs = append(keepQuestionIDs, question.ID)
			}
		} else {
			// ✅ เพิ่มคำถามใหม่
			question = entity.Question{
				NameQuestion: q.NameQuestion,
				Priority:     q.Priority,
				Picture:      q.Picture, // ✅ รองรับรูปใหม่หรือ null
				QuID:         questionnaire.ID,
			}
			config.DB().Create(&question)
			keepQuestionIDs = append(keepQuestionIDs, question.ID)


			 // อัปเดตจำนวนคำถามในแบบทดสอบ
            questionnaire.Quantity = len(keepQuestionIDs)
            config.DB().Save(&questionnaire) // อัปเดตจำนวนข้อในแบบทดสอบ
		}

		// ✅ จัดการตัวเลือก
		for _, a := range q.Answers {
			var answer entity.AnswerOption
			if a.ID != nil {
				if err := config.DB().First(&answer, *a.ID).Error; err == nil {
					answer.Description = a.Description
					answer.Point = a.Point
					config.DB().Save(&answer)
					keepAnswerIDs = append(keepAnswerIDs, answer.ID)
				}
			} else {
				answer = entity.AnswerOption{
					Description: a.Description,
					Point:       a.Point,
					QID:         question.ID,
				}
				config.DB().Create(&answer)
				keepAnswerIDs = append(keepAnswerIDs, answer.ID)
			}
		}
	}

	// ✅ ลบคำถามที่หายไป
	var oldQuestions []entity.Question
	config.DB().Where("qu_id = ?", questionnaire.ID).Find(&oldQuestions)
	for _, oldQ := range oldQuestions {
		if !contains(keepQuestionIDs, oldQ.ID) {
			config.DB().Delete(&oldQ)
		}
	}

	// ✅ ลบคำตอบที่หายไป
	var oldAnswers []entity.AnswerOption
	config.DB().Joins("JOIN questions ON questions.id = answer_options.q_id").
		Where("questions.qu_id = ?", questionnaire.ID).
		Find(&oldAnswers)
	for _, oldA := range oldAnswers {
		if !contains(keepAnswerIDs, oldA.ID) {
			config.DB().Delete(&oldA)
		}
	}

	// ✅ ดึงข้อมูลล่าสุดส่งกลับ
	config.DB().Preload("Questions.AnswerOptions").First(&questionnaire, id)
	c.JSON(http.StatusOK, gin.H{
		"message":       "Update successful",
		"questionnaire": questionnaire,
	})
}

func contains(slice []uint, value uint) bool {
	for _, v := range slice {
		if v == value {
			return true
		}
	}
	return false
}

