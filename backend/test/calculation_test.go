package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

// เคสตั้งต้นที่ "ถูกต้องครบ"
func makeValidCalculation() entity.Calculation {
	return entity.Calculation{
		CID:  1,
		QuID: 2,
	}
}

func TestCalculationValidation(t *testing.T) {
	// ใช้ tag-based validation ตาม struct tag
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ ปกติครบทุกอย่าง → ต้องผ่าน
	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCalculation()

		ok, err := govalidator.ValidateStruct(c)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ CID ว่าง (0) → ต้องไม่ผ่าน และได้ข้อความตาม tag
	t.Run("cid is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCalculation()
		c.CID = 0 // ทำให้ผิด

		ok, err := govalidator.ValidateStruct(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุเกณฑ์ (CID)"))
	})

	// ❌ QuID ว่าง (0) → ต้องไม่ผ่าน และได้ข้อความตาม tag
	t.Run("quid is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCalculation()
		c.QuID = 0 // ทำให้ผิด

		ok, err := govalidator.ValidateStruct(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุแบบทดสอบ (QuID)"))
	})

	// ✅ เฉพาะฟิลด์บังคับครบ (ไม่มี relation) → ต้องผ่าน
	t.Run("only required fields valid (TH)", func(t *testing.T) {
		g := NewWithT(t)
		c := entity.Calculation{CID: 5, QuID: 9}

		ok, err := govalidator.ValidateStruct(c)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})
}
