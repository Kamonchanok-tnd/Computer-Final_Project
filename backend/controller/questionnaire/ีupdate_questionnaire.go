package questionnaire

import (
	"strconv"
	"net/http"
	"sukjai_project/config"
	"sukjai_project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
    "fmt"
	
)

// // ✅ ดึงแบบทดสอบพร้อมคำถาม
// func GetQuestionnaire(c *gin.Context) {
//     id, err := strconv.Atoi(c.Param("id"))
//     if err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
//         return
//     }

//     var questionnaire entity.Questionnaire
//     if err := config.DB().
//         Preload("Questions", func(db *gorm.DB) *gorm.DB {
//             return db.Order("priority ASC")
//         }).
//         Preload("Questions.Answers").
//         First(&questionnaire, id).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
//         return
//     }

//     c.JSON(http.StatusOK, questionnaire)
// }


func GetQuestionnaire(c *gin.Context) {
	fmt.Println("📥 เรียกเข้าฟังก์ชัน GetQuestionnaire แล้ว")

	// อ่าน param ID
	idParam := c.Param("id")
	fmt.Println("🧩 รับ param id =", idParam)

	id, err := strconv.Atoi(idParam)
	if err != nil {
		fmt.Println("❌ แปลง id ไม่สำเร็จ:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	fmt.Println("🔍 กำลังค้นหาแบบสอบถามใน DB ด้วย ID =", id)

	var questionnaire entity.Questionnaire
	err = config.DB().
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("priority ASC")
		}).
		Preload("Questions.AnswerOptions").
		First(&questionnaire, id).Error

	if err != nil {
		fmt.Println("❌ ไม่พบแบบสอบถามหรือ error อื่น:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Questionnaire not found"})
		return
	}

	fmt.Println("✅ พบแบบสอบถาม ส่งกลับ client:", questionnaire.ID)
	c.JSON(http.StatusOK, questionnaire)
}




// // ✅ อัพเดตเเบบทดสอบ
// ✅ Struct สำหรับรับ request อยู่ในไฟล์นี้เลย
type UpdateQuestionnaireRequest struct {
    Name        string `json:"name"`
    Description string `json:"description"`
    Questions   []struct {
        ID           *uint  `json:"id"`
        NameQuestion string `json:"nameQuestion"`
        Priority     int    `json:"priority"`
        Answers      []struct {
            ID          *uint  `json:"id"`
            Description string `json:"description"`
            Point       int    `json:"point"`
        } `json:"answers"`
    } `json:"questions"`
}

// // ✅ ฟังก์ชันอพเดตแบบทดสอบ
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

//     // ✅ Track IDs ที่เหลืออยู่
//     var keepQuestionIDs []uint
//     var keepAnswerIDs []uint

//     for _, q := range req.Questions {
//         var question entity.Question
//         if q.ID != nil {
//             if err := config.DB().First(&question, *q.ID).Error; err == nil {
//                 question.NameQuestion = q.NameQuestion
//                 question.Priority = q.Priority
//                 config.DB().Save(&question)
//                 keepQuestionIDs = append(keepQuestionIDs, question.ID)
//             }
//         } else {
//             question = entity.Question{
//                 NameQuestion: q.NameQuestion,
//                 Priority:     q.Priority,
//                 QuID:         questionnaire.ID,
//             }
//             config.DB().Create(&question)
//             keepQuestionIDs = append(keepQuestionIDs, question.ID)
//         }

//         for _, a := range q.Answers {
//             var answer entity.AnswerOption
//             if a.ID != nil {
//                 if err := config.DB().First(&answer, *a.ID).Error; err == nil {
//                     answer.Description = a.Description
//                     answer.Point = a.Point
//                     config.DB().Save(&answer)
//                     keepAnswerIDs = append(keepAnswerIDs, answer.ID)
//                 }
//             } else {
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




