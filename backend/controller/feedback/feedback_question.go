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

// ===== ชุดฟอร์มเดียว: GET/PUT /admin/feedback-form =====
type RatingItemDTO struct {
	Label string `json:"label" binding:"required"`
	Sort  int    `json:"sort"`
}
type FinalCommentDTO struct {
	Enabled bool   `json:"enabled"`
	Label   string `json:"label"`
}
type FeedbackFormDTO struct {
	Ratings      []RatingItemDTO  `json:"ratings" binding:"required"` // หัวข้อให้ดาวหลายข้อ
	FinalComment *FinalCommentDTO `json:"final_comment,omitempty"`     // ช่องคำแนะนำท้ายฟอร์ม (เปิด/ปิด)
}

// --- GET /admin/feedback-form : ดึงชุดที่ใช้งาน (is_active = true) ---
func AdminGetFeedbackForm(c *gin.Context) {
	var qs []entity.FeedbackQuestion
	if err := config.DB().
		Where("is_active = ?", true).
		Order("sort ASC, id ASC").
		Find(&qs).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "ดึงแบบฟอร์มไม่สำเร็จ", "FETCH_FAILED")
		return
	}

	resp := FeedbackFormDTO{Ratings: []RatingItemDTO{}}
	for _, q := range qs {
		switch q.Type {
		case "rating":
			resp.Ratings = append(resp.Ratings, RatingItemDTO{Label: q.Label, Sort: q.Sort})
		case "text":
			if resp.FinalComment == nil {
				resp.FinalComment = &FinalCommentDTO{Enabled: true, Label: q.Label}
			}
		}
	}
	if resp.FinalComment == nil {
		resp.FinalComment = &FinalCommentDTO{Enabled: false, Label: ""}
	}
	c.JSON(http.StatusOK, resp)
}

// --- PUT /admin/feedback-form : แทนที่ทั้งชุดในหนึ่งทรานแซกชัน ---
func AdminUpdateFeedbackForm(c *gin.Context) {
	var req FeedbackFormDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		util.HandleError(c, http.StatusBadRequest, "ข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR")
		return
	}
	if len(req.Ratings) == 0 {
		util.HandleError(c, http.StatusBadRequest, "ต้องมีหัวข้อให้คะแนนอย่างน้อย 1 ข้อ", "NO_RATINGS")
		return
	}

	slugify := func(s string) string {
		s = strings.ToLower(strings.TrimSpace(s))
		var b strings.Builder
		prevUnderscore := false
		for _, r := range s {
			switch {
			case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
				b.WriteRune(r)
				prevUnderscore = false
			default:
				if !prevUnderscore {
					b.WriteByte('_')
					prevUnderscore = true
				}
			}
		}
		out := strings.Trim(b.String(), "_")
		if out == "" { out = "q" }
		if len(out) > 40 { out = out[:40] }
		return out
	}

	if err := config.DB().Transaction(func(tx *gorm.DB) error {
		// ล้างชุดเดิม (soft delete เฉพาะที่ active)
		if err := tx.Where("is_active = ?", true).
			Delete(&entity.FeedbackQuestion{}).Error; err != nil {
			return err
		}

		used := map[string]struct{}{}
		makeKey := func(label string) string {
			k := slugify(label)
			if _, ok := used[k]; !ok {
				used[k] = struct{}{}
				return k
			}
			for i := 2; ; i++ {
				kk := fmt.Sprintf("%s_%d", k, i)
				if _, ok := used[kk]; !ok {
					used[kk] = struct{}{}
					return kk
				}
			}
		}

		// สร้าง rating ตามลำดับ sort (ถ้าไม่ได้ส่ง sort จะใช้ index)
		for i, r := range req.Ratings {
			sort := r.Sort
			if sort == 0 && i > 0 { sort = i }
			item := entity.FeedbackQuestion{
				Key:      makeKey(r.Label),
				Label:    r.Label,
				Type:     "rating",
				IsActive: true,
				Sort:     sort,
			}
			if err := tx.Create(&item).Error; err != nil { return err }
		}

		// ช่องคำแนะนำท้ายฟอร์ม (เลือกได้ว่าจะมีหรือไม่)
		if req.FinalComment != nil && req.FinalComment.Enabled {
			item := entity.FeedbackQuestion{
				Key:      makeKey(req.FinalComment.Label),
				Label:    req.FinalComment.Label,
				Type:     "text",
				IsActive: true,
				Sort:     9999, // ดันไปท้ายฟอร์ม
			}
			if err := tx.Create(&item).Error; err != nil { return err }
		}
		return nil
	}); err != nil {
		util.HandleError(c, http.StatusInternalServerError, "อัปเดตแบบฟอร์มไม่สำเร็จ", "UPDATE_FORM_FAILED")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "บันทึกแบบฟอร์มสำเร็จ"})
}
