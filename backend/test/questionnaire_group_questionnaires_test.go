package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func validQGQ() entity.QuestionnaireGroupQuestionnaire {
	return entity.QuestionnaireGroupQuestionnaire{
		QuestionnaireGroupID: 1,
		QuestionnaireID:      2,
		OrderInGroup:         1,
	}
}

func TestQuestionnaireGroupQuestionnaire_AllCases(t *testing.T) {
	g := NewGomegaWithT(t)

	// required IDs
	t.Run("missing QuestionnaireGroupID -> required", func(t *testing.T) {
		m := validQGQ()
		m.QuestionnaireGroupID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุกลุ่ม"))
	})

	t.Run("missing QuestionnaireID -> required", func(t *testing.T) {
		m := validQGQ()
		m.QuestionnaireID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("กรุณาระบุแบบสอบถาม"))
	})

	// OrderInGroup required + range(1|100000)
	t.Run("OrderInGroup == 0 -> required fired first", func(t *testing.T) {
		m := validQGQ()
		m.OrderInGroup = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		// ข้อความ required ของ field นี้:
		g.Expect(err.Error()).To(Equal("กรุณาระบุลำดับของคำถาม"))
	})

	t.Run("OrderInGroup lower bound 1 -> valid", func(t *testing.T) {
		m := validQGQ()
		m.OrderInGroup = 1
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("OrderInGroup upper bound 100000 -> valid", func(t *testing.T) {
		m := validQGQ()
		m.OrderInGroup = 100000
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("OrderInGroup > 100000 -> range invalid", func(t *testing.T) {
		m := validQGQ()
		m.OrderInGroup = 100001
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		// ข้อความของ range tag ถูกตั้งไว้: "ลำดับในกลุ่มต้องมากกว่าหรือเท่ากับ 1"
		g.Expect(err.Error()).To(Equal("ลำดับในกลุ่มต้องมากกว่าหรือเท่ากับ 1"))
	})

	// valid ทั้ง struct
	t.Run("valid -> ok", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validQGQ())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
