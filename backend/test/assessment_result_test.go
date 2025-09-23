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
	t.Run("Date is required", func(t *testing.T) {
		m := validAssessmentResult()
		m.Date = ""
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุวันที่"))
	})

	t.Run("UID is required", func(t *testing.T) {
		m := validAssessmentResult()
		m.UID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผู้ใช้"))
	})

	t.Run("QuID is required", func(t *testing.T) {
		m := validAssessmentResult()
		m.QuID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุแบบสอบถาม"))
	})

	t.Run("QGID is required", func(t *testing.T) {
		m := validAssessmentResult()
		m.QGID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุกลุ่มแบบสอบถาม"))
	})

	// valid
	t.Run("All valid", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validAssessmentResult())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
