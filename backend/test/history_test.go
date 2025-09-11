package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestHistory(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`History is success`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.History{
			SID : 1 ,
			UID : 2 ,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run(`UID is required`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.History{
			SID : 1 ,
			UID : 0 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("UID is required"))
	})

	t.Run(`SID is required`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.History{
			SID : 0 ,
			UID : 2 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("SID is required"))
	})




	


	


}