package unit

import (
	"strings"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func validQGroup() entity.QuestionnaireGroup {
	desc := "คำอธิบายกลุ่ม"
	return entity.QuestionnaireGroup{
		Name:        "pre-test",
		Description: desc,
	}
}

func TestQuestionnaireGroup_AllCases(t *testing.T) {
	g := NewGomegaWithT(t)

	// Name required + length(1|128)
	t.Run("missing Name -> required", func(t *testing.T) {
		m := validQGroup()
		m.Name = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		// ไฟล์จริงรวม required+length ไว้ใน tag เดียว ข้อความจะเป็นของแท็กแรก: required
		g.Expect(err.Error()).To(Equal("กรุณาระบุชื่อกลุ่มแบบสอบถาม"))
	})

	t.Run("Name length = 1 -> valid", func(t *testing.T) {
		m := validQGroup()
		m.Name = "x"
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Name length = 128 -> valid", func(t *testing.T) {
		m := validQGroup()
		m.Name = strings.Repeat("x", 128)
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Name length = 129 -> length invalid", func(t *testing.T) {
		m := validQGroup()
		m.Name = strings.Repeat("x", 129)
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		// ข้อความของ length tag ถูกกำหนดในไฟล์จริงว่า "กรุณาระบุชื่อกลุ่มไม่เกิน 128 ตัวอักษร"
		g.Expect(err.Error()).To(Equal("กรุณาระบุชื่อกลุ่มไม่เกิน 128 ตัวอักษร"))
	})

	// Description required
	t.Run("missing Description -> required", func(t *testing.T) {
		m := validQGroup()
		m.Description = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำอธิบาย"))
	})

	// valid ทั้ง struct
	t.Run("valid -> ok", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validQGroup())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
