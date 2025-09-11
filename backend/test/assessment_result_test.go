package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func validAssessmentResult() entity.AssessmentResult {
	return entity.AssessmentResult{
		Date: "2025-09-10", // ณ ตอนนี้เช็คแค่ required ตามไฟล์จริง
		UID:  1,
		QuID: 2,
		QGID: 3,
	}
}

func TestAssessmentResult_AllCases(t *testing.T) {
	g := NewGomegaWithT(t)

	// required ทุกช่อง
	t.Run("missing Date -> required", func(t *testing.T) {
		m := validAssessmentResult()
		m.Date = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุวันที่"))
	})

	t.Run("missing UID -> required", func(t *testing.T) {
		m := validAssessmentResult()
		m.UID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผู้ใช้"))
	})

	t.Run("missing QuID -> required", func(t *testing.T) {
		m := validAssessmentResult()
		m.QuID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุแบบสอบถาม"))
	})

	t.Run("missing QGID -> required", func(t *testing.T) {
		m := validAssessmentResult()
		m.QGID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุกลุ่มแบบสอบถาม"))
	})

	// valid
	t.Run("valid -> ok", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validAssessmentResult())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
