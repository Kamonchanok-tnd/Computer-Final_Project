package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestSendtype(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`SendType is success`, func(t *testing.T) { // เป็นค่าลบ
		sendtype := entity.SendType{
			Type : "test",
		 
		}

		ok, err := govalidator.ValidateStruct(sendtype)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
	t.Run(`Type is required`, func(t *testing.T) { // เป็นค่าลบ
		sendtype := entity.SendType{
			Type : "",
		 
		}

		ok, err := govalidator.ValidateStruct(sendtype) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Type is required"))
	})


}