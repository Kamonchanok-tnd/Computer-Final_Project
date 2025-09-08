package unit

import (
	"errors"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

/* ===== ฟังก์ชันช่วย ตรวจ tag + ตรรกะข้ามฟิลด์ (min <= max) ===== */
func ValidateCriteria(c entity.Criteria) (bool, error) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ตรวจตามแท็กก่อน
	if ok, err := govalidator.ValidateStruct(c); !ok {
		return false, err
	}
	// เช็กตรรกะ: min ต้องไม่มากกว่า max
	if c.MinCriteriaScore > c.MaxCriteriaScore {
		return false, errors.New("คะแนนต่ำสุดต้องไม่มากกว่าคะแนนสูงสุด")
	}
	return true, nil
}

/* ===== ตัวช่วยสร้างค่าที่ถูกต้อง 100% ===== */
func makeValidCriteria() entity.Criteria {
	return entity.Criteria{
		Description:      "ช่วงคะแนนเกณฑ์ปกติ",
		MinCriteriaScore: 0,
		MaxCriteriaScore: 10,
	}
}

/* ===== ชุดเทส ===== */
func TestCriteriaValidation(t *testing.T) {
	// ✅ ปกติครบทุกอย่าง → ผ่าน
	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCriteria()

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ Description ว่าง → ไม่ผ่าน (required/matches)
	t.Run("description is required", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCriteria()
		c.Description = ""

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำอธิบายเกณฑ์"))
	})

	// ❌ Description เป็นช่องว่างล้วน → ไม่ผ่าน (matches)
	t.Run("description only spaces not allowed", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCriteria()
		c.Description = "   "

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำอธิบายเกณฑ์"))
	})

	// ❌ Description ยาวเกิน 1000 → ไม่ผ่าน
	t.Run("description too long", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 1001)
		for i := range long { long[i] = 'x' }
		c := makeValidCriteria()
		c.Description = string(long)

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คำอธิบายยาวเกินไป"))
	})

	// ❌ MinCriteriaScore ติดลบ → ไม่ผ่าน (range)
	t.Run("min out of range (negative)", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCriteria()
		c.MinCriteriaScore = -1

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนต้องอยู่ระหว่าง 0–1000"))
	})

	// ❌ MaxCriteriaScore > 1000 → ไม่ผ่าน (range)
	t.Run("max out of range (too large)", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCriteria()
		c.MaxCriteriaScore = 1001

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนต้องอยู่ระหว่าง 0–1000"))
	})

	// ❌ Min > Max → ไม่ผ่าน (ตรรกะข้ามฟิลด์)
	t.Run("min greater than max", func(t *testing.T) {
		g := NewWithT(t)
		c := makeValidCriteria()
		c.MinCriteriaScore = 8
		c.MaxCriteriaScore = 5

		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนต่ำสุดต้องไม่มากกว่าคะแนนสูงสุด"))
	})

	// ✅ ขอบเขต min=0, max=0 + มีคำอธิบาย → ผ่าน
	t.Run("edge: min=0 max=0 valid", func(t *testing.T) {
		g := NewWithT(t)
		c := entity.Criteria{
			Description:      "กรณีพิเศษคะแนนเดียว",
			MinCriteriaScore: 0,
			MaxCriteriaScore: 0,
		}
		ok, err := ValidateCriteria(c)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})
}
