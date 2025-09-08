package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

// เคสตั้งต้นที่ "ถูกต้องครบ"
func makeValidArticleType() entity.ArticleType {
	return entity.ArticleType{
		Name:        "แรงบันดาลใจ",
		Description: "บทความแนวให้กำลังใจและสร้างแรงผลักดัน",
	}
}

func TestArticleTypeValidation(t *testing.T) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ ค่าปกติที่ถูกต้องครบ → ต้องผ่าน
	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)
		at := makeValidArticleType()
		ok, err := govalidator.ValidateStruct(at)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ Name ว่าง
	t.Run("name is required", func(t *testing.T) {
		g := NewWithT(t)
		at := makeValidArticleType()
		at.Name = ""

		ok, err := govalidator.ValidateStruct(at)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุชื่อประเภทบทความ"))
	})

	// ❌ Name ยาวเกิน 128
	t.Run("name too long", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 129)
		for i := range long { long[i] = 'x' }
		at := makeValidArticleType()
		at.Name = string(long)

		ok, err := govalidator.ValidateStruct(at)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ชื่อประเภทบทความยาวเกินไป"))
	})

	// ❌ Description ว่าง
	t.Run("description is required", func(t *testing.T) {
		g := NewWithT(t)
		at := makeValidArticleType()
		at.Description = ""

		ok, err := govalidator.ValidateStruct(at)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำอธิบาย"))
	})

	// ❌ Description ยาวเกิน 1000
	t.Run("description too long", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 1001)
		for i := range long { long[i] = 'x' }
		at := makeValidArticleType()
		at.Description = string(long)

		ok, err := govalidator.ValidateStruct(at)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คำอธิบายยาวเกินไป"))
	})

	// ✅ มีทั้ง Name และ Description (ไม่ว่างทั้งคู่) → ผ่าน
	t.Run("only required fields valid", func(t *testing.T) {
		g := NewWithT(t)
		at := entity.ArticleType{
			Name:        "ความรู้ทั่วไป",
			Description: "สั้น",
		}
		ok, err := govalidator.ValidateStruct(at)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})
}
