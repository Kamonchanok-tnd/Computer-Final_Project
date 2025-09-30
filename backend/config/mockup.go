package config

import (
	"fmt"
	"math/rand"
	"time"

	"sukjai_project/entity"

	"gorm.io/gorm"
)

// SetupMockUpData
// - สร้างผู้ใช้ 3 คน: Andy / Marry / Bell (FirstOrCreate กันซ้ำ)
// - สร้าง assessment_results + transactions ครบทุกกลุ่มตาม TriggerType
// - TotalScore อิงช่วงคะแนนจริงจาก criteria/calculations
// - MaxScore ใส่เป็นค่ามากสุดของแบบนั้น ๆ จาก criteria
// - Result = คำอธิบายจาก Criteria ที่ครอบคะแนน (fallback เป็น "แนวโน้ม..." ถ้าไม่พบ mapping)
func SetupMockUpData(db *gorm.DB) error {
	rand.Seed(time.Now().UnixNano())

	// 1) เตรียมผู้ใช้ 3 คน
	pw1, err := HashPassword("user123")
	if err != nil {
		return fmt.Errorf("hash pw1: %w", err)
	}
	pw2, err := HashPassword("user123")
	if err != nil {
		return fmt.Errorf("hash pw2: %w", err)
	}
	pw3, err := HashPassword("user123")
	if err != nil {
		return fmt.Errorf("hash pw3: %w", err)
	}

	var u1, u2, u3 entity.Users

	if err := db.
		Where("username = ?", "Andy").
		Attrs(entity.Users{
			Username:    "Andy",
			Email:       "andy@example.com",
			Password:    pw1,
			Role:        "user",
			Age:         27,
			Gender:      "ผู้ชาย",
			PhoneNumber: "0989898989", // 10 หลัก ขึ้นต้น 0 (ตาม validator)
			Facebook:    "andy_fb",
			PFID:        1,
		}).
		FirstOrCreate(&u1).Error; err != nil {
		return fmt.Errorf("create/find Andy: %w", err)
	}

	if err := db.
		Where("username = ?", "Marry").
		Attrs(entity.Users{
			Username:    "Marry",
			Email:       "marry@example.com",
			Password:    pw2,
			Role:        "user",
			Age:         18,
			Gender:      "ผู้หญิง",
			PhoneNumber: "0987654321",
			Facebook:    "Marry_fb",
			PFID:        1,
		}).
		FirstOrCreate(&u2).Error; err != nil {
		return fmt.Errorf("create/find Marry: %w", err)
	}

	if err := db.
		Where("username = ?", "Bell").
		Attrs(entity.Users{
			Username:    "Bell",
			Email:       "bell@example.com",
			Password:    pw3,
			Role:        "user",
			Age:         23,
			Gender:      "ผู้หญิง",
			PhoneNumber: "0987654321",
			Facebook:    "Bell_fb",
			PFID:        1,
		}).
		FirstOrCreate(&u3).Error; err != nil {
		return fmt.Errorf("create/find Bell: %w", err)
	}

	// 2) seed เฉพาะ 3 UID นี้ (ของระบบแบบทดสอบ/ธุรกรรม – โค้ดเดิม)
	if err := seedForUserIDs(db, []uint{u1.ID, u2.ID, u3.ID}); err != nil {
		return err
	}

	// 3) SEED เพิ่มเติม: แบบประเมิน (feedback) ให้ผู้ใช้ id = 4, 5, 6
	//    - ไม่ยุ่งกับผู้ใช้ที่สร้างด้านบน
	//    - ถ้า user ไม่อยู่ในระบบ จะข้ามเฉย ๆ
	if err := seedFeedbackForUserIDs(db, []uint{4, 5, 6}); err != nil {
		return err
	}

	return nil
}

// ---------- helpers (ของเดิม) ----------

