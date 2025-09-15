package unit

import (
	"strings"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func validTransaction() entity.Transaction {
	return entity.Transaction{
		Description:        "แบบวัดระดับความเครียด (ST-5)",
		TotalScore:         10,
		MaxScore:           20,
		Result:             "ไม่มีความเครียด",
		TestType:           "negative",
		ResultLevel:        "bored",
		QuestionnaireGroup: "post-test",
		ARID:               1,
	}
}

func TestTransaction_AllCases(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Description is required", func(t *testing.T) {
		m := validTransaction()
		m.Description = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำอธิบาย"))
	})
	t.Run("Description length = 257 -> invalid", func(t *testing.T) {
		m := validTransaction()
		m.Description = strings.Repeat("x", 257)
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คำอธิบายต้องไม่เกิน 256 ตัวอักษร"))
	})

	t.Run("TotalScore is required", func(t *testing.T) {
		m := validTransaction()
		m.TotalScore = 0 // จะชน required ก่อน (ตามลำดับแท็ก)
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผลคะแนน"))
	})

	t.Run("TotalScore negative -> invalid by range", func(t *testing.T) {
		m := validTransaction()
		m.TotalScore = -1 // non-zero -> ผ่าน required, ชน range
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนรวมต้องไม่ติดลบ"))
	})
	t.Run("MaxScore is required", func(t *testing.T) {
		m := validTransaction()
		m.MaxScore = 0 // required มาก่อน range
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคะแนนสูงสุด"))
	})

	t.Run("MaxScore negative -> invalid by range", func(t *testing.T) {
		m := validTransaction()
		m.MaxScore = -5 // non-zero -> ผ่าน required, ชน range
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนเต็มต้องมากกว่า 0"))
	})

	t.Run("Result is required", func(t *testing.T) {
		m := validTransaction()
		m.Result = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผลการประเมิน"))
	})

	t.Run("TestType is required", func(t *testing.T) {
		m := validTransaction()
		m.TestType = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุประเภทการทดสอบ"))
	})

	t.Run("ResultLevel is required", func(t *testing.T) {
		m := validTransaction()
		m.ResultLevel = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุระดับผลการประเมิน"))
	})

	t.Run("QuestionnaireGroup is required", func(t *testing.T) {
		m := validTransaction()
		m.QuestionnaireGroup = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุกลุ่มแบบสอบถาม"))
	})

	t.Run("ARID is required", func(t *testing.T) {
		m := validTransaction()
		m.ARID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุรหัสผลการประเมิน (ARID)"))
	})

	t.Run("All valid", func(t *testing.T) {
		m := validTransaction()
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
