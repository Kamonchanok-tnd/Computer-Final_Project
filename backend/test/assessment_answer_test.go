package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func validAssessmentAnswer() entity.AssessmentAnswer {
	return entity.AssessmentAnswer{
		QuestionNumber: 1,
		Point:          1,
		QID:            10,
		ARID:           20,
		AOID:           30,
	}
}

func TestAssessmentAnswer_AllCases(t *testing.T) {
	g := NewGomegaWithT(t)

	// ----- required string/int/uint -----
	t.Run("QuestionNumber is required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QuestionNumber = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุจำนวนคำถาม"))
	})

	t.Run("QID is required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำถาม"))
	})

	t.Run("ARID is required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.ARID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผลแบบสอบถาม"))
	})

	t.Run("AOID is required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.AOID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุตัวเลือกคำตอบ"))
	})

	// ----- ranges / boundaries -----
	t.Run("QuestionNumber below lower bound (0) -> required fired first", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QuestionNumber = 0 // ชน required ก่อน
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุจำนวนคำถาม"))
	})

	t.Run("QuestionNumber too long", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QuestionNumber = 10001
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		// ข้อความ range ของฟิลด์นี้: "ลำดับคำถามต้องมากกว่าหรือเท่ากับ 1"
		g.Expect(err.Error()).To(Equal("ลำดับคำถามต้องมากกว่าหรือเท่ากับ 1 และต้องไม่เกิน 10000"))
	})

	t.Run("Point negative", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.Point = -1 // ผ่าน required (ไม่ใช่ 0) แต่ชน range
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("คะแนนต้องเป็นจำนวนเต็มไม่ติดลบและไม่เกิน 100000"))
	})

	t.Run("Point too many", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.Point = 100001
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("คะแนนต้องเป็นจำนวนเต็มไม่ติดลบและไม่เกิน 100000"))
	})

	// ----- fully valid -----
	t.Run("All valid", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validAssessmentAnswer())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
