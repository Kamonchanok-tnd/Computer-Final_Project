// test/question_test.go
package unit

import (
	"errors"
	"regexp"
	"strings"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

/* ===== ย้ายมาฝั่งเทส: ตรวจ tag + ตรวจรูปภาพแบบ manual ===== */
var reDataURLQ = regexp.MustCompile(`^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$`)

func ValidateQuestion(q entity.Question) (bool, error) {
	govalidator.SetFieldsRequiredByDefault(false)

	// 1) ตรวจตาม tag (เฉพาะ non-pointer และไม่รวม relation เพราะ valid:"-")
	if ok, err := govalidator.ValidateStruct(q); !ok {
		return false, err
	}

	// 2) ตรวจ Picture แบบ manual (หากมีค่าและไม่ใช่สตริงว่าง ต้องเป็น data URL base64)
	if q.Picture != nil {
		s := strings.TrimSpace(*q.Picture)
		if s != "" && !reDataURLQ.MatchString(s) {
			return false, errors.New("รูปภาพต้องเป็น data URL แบบ base64")
		}
	}
	return true, nil
}

/* ===== factory สร้าง Question ที่ "ถูกต้อง 100%" ===== */
func makeValidQ() entity.Question {
	pic := "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB" // header PNG สั้น ๆ
	return entity.Question{
		NameQuestion: "วันนี้คุณรู้สึกอย่างไร",
		QuID:         1,
		Priority:     10,
		Picture:      &pic,
	}
}

func TestQuestionValidation(t *testing.T) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ ทุกอย่างถูกต้อง
	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)
		q := makeValidQ()

		ok, err := ValidateQuestion(q)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ NameQuestion ว่าง
	t.Run("nameQuestion is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		q := makeValidQ()
		q.NameQuestion = ""

		ok, err := ValidateQuestion(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุคำถาม"))
	})

	// ❌ NameQuestion ยาวเกิน 256
	t.Run("nameQuestion too long (TH)", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 257)
		for i := range long { long[i] = 'x' }
		q := makeValidQ()
		q.NameQuestion = string(long)

		ok, err := ValidateQuestion(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ชื่อคำถามยาวเกินไป"))
	})

	// ❌ QuID ว่าง (0)
	t.Run("quID is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		q := makeValidQ()
		q.QuID = 0

		ok, err := ValidateQuestion(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุแบบทดสอบ (QuID)"))
	})

	

	// ✅ เฉพาะฟิลด์บังคับ (ไม่มี Picture/Priority) ก็ต้องผ่าน
	t.Run("only required fields valid (TH)", func(t *testing.T) {
		g := NewWithT(t)
		q := entity.Question{
			NameQuestion: "วันนี้คุณรู้สึกอย่างไร",
			QuID:         1,
		}

		ok, err := ValidateQuestion(q)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ✅ Picture เป็นสตริงว่าง (pointer มีค่าแต่ค่าว่าง) ให้ผ่าน
	t.Run("picture empty string allowed (TH)", func(t *testing.T) {
		g := NewWithT(t)
		empty := ""
		q := makeValidQ()
		q.Picture = &empty

		ok, err := ValidateQuestion(q)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})
}
