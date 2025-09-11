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
	t.Run("missing QuestionNumber -> required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QuestionNumber = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุจำนวนคำถาม"))
	})

	t.Run("missing Point -> required (0 ถือว่าขาด)", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.Point = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคะแนน"))
	})

	t.Run("missing QID -> required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำถาม"))
	})

	t.Run("missing ARID -> required", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.ARID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผลการประเมิน"))
	})

	t.Run("missing AOID -> required", func(t *testing.T) {
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

	t.Run("QuestionNumber upper bound 10000 -> valid", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QuestionNumber = 10000
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("QuestionNumber > 10000 -> invalid (range)", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.QuestionNumber = 10001
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		// ข้อความ range ของฟิลด์นี้: "ลำดับคำถามต้องมากกว่าหรือเท่ากับ 1"
		g.Expect(err.Error()).To(Equal("ลำดับคำถามต้องมากกว่าหรือเท่ากับ 1"))
	})

	t.Run("Point negative -> range invalid", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.Point = -1 // ผ่าน required (ไม่ใช่ 0) แต่ชน range
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("คะแนนต้องเป็นจำนวนเต็มไม่ติดลบ"))
	})

	t.Run("Point upper bound 100000 -> valid", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.Point = 100000
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Point > 100000 -> range invalid", func(t *testing.T) {
		m := validAssessmentAnswer()
		m.Point = 100001
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("คะแนนต้องเป็นจำนวนเต็มไม่ติดลบ"))
	})

	// ----- fully valid -----
	t.Run("valid -> ok", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validAssessmentAnswer())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
