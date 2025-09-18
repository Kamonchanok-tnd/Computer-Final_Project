package unit
import (

	
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)



func TestEmotion(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run("Emotion is success", func(t *testing.T) {
		Emotion := entity.Emotion{
			Mood:    "happy",
			Picture: "emotions/happy.png",
		}

		ok, err := govalidator.ValidateStruct(&Emotion) // ใช้ pointer

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Mood is required", func(t *testing.T) {
        Emotion := entity.Emotion{
			Mood:    "",
			Picture: "emotions/happy.png",
		}
		ok, err := govalidator.ValidateStruct(Emotion) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Mood is required"))
    })

	t.Run("Picture is required", func(t *testing.T) {
        Emotion := entity.Emotion{
			Mood:    "happy",
			Picture: "",
		}
		ok, err := govalidator.ValidateStruct(Emotion) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Picture is required"))
    })

	t.Run("picture must be .png/.jpg/.jpeg/.webp/.svg or data URL base64", func(t *testing.T) {
        Emotion := entity.Emotion{
			Mood:    "happy",
			Picture: "happy",
		}
		ok, err := govalidator.ValidateStruct(Emotion) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("picture must be .png/.jpg/.jpeg/.webp/.svg or data URL base64"))
    })

}