// ✅ ฟังก์ชันอัปเดตแบบทดสอบ
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

    // Track IDs ที่เหลืออยู่
    var keepQuestionIDs []uint
    var keepAnswerIDs []uint

    // ✅ อัปเดตคำถามและคำตอบ
    for _, q := range req.Questions {
        var question entity.Question
        if q.ID != nil {
            // อัปเดตคำถามที่มีอยู่
            if err := config.DB().First(&question, *q.ID).Error; err == nil {
                question.NameQuestion = q.NameQuestion
                question.Priority = q.Priority
                config.DB().Save(&question)
                keepQuestionIDs = append(keepQuestionIDs, question.ID)
            }
        } else {
            // สร้างคำถามใหม่
            question = entity.Question{
                NameQuestion: q.NameQuestion,
                Priority:     q.Priority,
                QuID:         questionnaire.ID,
            }
            config.DB().Create(&question)
            keepQuestionIDs = append(keepQuestionIDs, question.ID)

            // อัปเดตจำนวนคำถามในแบบทดสอบ
            questionnaire.Quantity = len(keepQuestionIDs)
            config.DB().Save(&questionnaire) // อัปเดตจำนวนข้อในแบบทดสอบ
        }

        // อัปเดตหรือสร้างคำตอบ
        for _, a := range q.Answers {
            var answer entity.AnswerOption
            if a.ID != nil {
                // อัปเดตคำตอบที่มีอยู่
                if err := config.DB().First(&answer, *a.ID).Error; err == nil {
                    answer.Description = a.Description
                    answer.Point = a.Point
                    config.DB().Save(&answer)
                    keepAnswerIDs = append(keepAnswerIDs, answer.ID)
                }
            } else {
                // สร้างคำตอบใหม่
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
    config.DB().Joins("JOIN questions ON questions.id = answer_options.qid").
        Where("questions.qu_id = ?", questionnaire.ID).
        Find(&oldAnswers)
    for _, oldA := range oldAnswers {
        if !contains(keepAnswerIDs, oldA.ID) {
            config.DB().Delete(&oldA)
        }
    }

    c.JSON(http.StatusOK, gin.H{"message": "Update successful"})
}

// ✅ Helper ฟังก์ชัน
func contains(slice []uint, value uint) bool {
    for _, v := range slice {
        if v == value {
            return true
        }
    }
    return false
}









// // ✅ ฟังก์ชันสำหรับอัพเดตลบเเบบทดสอบ 
// func UpdateQuestionnaire(c *gin.Context) {
// 	// รับ ID จาก path
// 	idStr := c.Param("id")
// 	id, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ไม่ถูกต้อง"})
// 		return
// 	}

// 	// ค้นหาแบบทดสอบเดิมใน DB
// 	var questionnaire entity.Questionnaire
// 	db := config.DB()
// 	if err := db.First(&questionnaire, id).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบแบบทดสอบ"})
// 		return
// 	}

// 	// รับค่าจาก frontend
// 	var input struct {
// 		NameQuestionnaire string `json:"nameQuestionnaire"`
// 		Description       string `json:"description"`
// 		Quantity          int    `json:"quantity"` 
// 	}

// 	if err := c.ShouldBindJSON(&input); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
// 		return
// 	}

// 	// อัปเดตข้อมูล
// 	questionnaire.NameQuestionnaire = input.NameQuestionnaire
// 	questionnaire.Description = input.Description
// 	questionnaire.Quantity = input.Quantity   

// 	if err := db.Save(&questionnaire).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถบันทึกการแก้ไขได้"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message":        "แก้ไขแบบทดสอบเรียบร้อยแล้ว",
// 		"questionnaire":  questionnaire,
// 	})
// }



// // ✅ ฟังก์ชันสำหรับอัพเดตคำถาม 
// func UpdateQuestion(c *gin.Context) {
// 	id := c.Param("id")

// 	var question entity.Question
// 	db := config.DB()

// 	// ตรวจสอบว่าคำถามมีอยู่จริงไหม
// 	if err := db.First(&question, id).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบคำถาม"})
// 		return
// 	}

// 	// รับค่า nameQuestion อย่างเดียว
// 	var input struct {
// 		NameQuestion string `json:"nameQuestion"`
// 	}
// 	if err := c.ShouldBindJSON(&input); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
// 		return
// 	}

// 	// อัปเดตชื่อคำถาม
// 	question.NameQuestion = input.NameQuestion
// 	if err := db.Save(&question).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": " ❌ ไม่สามารถอัปเดตชื่อคำถามได้"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขคำถามเรียบร้อยแล้ว", "question": question})
// }
