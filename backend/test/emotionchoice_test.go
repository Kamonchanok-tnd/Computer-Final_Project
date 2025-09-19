
package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"

	"regexp"
	
)


var (
	reDataURL = regexp.MustCompile(`^data:image/(png|jpeg|jpg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$`)
	reFileExt = regexp.MustCompile(`^[A-Za-z0-9_\-./]+\.(png|jpg|jpeg|webp|svg)$`)
)

func init() {
	govalidator.TagMap["imageSource"] = govalidator.Validator(func(s string) bool {
		if s == "" {
			return false
		}
		return reDataURL.MatchString(s) || reFileExt.MatchString(s)
	})
}


func makeValidEmotionChoice() entity.EmotionChoice {
	return entity.EmotionChoice{
		Name:    "Happy",
		Picture: "emotions/happy.png",
	}
}

func TestEmotionChoiceValidation(t *testing.T) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ ปกติครบทุกอย่าง
	t.Run("all fields correct (filename path)", func(t *testing.T) {
		g := NewWithT(t)
		ec := makeValidEmotionChoice()
		ok, err := govalidator.ValidateStruct(ec)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ✅ data URL base64 ก็ผ่าน
	t.Run("all fields correct (data URL)", func(t *testing.T) {
		g := NewWithT(t)
		ec := entity.EmotionChoice{
			Name:    "Calm",
			Picture: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
		}
		ok, err := govalidator.ValidateStruct(ec)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ Name ว่าง
	t.Run("name is required", func(t *testing.T) {
		g := NewWithT(t)
		ec := makeValidEmotionChoice()
		ec.Name = ""

		ok, err := govalidator.ValidateStruct(ec)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุชื่ออารมณ์"))
	})

	// ❌ Name ยาวเกิน 128
	t.Run("name too long", func(t *testing.T) {
		g := NewWithT(t)
		long := make([]rune, 129); for i := range long { long[i] = 'x' }
		ec := makeValidEmotionChoice()
		ec.Name = string(long)

		ok, err := govalidator.ValidateStruct(ec)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ชื่ออารมณ์ยาวเกินไป"))
	})

	// ❌ Picture ว่าง
	t.Run("picture is required", func(t *testing.T) {
		g := NewWithT(t)
		ec := makeValidEmotionChoice()
		ec.Picture = ""

		ok, err := govalidator.ValidateStruct(ec)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุรูปภาพ"))
	})

	// ❌ Picture นามสกุลไม่อนุญาต
	t.Run("picture invalid extension", func(t *testing.T) {
		g := NewWithT(t)
		ec := makeValidEmotionChoice()
		ec.Picture = "emotions/anim.gif"

		ok, err := govalidator.ValidateStruct(ec)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("รูปภาพต้องเป็นไฟล์ .png/.jpg/.jpeg/.webp/.svg หรือ data URL แบบ base64"))
	})

	
}
