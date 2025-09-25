// path: sukjai_project/controller/feedback/admin_feedback_users.go
package feedback

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"sukjai_project/config"
	"sukjai_project/util"

	"github.com/gin-gonic/gin"
)

// สำหรับรายการฝั่งซ้าย
type userLite struct {
	UID              string  `json:"uid"`
	Name             string  `json:"name"`
	AvatarURL        *string `json:"avatarUrl,omitempty"`
	TotalSubmissions int     `json:"total_submissions"`
	LatestPeriod     *string `json:"latest_period"` // YYYY-MM
}

// GET /admin/feedback/users?q=&from=YYYY-MM&to=YYYY-MM&limit=50&offset=0
func ListFeedbackUsers(c *gin.Context) {
	db := config.DB()

	q := strings.TrimSpace(c.Query("q"))
	fromYM := strings.TrimSpace(c.Query("from"))
	toYM := strings.TrimSpace(c.Query("to"))

	limit := atoiDefault(c.Query("limit"), 50)
	offset := atoiDefault(c.Query("offset"), 0)
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	// ฐานข้อมูล: Postgres
	// - uid เป็น uint -> แปลงเป็น TEXT
	// - users มี username, email (ไม่มี display_name / avatar_url)
	// - รวมเป็นราย user ด้วย COUNT(*) และ MAX(period_key)
	tx := db.Table("feedback_submissions AS s").
		Select(`
			CAST(s.uid AS TEXT) AS uid,
			COALESCE(NULLIF(u.username, ''), u.email, 'ผู้ใช้') AS name,
			NULL::TEXT AS avatar_url,
			COUNT(*) AS total_submissions,
			MAX(s.period_key) AS latest_period`).
		Joins("LEFT JOIN users u ON u.id = s.uid")

	// กรองช่วงเดือน (period_key = 'YYYY-MM')
	fromKey := normalizeYM(fromYM)
	toKey := normalizeYM(toYM)
	if fromKey != "" && toKey != "" {
		tx = tx.Where("s.period_key BETWEEN ? AND ?", fromKey, toKey)
	} else if fromKey != "" {
		tx = tx.Where("s.period_key >= ?", fromKey)
	} else if toKey != "" {
		tx = tx.Where("s.period_key <= ?", toKey)
	}

	// ค้นหาชื่อ/อีเมล
	if q != "" {
		like := "%" + q + "%"
		tx = tx.Where("(u.username ILIKE ? OR u.email ILIKE ?)", like, like)
	}

	// group by user แล้วเรียงคนที่ส่งล่าสุดก่อน (หรือจะเรียงชื่อก็ได้)
	tx = tx.
		Group("s.uid, u.username, u.email").
		Order("latest_period DESC, name ASC").
		Limit(limit).Offset(offset)

	var rows []userLite
	if err := tx.Scan(&rows).Error; err != nil {
		util.HandleError(c, http.StatusInternalServerError, "เกิดข้อผิดพลาดของฐานข้อมูล", "DB_ERROR")
		return
	}

	c.JSON(http.StatusOK, rows)
}

/* helpers */

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	if n, err := strconv.Atoi(s); err == nil {
		return n
	}
	return def
}

func normalizeYM(ym string) string {
	if ym == "" {
		return ""
	}
	t, err := time.Parse("2006-01", ym)
	if err != nil {
		return ""
	}
	return t.Format("2006-01")
}
