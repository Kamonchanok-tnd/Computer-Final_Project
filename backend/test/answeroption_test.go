// test/answer_option_test.go
package unit

import (
	"errors"
	"strings"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

/* ===== ย้ายมาที่นี่: ตรวจ tag + เช็คช่องว่างล้วน ===== */
func ValidateAnswerOption(ao entity.AnswerOption) (bool, error) {
	govalidator.SetFieldsRequiredByDefault(false)

	// 1) ตรวจตาม tag ก่อน
	if ok, err := govalidator.ValidateStruct(ao); !ok {
		return false, err
	}

	// 2) กันกรณี Description เป็นช่องว่างล้วน
	if strings.TrimSpace(ao.Description) == "" {
		return false, errors.New("กรุณาระบุคำตอบ")
	}

	// 3) EmotionChoiceID ต้องไม่เป็น 0
	if ao.EmotionChoiceID == 0 {
		return false, errors.New("กรุณาระบุอารมณ์ (EmotionChoiceID)")
	}

	return true, nil
}

/* ===== ตัวช่วยสร้างเคสที่ถูกต้อง 100% ===== */
func makeValidAO() entity.AnswerOption {
	return entity.AnswerOption{
		Description:     "รู้สึกดีมาก",
		Point:           10,
		QID:             1,
		EmotionChoiceID: 1, 
	}
}

func TestAnswerOptionValidation(t *testing.T) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ ทุกอย่างถูกต้อง
	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)
		ao := makeValidAO()

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ Description ว่าง
	t.Run("description is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		ao := makeValidAO()
		ao.Description = ""

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำตอบ"))
	})

	// ❌ Description เป็นช่องว่างล้วน
	t.Run("description only spaces (TH)", func(t *testing.T) {
		g := NewWithT(t)
		ao := makeValidAO()
		ao.Description = "   "

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำตอบ"))
	})

	// ❌ Description ยาวเกิน 256
	t.Run("description too long (TH)", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 257)
		for i := range long { long[i] = 'x' }
		ao := makeValidAO()
		ao.Description = string(long)

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คำตอบยาวเกินไป"))
	})

	// ❌ Point ติดลบ
	t.Run("point negative (TH)", func(t *testing.T) {
		g := NewWithT(t)
		ao := makeValidAO()
		ao.Point = -1

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนต้องอยู่ระหว่าง 0–1000"))
	})

	// ❌ Point เกินช่วง
	t.Run("point too large (TH)", func(t *testing.T) {
		g := NewWithT(t)
		ao := makeValidAO()
		ao.Point = 1001

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คะแนนต้องอยู่ระหว่าง 0–1000"))
	})

	// ❌ QID ว่าง (0)
	t.Run("qid is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		ao := makeValidAO()
		ao.QID = 0

		ok, err := ValidateAnswerOption(ao)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำถาม (QID)"))
	})

	// ❌ EmotionChoiceID ว่าง (0) → ต้อง error
    t.Run("emotionChoiceId is required zero (TH)", func(t *testing.T) {
	g := NewWithT(t)
	ao := makeValidAO()
	ao.EmotionChoiceID = 0

	ok, err := ValidateAnswerOption(ao)
	g.Expect(ok).To(BeFalse())
	g.Expect(err).ToNot(BeNil())
	g.Expect(err.Error()).To(Equal("กรุณาระบุอารมณ์ (EmotionChoiceID)"))
    })
	
}
