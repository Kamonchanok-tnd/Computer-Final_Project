package feedback

import (
	"fmt"
	"net/http"
	"strings"

	"sukjai_project/config"
	"sukjai_project/entity"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//
// ===== DTO =====
//

// ใช้ตอนรับจากแอดมิน (PUT form)
type OptionDTO struct {
	Label string `json:"label" binding:"required"`
	Sort  int    `json:"sort"`
}

// Question types: rating | text | choice_single | choice_multi
type QuestionInDTO struct {
	Label   string      `json:"label" binding:"required"`
	Type    string      `json:"type"  binding:"required,oneof=rating text choice_single choice_multi"`
	Sort    int         `json:"sort"`
	Options []OptionDTO `json:"options,omitempty"` // ใช้เมื่อ type เป็น choice_*
}

type FeedbackFormIn struct {
	Questions []QuestionInDTO `json:"questions" binding:"required,min=1"`
}

// ====== DTO ที่ "ส่งออกไปให้ฟรอนต์" — ต้องมี id ======
type OptionOutDTO struct {
	ID    uint   `json:"id"`
	Label string `json:"label"`
	Sort  int    `json:"sort"`
}
type QuestionOutDTO struct {
	ID      uint           `json:"id"`
	Key     string         `json:"key"`
	Label   string         `json:"label"`
	Type    string         `json:"type"`
	Sort    int            `json:"sort"`
	Options []OptionOutDTO `json:"options,omitempty"`
}
type FeedbackFormOut struct {
	Questions []QuestionOutDTO `json:"questions"`
}

//
// ===== Helpers =====
//

func slugifyKey(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	prev := false
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			prev = false
		default:
			if !prev {
				b.WriteByte('_')
				prev = true
			}
		}
	}
	out := strings.Trim(b.String(), "_")
	if out == "" {
		out = "q"
	}
	if len(out) > 40 {
		out = out[:40]
	}
	return out
}

//
// ===== GET /admin/feedback-form =====
// คืนคำถามชุด Active พร้อมตัวเลือก (ถ้ามี) สำหรับหน้าจอแอดมิน/พรีวิว
//
func AdminGetFeedbackForm(c *gin.Context) {
	var qs []entity.FeedbackQuestion
	if err := config.DB().
		Where("is_active = ?", true).
		Preload("Options", func(db *gorm.DB) *gorm.DB { return db.Order("sort ASC, id ASC") }).
		Order("sort ASC, id ASC").
		Find(&qs).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ดึงแบบฟอร์มไม่สำเร็จ", "FETCH_FAILED")
		return
	}

	out := FeedbackFormOut{Questions: make([]QuestionOutDTO, 0, len(qs))}
	for _, q := range qs {
		item := QuestionOutDTO{
			ID:    q.ID,
			Key:   q.Key,
			Label: q.Label,
			Type:  q.Type,
			Sort:  q.Sort,
		}
		if strings.HasPrefix(q.Type, "choice_") && len(q.Options) > 0 {
			item.Options = make([]OptionOutDTO, 0, len(q.Options))
			for _, op := range q.Options {
				item.Options = append(item.Options, OptionOutDTO{
					ID:    op.ID,   // <<<< สำคัญ: ใส่ id ออกไป
					Label: op.Label,
					Sort:  op.Sort,
				})
			}
		}
		out.Questions = append(out.Questions, item)
	}

	c.JSON(http.StatusOK, out)
}

