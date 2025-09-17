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

/* ===== logic ฝั่งเทส: ตรวจ tag + pointer + cross-field ===== */
var reDataURLQN = regexp.MustCompile(`^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$`)

func ValidateQuestionnaire(q entity.Questionnaire) (bool, error) {
	govalidator.SetFieldsRequiredByDefault(false)

	if ok, err := govalidator.ValidateStruct(q); !ok {
		return false, err
	}

	if q.TestType != nil {
		switch strings.TrimSpace(*q.TestType) {
		case "2Q", "9Q", "awareness", "custom":
		default:
			return false, errors.New("ชนิดแบบทดสอบไม่ถูกต้อง")
		}
	}
	if q.ConditionType != nil {
		switch strings.TrimSpace(*q.ConditionType) {
		case "gte", "lte", "eq":
		default:
			return false, errors.New("ชนิดเงื่อนไขไม่ถูกต้อง")
		}
	}
	if q.Picture != nil {
		if !reDataURLQN.MatchString(strings.TrimSpace(*q.Picture)) {
			return false, errors.New("รูปภาพต้องเป็น data URL แบบ base64")
		}
	}

	if q.ConditionOnID != nil {
		if q.ConditionScore == nil || q.ConditionType == nil {
			return false, errors.New("ต้องระบุคะแนนเงื่อนไขและชนิดเงื่อนไขเมื่อมีการตั้ง ConditionOnID")
		}
	}
	if q.ConditionScore != nil && q.ConditionOnID == nil {
		return false, errors.New("ต้องระบุ ConditionOnID เมื่อมีการกำหนดคะแนนเงื่อนไข")
	}

	return true, nil
}

/* ===== ชุดเทส ===== */
func TestQuestionnaireValidation(t *testing.T) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ all fields correct
	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)
		tt := "9Q"
		on := uint(3)
		score := 8
		ctype := "lte"
		pic := "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"

		q := entity.Questionnaire{
			NameQuestionnaire: "คุณภาพการนอน",
			Description:       "คำอธิบายสั้น ๆ",
			Quantity:          9,
			UID:               7,
			Priority:          10,
			TestType:          &tt,
			ConditionOnID:     &on,
			ConditionScore:    &score,
			ConditionType:     &ctype,
			Picture:           &pic,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ ชื่อแบบทดสอบว่าง
	t.Run("nameQuestionnaire is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		q := entity.Questionnaire{
			NameQuestionnaire: "",
			UID:               1,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุชื่อแบบทดสอบ"))
	})

	// ❌ UID ว่าง
	t.Run("uid is required (TH)", func(t *testing.T) {
		g := NewWithT(t)
		q := entity.Questionnaire{
			NameQuestionnaire: "สุขภาพใจ",
			UID:               0,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผู้สร้าง"))
	})

	// ❌ ชื่อยาวเกิน
	t.Run("name too long (TH)", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 129)
		for i := range long {
			long[i] = 'x'
		}
		q := entity.Questionnaire{
			NameQuestionnaire: string(long),
			UID:               1,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ชื่อแบบทดสอบยาวเกินไป"))
	})

	// ❌ Description ยาวเกิน
	t.Run("description too long (TH)", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 1001)
		for i := range long {
			long[i] = 'x'
		}
		q := entity.Questionnaire{
			NameQuestionnaire: "โอเค",
			Description:       string(long),
			UID:               1,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("คำอธิบายยาวเกินไป"))
	})

	

	// ❌ Picture ไม่ใช่ data URL
	t.Run("picture invalid (TH)", func(t *testing.T) {
		g := NewWithT(t)
		p := "https://example.com/a.png"
		q := entity.Questionnaire{
			NameQuestionnaire: "โอเค",
			UID:               1,
			Picture:           &p,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("รูปภาพต้องเป็น data URL แบบ base64"))
	})

	// ❌ มี OnID แต่ไม่ใส่ Score/Type
	t.Run("onID set but missing score/type (TH)", func(t *testing.T) {
		g := NewWithT(t)
		on := uint(2)
		q := entity.Questionnaire{
			NameQuestionnaire: "โอเค",
			UID:               1,
			ConditionOnID:     &on,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ต้องระบุคะแนนเงื่อนไขและชนิดเงื่อนไขเมื่อมีการตั้ง ConditionOnID"))
	})

	// ❌ มี Score แต่ไม่มี OnID
	t.Run("score set but missing onID (TH)", func(t *testing.T) {
		g := NewWithT(t)
		score := 10
		q := entity.Questionnaire{
			NameQuestionnaire: "โอเค",
			UID:               1,
			ConditionScore:    &score,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ต้องระบุ ConditionOnID เมื่อมีการกำหนดคะแนนเงื่อนไข"))
	})

	// ✅ only required fields
	t.Run("only required fields valid (TH)", func(t *testing.T) {
		g := NewWithT(t)
		q := entity.Questionnaire{
			NameQuestionnaire: "แบบพื้นฐาน",
			UID:               42,
		}
		ok, err := ValidateQuestionnaire(q)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})
}