func seedForUserIDs(db *gorm.DB, userIDs []uint) error {
	// โหลดกลุ่ม + mapping + questionnaire
	var groups []entity.QuestionnaireGroup
	if err := db.
		Preload("QuestionnaireGroupQuestionnaires", func(tx *gorm.DB) *gorm.DB {
			return tx.Order("order_in_group ASC")
		}).
		Preload("QuestionnaireGroupQuestionnaires.Questionnaire").
		Find(&groups).Error; err != nil {
		return fmt.Errorf("load groups failed: %w", err)
	}

	now := time.Now()
	for _, uid := range userIDs {
		for _, g := range groups {
			trigger := ""
			if g.TriggerType != nil {
				trigger = *g.TriggerType
			}
			links := g.QuestionnaireGroupQuestionnaires
			if len(links) == 0 {
				continue
			}

			switch trigger {
			case "onLogin":
				// ทำ 1 ครั้ง/แบบ/ผู้ใช้ (ย้อนหลัง 28 วัน)
				base := now.AddDate(0, 0, -28)
				if err := seedOncePerQuestionnaire(db, uid, g, links, base); err != nil {
					return err
				}

			case "afterChat":
				// ทำ 1 ครั้ง/แบบ/ผู้ใช้ (ย้อนหลัง 21 วัน)
				base := now.AddDate(0, 0, -21)
				if err := seedOncePerQuestionnaire(db, uid, g, links, base); err != nil {
					return err
				}

			case "interval":
				// ทุก 14 วัน รวม 3 ครั้ง
				for i := 1; i <= 3; i++ {
					base := now.AddDate(0, 0, -14*i)
					if err := seedOncePerQuestionnaire(db, uid, g, links, base); err != nil {
						return err
					}
				}

			default:
				// ไม่ตั้ง trigger → เหมือน onLogin
				base := now.AddDate(0, 0, -30)
				if err := seedOncePerQuestionnaire(db, uid, g, links, base); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

// วิ่งทุกแบบทดสอบในกลุ่ม สร้าง AssessmentResult + Transaction 1 ชุด ต่อ user หนึ่งคน
func seedOncePerQuestionnaire(
	db *gorm.DB,
	userID uint,
	g entity.QuestionnaireGroup,
	links []entity.QuestionnaireGroupQuestionnaire,
	when time.Time,
) error {

	groupName := g.Name
	for idx, link := range links {
		q := link.Questionnaire
		if q.ID == 0 {
			continue
		}

		// 1) สร้าง/หา AssessmentResult (กันซ้ำด้วย uid+qu+qg+date)
		ar := entity.AssessmentResult{
			Date: when.Format("2006-01-02"),
			UID:  userID,
			QuID: q.ID,
			QGID: g.ID,
		}
		var exists int64
		_ = db.Model(&entity.AssessmentResult{}).
			Where("uid = ? AND qu_id = ? AND qg_id = ? AND date = ?", userID, q.ID, g.ID, ar.Date).
			Count(&exists).Error
		if exists == 0 {
			if err := db.Create(&ar).Error; err != nil {
				return fmt.Errorf("create assessment_result failed: %w", err)
			}
		} else {
			if err := db.Where("uid = ? AND qu_id = ? AND qg_id = ? AND date = ?",
				userID, q.ID, g.ID, ar.Date).
				First(&ar).Error; err != nil {
				return fmt.Errorf("find existing assessment_result failed: %w", err)
			}
		}

		// 2) คำนวณคะแนน mock + ระดับผลลัพธ์
		minScore, maxScore := loadMinMaxScoreForQuestionnaire(db, q.ID)
		if minScore > maxScore {
			// ถ้าไม่มี criteria เลย → ดีฟอลต์
			minScore, maxScore = 0, 27
		}
		total, level := mockScoreAndLevel(minScore, maxScore, q.TestType, idx)

		testType := ""
		if q.TestType != nil {
			testType = *q.TestType
		}

		// 3) ดึงคำอธิบายผลจาก Criteria ที่ match คะแนน (รองรับทั้ง c_id/qu_id และ cid/quid)
		resultText := ""
		if desc, ok := findCriteriaDescriptionForScore(db, q.ID, total); ok {
			resultText = desc
		} else {
			// เผื่อกรณีไม่มี mapping หรือยังไม่ได้ seed calculations/criteria
			resultText = mockResultText(total, minScore, maxScore)
		}

		// 4) สร้าง Transaction
		tx := entity.Transaction{
			Description:        q.NameQuestionnaire,
			TotalScore:         total,
			MaxScore:           maxScore,
			Result:             resultText,
			ResultLevel:        level, // happy/sad/bored
			TestType:           testType,
			QuestionnaireGroup: groupName,
			ARID:               ar.ID,
		}
		tx.CreatedAt = when // ปักเวลาที่ mock ไว้

		// กันซ้ำ: AR เดิม + วันที่เดียวกัน
		var txExists int64
		_ = db.Model(&entity.Transaction{}).
			Where("ar_id = ? AND DATE(created_at) = ?", ar.ID, when.Format("2006-01-02")).
			Count(&txExists).Error
		if txExists == 0 {
			if err := db.Create(&tx).Error; err != nil {
				return fmt.Errorf("create transaction failed: %w", err)
			}
		}
	}

	return nil
}

// ดึงช่วงคะแนนจาก criteria ที่แมพกับ questionnaire ผ่าน calculations
func loadMinMaxScoreForQuestionnaire(db *gorm.DB, quID uint) (int, int) {
	type row struct {
		MinS int
		MaxS int
	}
	var rs []row
	if err := db.
		Table("criteria").
		Select("criteria.min_criteria_score as min_s, criteria.max_criteria_score as max_s").
		Joins("JOIN calculations ON calculations.c_id = criteria.id").
		Where("calculations.qu_id = ?", quID).
		Scan(&rs).Error; err != nil || len(rs) == 0 {
		// ลองสคีมาอีกแบบ (cid/quid)
		rs = nil
		if err2 := db.
			Table("criteria").
			Select("criteria.min_criteria_score as min_s, criteria.max_criteria_score as max_s").
			Joins("JOIN calculations ON calculations.cid = criteria.id").
			Where("calculations.quid = ?", quID).
			Scan(&rs).Error; err2 != nil || len(rs) == 0 {
			return 0, -1
		}
	}

	minV, maxV := 1<<31-1, -1<<31
	for _, r := range rs {
		if r.MinS < minV {
			minV = r.MinS
		}
		if r.MaxS > maxV {
			maxV = r.MaxS
		}
	}
	if minV == 1<<31-1 {
		minV = 0
	}
	if maxV == -1<<31 {
		maxV = 0
	}
	return minV, maxV
}

// คืน description ของ criteria ที่ครอบ score สำหรับ questionnaire นี้
// รองรับทั้งสคีมา: (c_id, qu_id) และ (cid, quid)
func findCriteriaDescriptionForScore(db *gorm.DB, quID uint, score int) (string, bool) {
	var descs []string

	// เคสคอลัมน์ c_id / qu_id
	err := db.
		Table("criteria").
		Joins("JOIN calculations ON calculations.c_id = criteria.id").
		Where("calculations.qu_id = ? AND criteria.min_criteria_score <= ? AND criteria.max_criteria_score >= ?",
			quID, score, score).
		Order("criteria.max_criteria_score ASC").
		Limit(1).
		Pluck("criteria.description", &descs).Error
	if err == nil && len(descs) > 0 {
		return descs[0], true
	}

	// เคสคอลัมน์ cid / quid
	descs = nil
	err = db.
		Table("criteria").
		Joins("JOIN calculations ON calculations.cid = criteria.id").
		Where("calculations.quid = ? AND criteria.min_criteria_score <= ? AND criteria.max_criteria_score >= ?",
			quID, score, score).
		Order("criteria.max_criteria_score ASC").
		Limit(1).
		Pluck("criteria.description", &descs).Error
	if err == nil && len(descs) > 0 {
		return descs[0], true
	}

	return "", false
}

// สุ่ม/จัดรูปแบบคะแนนให้ครอบคลุมเคส แล้วหาค่า resultLevel ให้สอดคล้อง testType
func mockScoreAndLevel(minScore, maxScore int, testTypePtr *string, index int) (total int, level string) {
	if minScore > maxScore {
		minScore, maxScore = 0, 27
	}
	span := maxScore - minScore
	mid := minScore + span/2

	// กระจายคะแนน: ต่ำ / กลาง / สูง
	switch index % 3 {
	case 0:
		total = minScore + rand.Intn(max(1, span/6)+1) // ต่ำ
	case 1:
		total = mid + rand.Intn(max(1, span/6)+1) - span/12 // กลาง
	default:
		total = maxScore - rand.Intn(max(1, span/6)+1) // สูง
	}
	if total < minScore {
		total = minScore
	}
	if total > maxScore {
		total = maxScore
	}

	testType := ""
	if testTypePtr != nil {
		testType = *testTypePtr
	}
	switch testType {
	case "negative":
		if total < mid {
			level = "happy"
		} else if total > mid {
			level = "sad"
		} else {
			level = "bored"
		}
	case "positive":
		if total < mid {
			level = "sad"
		} else if total > mid {
			level = "happy"
		} else {
			level = "bored"
		}
	default:
		if total == mid {
			level = "bored"
		} else if total < mid {
			level = "happy"
		} else {
			level = "sad"
		}
	}
	return total, level
}

func mockResultText(total, minScore, maxScore int) string {
	span := max(1, maxScore-minScore)
	pos := float64(total-minScore) / float64(span)
	switch {
	case pos < 0.33:
		return "แนวโน้มต่ำ"
	case pos < 0.66:
		return "แนวโน้มปานกลาง"
	default:
		return "แนวโน้มสูง"
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

/* ===================== NEW: Feedback seeding for users 4,5,6 ===================== */

// seedFeedbackForUserIDs จะสร้าง feedback_submissions/answers ให้ user แต่ละคน
// - ทำ 3 เดือนล่าสุด (เดือนนี้ + ย้อนหลัง 2)
// - กันซ้ำด้วย uid + period_key
func seedFeedbackForUserIDs(db *gorm.DB, userIDs []uint) error {
	// โหลดคำถาม Active พร้อมตัวเลือก
	var questions []entity.FeedbackQuestion
	if err := db.
		Preload("Options", func(tx *gorm.DB) *gorm.DB { return tx.Order("sort ASC, id ASC") }).
		Where("is_active = ?", true).
		Order("sort ASC, id ASC").
		Find(&questions).Error; err != nil {
		return fmt.Errorf("load active feedback questions failed: %w", err)
	}
	if len(questions) == 0 {
		// ไม่มีแบบประเมิน active → ข้าม
		return nil
	}

	// สุ่มข้อความตอบแบบ text
	textCorpus := []string{
		"ใช้งานสะดวกมากครับ",
		"โดยรวมดี มีบางจุดช้า",
		"อยากได้ธีมมืดเพิ่ม",
		"ฟังก์ชันครบ ใช้ง่าย",
	}

	monthsBack := 3
	now := time.Now()

	for _, uid := range userIDs {
		// ถ้า user ไม่อยู่ในระบบ ข้าม
		var cnt int64
		if err := db.Model(&entity.Users{}).Where("id = ?", uid).Count(&cnt).Error; err != nil {
			return fmt.Errorf("check user %d failed: %w", uid, err)
		}
		if cnt == 0 {
			continue
		}

		for m := 0; m < monthsBack; m++ {
			pk := now.AddDate(0, -m, 0).Format("2006-01")

			// กันซ้ำ uid + period_key
			var exists int64
			if err := db.Model(&entity.FeedbackSubmission{}).
				Where("uid = ? AND period_key = ?", uid, pk).
				Count(&exists).Error; err != nil {
				return fmt.Errorf("check duplicate (uid=%d, period=%s) failed: %w", uid, pk, err)
			}
			if exists > 0 {
				continue
			}

			// ทำงานแบบทรานแซกชัน
			if err := db.Transaction(func(tx *gorm.DB) error {
				sub := entity.FeedbackSubmission{
					UID:       uid,
					PeriodKey: &pk,
				}
				if err := tx.Create(&sub).Error; err != nil {
					return fmt.Errorf("create submission failed: %w", err)
				}

				for _, q := range questions {
					ans := entity.FeedbackAnswer{
						SubmissionID: sub.ID,
						QuestionID:   q.ID,
						UID:          uid,
					}

					switch q.Type {
					case "rating":
						v := 1 + rand.Intn(5) // 1..5
						ans.Rating = &v
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (rating) failed: %w", err)
						}

					case "text":
						t := textCorpus[rand.Intn(len(textCorpus))]
						ans.Text = &t
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (text) failed: %w", err)
						}

					case "choice_single":
						if len(q.Options) > 0 {
							oid := q.Options[rand.Intn(len(q.Options))].ID
							ans.OptionID = &oid
						}
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (single) failed: %w", err)
						}

					case "choice_multi":
						// ต้องสร้าง answer ก่อน แล้วค่อยแทรกตารางสะพาน
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (multi-step1) failed: %w", err)
						}
						if len(q.Options) > 0 {
							// เลือก 1..min(3,len(options)) แบบไม่ซ้ำ
							maxPick := 3
							if maxPick > len(q.Options) {
								maxPick = len(q.Options)
							}
							k := 1 + rand.Intn(maxPick)
							perm := rand.Perm(len(q.Options))[:k]
							for _, i := range perm {
								link := entity.FeedbackAnswerOption{
									AnswerID: ans.ID,
									OptionID: q.Options[i].ID,
								}
								if err := tx.Create(&link).Error; err != nil {
									return fmt.Errorf("create answer_option failed: %w", err)
								}
							}
						}

					default:
						// เผื่อชนิดใหม่
						if err := tx.Create(&ans).Error; err != nil {
							return fmt.Errorf("create answer (default) failed: %w", err)
						}
					}
				}
				return nil
			}); err != nil {
				return err
			}
		}
	}
	return nil
}
