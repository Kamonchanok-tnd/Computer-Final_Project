// unit/mirror_test.go
package unit

import (
	"testing"
	"time"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

/* ===== Required Fields ===== */
func TestMirror_RequiredFields(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Date is required", func(t *testing.T) {
		m := entity.Mirror{
			// Date: zero
			Title:   "ok",
			Message: "ok",
			EID:     1,
			UID:     1,
		}
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุวันที่"))
	})

	t.Run("UID is required", func(t *testing.T) {
		m := entity.Mirror{
			Date:    time.Now(),
			Title:   "ok",
			Message: "ok",
			EID:     0,
			UID:     0, // missing
		}
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผู้ใช้"))
	})
}

/* ===== Length Constraints ===== */
func TestMirror_LengthConstraints(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Title too long (>128)", func(t *testing.T) {
		longTitle := make([]rune, 129)
		for i := range longTitle {
			longTitle[i] = 'x'
		}
		m := entity.Mirror{
			Date:    time.Now(),
			Title:   string(longTitle),
			Message: "ok",
			EID:     0,
			UID:     1,
		}
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("หัวเรื่องยาวเกินไป"))
	})

	t.Run("Message too long (>1000)", func(t *testing.T) {
		longMsg := make([]rune, 1001)
		for i := range longMsg {
			longMsg[i] = 'x'
		}
		m := entity.Mirror{
			Date:    time.Now(),
			Title:   "ok",
			Message: string(longMsg),
			EID:     0,
			UID:     1,
		}
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ข้อความยาวเกินไป"))
	})
}

/* ===== Valid Cases ===== */
func TestMirror_AllValid(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Only required fields present (optional empty) -> OK", func(t *testing.T) {
		m := entity.Mirror{
			Date:    time.Now(),
			Title:   "",
			Message: "",
			EID:     1,   // allowed
			UID:     123, // required
		}
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("All fields within limits -> OK", func(t *testing.T) {
		m := entity.Mirror{
			Date:    time.Now(),
			Title:   "วันนี้",
			Message: "บันทึกสั้น ๆ",
			EID:     2,
			UID:     123,
		}
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
