package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestReview(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`Review is success`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.Review{
			Point : 1 ,
			SID : 2 ,
			UID : 1 ,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})


	t.Run(`Point is required`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.Review{
			Point : 0 ,
			SID : 2 ,
			UID : 1 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("Point is required"))
	})

	t.Run(`Point must be between 1 and 5`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.Review{
			Point : 10 ,
			SID : 2 ,
			UID : 1 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("Point must be between 1 and 5"))
	})

	t.Run(`Point must be between 1 and 5`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.Review{
			Point : -1 ,
			SID : 2 ,
			UID : 1 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("Point must be between 1 and 5"))
	})

	t.Run(`SoundID is required`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.Review{
			Point : 2 ,
			SID : 0 ,
			UID : 1 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("SoundID is required"))
	})

	t.Run(`UID is required`, func(t *testing.T) { // เป็นค่าลบ
		review := entity.Review{
			Point : 2 ,
			SID : 1 ,
			UID : 0 ,
		}

		ok, err := govalidator.ValidateStruct(review) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("UID is required"))
	})



	


}