//
// ===== GET /feedback/form =====
// endpoint สำหรับฝั่งผู้ใช้ (ฟรอนต์เรียกใช้อยู่)
//
func GetFeedbackForm(c *gin.Context) {
	// ใช้ logic เดียวกับ Admin แต่ตอบ DTO เดียวกัน
	var qs []entity.FeedbackQuestion
	if err := config.DB().
		Where("is_active = ?", true).
		Preload("Options", func(db *gorm.DB) *gorm.DB { return db.Order("sort ASC, id ASC") }).
		Order("sort ASC, id ASC").
		Find(&qs).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ดึงแบบฟอร์มไม่สำเร็จ", "FETCH_FAILED")
		return
	}

	out := FeedbackFormOut{Questions: make([]QuestionOutDTO, 0, len(qs))}
	for _, q := range qs {
		item := QuestionOutDTO{
			ID:    q.ID,
			Key:   q.Key,
			Label: q.Label,
			Type:  q.Type,
			Sort:  q.Sort,
		}
		if strings.HasPrefix(q.Type, "choice_") && len(q.Options) > 0 {
			item.Options = make([]OptionOutDTO, 0, len(q.Options))
			for _, op := range q.Options {
				item.Options = append(item.Options, OptionOutDTO{
					ID:    op.ID,  // <<<< สำคัญ
					Label: op.Label,
					Sort:  op.Sort,
				})
			}
		}
		out.Questions = append(out.Questions, item)
	}

	c.JSON(http.StatusOK, out)
}
// ===== PUT /admin/feedback-form =====
// อัปเดตแบบ "diff": คำถามใช้ is_active (ไม่ลบ), ตัวเลือกไม่มี is_active -> sync เพิ่ม/อัปเดต/ลบ
func AdminUpdateFeedbackForm(c *gin.Context) {
	var req FeedbackFormIn
	if err := c.ShouldBindJSON(&req); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}
	if len(req.Questions) == 0 {
		util.HandleError(c, http.StatusBadRequest, "ต้องมีคำถามอย่างน้อย 1 ข้อ", "NO_QUESTIONS")
		return
	}
	// validate options เฉพาะ choice_*
	for _, q := range req.Questions {
		if strings.HasPrefix(q.Type, "choice_") && len(q.Options) == 0 {
			util.HandleError(c, http.StatusBadRequest,
				fmt.Sprintf("คำถาม '%s' ต้องมี options อย่างน้อย 1 ตัวเลือก", q.Label),
				"OPTIONS_REQUIRED")
			return
		}
	}

	norm := func(s string) string { return strings.ToLower(strings.TrimSpace(s)) }

	err := config.DB().Transaction(func(tx *gorm.DB) error {
		// 1) โหลดคำถาม active ปัจจุบัน พร้อม options (options ไม่ต้องมี is_active)
		var oldQs []entity.FeedbackQuestion
		if err := tx.
			Preload("Options", func(db *gorm.DB) *gorm.DB { return db.Order("sort ASC") }).
			Where("is_active = ?", true).
			Order("sort ASC").
			Find(&oldQs).Error; err != nil {
			return err
		}

		// map คำถามเดิมด้วย label+type
		type qKey struct{ label, qtype string }
		oldByKey := make(map[qKey]*entity.FeedbackQuestion, len(oldQs))
		for i := range oldQs {
			q := &oldQs[i]
			oldByKey[qKey{norm(q.Label), norm(q.Type)}] = q
		}

		// กันคีย์ซ้ำตอนสร้างคำถามใหม่
		var allKeys []string
		if err := tx.Model(&entity.FeedbackQuestion{}).Select(`"key"`).Find(&allKeys).Error; err != nil {
			return err
		}
		usedKey := make(map[string]struct{}, len(allKeys))
		for _, k := range allKeys { usedKey[k] = struct{}{} }
		makeKey := func(label string) string {
			base := slugifyKey(strings.TrimSpace(label))
			if base == "" { base = "q" }
			k := base
			if _, ok := usedKey[k]; !ok { usedKey[k] = struct{}{}; return k }
			for i := 2; ; i++ {
				try := fmt.Sprintf("%s_%d", base, i)
				if _, ok := usedKey[try]; !ok { usedKey[try] = struct{}{}; return try }
			}
		}

		keepQ := make(map[uint]struct{})

		// 2) เดินคำถามตาม payload
		for i, inQ := range req.Questions {
			sortNo := inQ.Sort
			if sortNo == 0 { sortNo = i + 1 }

			key := qKey{norm(inQ.Label), norm(inQ.Type)}
			if ex, ok := oldByKey[key]; ok {
				// --- UPDATE คำถามเดิม (id เดิม) ---
				if err := tx.Model(&entity.FeedbackQuestion{}).
					Where("id = ?", ex.ID).
					Updates(map[string]interface{}{
						"label":     strings.TrimSpace(inQ.Label),
						"type":      inQ.Type,
						"sort":      sortNo,
						"is_active": true,
					}).Error; err != nil {
					return err
				}
				keepQ[ex.ID] = struct{}{}

				// ---- ซิงก์ options เฉพาะ choice_* ----
				if strings.HasPrefix(inQ.Type, "choice_") {
					// ทำ map options เดิมตาม label
					exOptByLabel := make(map[string]*entity.FeedbackOption, len(ex.Options))
					for i := range ex.Options {
						o := &ex.Options[i]
						exOptByLabel[norm(o.Label)] = o
					}

					// สร้าง/อัปเดตสิ่งที่อยู่ใน payload
					seen := make(map[uint]struct{})
					for j, op := range inQ.Options {
						oSort := op.Sort
						if oSort == 0 { oSort = j + 1 }
						if exist := exOptByLabel[norm(op.Label)]; exist != nil {
							// update label/sort
							if err := tx.Model(&entity.FeedbackOption{}).
								Where("id = ?", exist.ID).
								Updates(map[string]interface{}{
									"label": strings.TrimSpace(op.Label),
									"sort":  oSort,
								}).Error; err != nil {
								return err
							}
							seen[exist.ID] = struct{}{}
						} else {
							// create ใหม่
							newOpt := entity.FeedbackOption{
								QuestionID: ex.ID,
								Label:      strings.TrimSpace(op.Label),
								Sort:       oSort,
							}
							if err := tx.Create(&newOpt).Error; err != nil {
								return err
							}
							seen[newOpt.ID] = struct{}{}
						}
					}

					// ลบ options ที่ไม่อยู่ใน payload (เพราะไม่มี is_active ให้ซ่อน)
					if len(ex.Options) > 0 {
						var toDelete []uint
						for _, old := range ex.Options {
							if _, ok := seen[old.ID]; !ok {
								toDelete = append(toDelete, old.ID)
							}
						}
						if len(toDelete) > 0 {
							if err := tx.Where("id IN ?", toDelete).
								Delete(&entity.FeedbackOption{}).Error; err != nil {
								return err
							}
						}
					}
				} else {
					// ไม่ใช่ choice_* → ลบ options ทั้งหมด (ไม่ใช้ is_active)
					if err := tx.Where("question_id = ?", ex.ID).
						Delete(&entity.FeedbackOption{}).Error; err != nil {
						return err
					}
				}
			} else {
				// --- CREATE คำถามใหม่ ---
				newQ := entity.FeedbackQuestion{
					Key:      makeKey(inQ.Label),
					Label:    strings.TrimSpace(inQ.Label),
					Type:     inQ.Type,
					IsActive: true,
					Sort:     sortNo,
				}
				if err := tx.Create(&newQ).Error; err != nil {
					return err
				}
				keepQ[newQ.ID] = struct{}{}

				// create options ถ้าเป็น choice_*
				if strings.HasPrefix(inQ.Type, "choice_") && len(inQ.Options) > 0 {
					opts := make([]entity.FeedbackOption, 0, len(inQ.Options))
					for j, op := range inQ.Options {
						oSort := op.Sort
						if oSort == 0 { oSort = j + 1 }
						opts = append(opts, entity.FeedbackOption{
							QuestionID: newQ.ID,
							Label:      strings.TrimSpace(op.Label),
							Sort:       oSort,
						})
					}
					if err := tx.Create(&opts).Error; err != nil {
						return err
					}
				}
			}
		}

		// 3) ปิดการใช้งานคำถามที่ไม่อยู่ใน payload (อย่าลบ)
		var toDeactivateQ []uint
		for _, old := range oldQs {
			if _, keep := keepQ[old.ID]; !keep {
				toDeactivateQ = append(toDeactivateQ, old.ID)
			}
		}
		if len(toDeactivateQ) > 0 {
			if err := tx.Model(&entity.FeedbackQuestion{}).
				Where("id IN ?", toDeactivateQ).
				Update("is_active", false).Error; err != nil {
				return err
			}
			// ลบ options ของคำถามที่ถูกปิด (options ไม่มี is_active)
			if err := tx.Where("question_id IN ?", toDeactivateQ).
				Delete(&entity.FeedbackOption{}).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		util.HandleError(c, http.StatusInternalServerError, "อัปเดตแบบฟอร์มไม่สำเร็จ", "UPDATE_FORM_FAILED")
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "บันทึกแบบฟอร์มสำเร็จ"})
}
