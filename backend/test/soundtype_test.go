package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestSoundtype(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`SoundType is success`, func(t *testing.T) { // เป็นค่าลบ
		soundtype := entity.SoundType{
			Type : "สมาธิ",
		 
		}

		ok, err := govalidator.ValidateStruct(soundtype)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
	t.Run(`Type is required`, func(t *testing.T) { // เป็นค่าลบ
		soundtype := entity.SoundType{
			Type : "",
		 
		}

		ok, err := govalidator.ValidateStruct(soundtype) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Type is required"))
	})


}