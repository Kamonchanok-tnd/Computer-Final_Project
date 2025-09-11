package unit

import (

	"strings"
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)


func init() {
    govalidator.TagMap["isimageext"] = govalidator.Validator(func(str string) bool {
        str = strings.ToLower(str)
        return strings.HasSuffix(str, ".jpg") ||
               strings.HasSuffix(str, ".jpeg") ||
               strings.HasSuffix(str, ".png")
    })
}
func TestBackground(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run("Background is success", func(t *testing.T) {
        background := entity.Background{
            Name:    "ต้นไม้",
            Picture: "tree.png",
            UID:     1,
        }

        ok, err := govalidator.ValidateStruct(&background) // ใช้ pointer
       

        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
	t.Run(`Name is required`, func(t *testing.T) { // เป็นค่าลบ
		background := entity.Background{
			Name  : "", 
			Picture: "1.png",
			UID: 1,
		 
		}

		ok, err := govalidator.ValidateStruct(background) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run(`Picture is required`, func(t *testing.T) { // เป็นค่าลบ
		background := entity.Background{
			Name  : "ต้นไม้", 
			Picture: "",
			UID: 1,
		 
		}

		ok, err := govalidator.ValidateStruct(background) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Picture is required"))
	})


	t.Run(`UID is required`, func(t *testing.T) { // เป็นค่าลบ
		background := entity.Background{
			Name  : "ต้นไม้", 
			Picture: "1.png",
			UID: 0,
		 
		}

		ok, err := govalidator.ValidateStruct(background) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("UID is required"))
	})

	


}