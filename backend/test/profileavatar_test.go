package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestProfileavatar(t *testing.T) {

	g := NewGomegaWithT(t)
	t.Run(`ProfileAvatar is success`, func(t *testing.T) { // เป็นค่าลบ
		profileavatar := entity.ProfileAvatar{
			Avatar : "cute.png",
			Name : "cute",
		}

		ok, err := govalidator.ValidateStruct(profileavatar)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
	t.Run(`Avatar is required`, func(t *testing.T) { // เป็นค่าลบ
		sendtype := entity.ProfileAvatar{
			Avatar : "",
			Name : "cute",
		 
		}

		ok, err := govalidator.ValidateStruct(sendtype) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Avatar is required"))
	})

	t.Run(`Name is required`, func(t *testing.T) { // เป็นค่าลบ
		sendtype := entity.ProfileAvatar{
			Avatar : "cute.png",
			Name : "",
		 
		}

		ok, err := govalidator.ValidateStruct(sendtype) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Name is required"))
	})



}