package unit

import (

	
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)


func TestBot(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run("Botmodel is success", func(t *testing.T) {
        BotModel := entity.BotModel{
           Name:    "Sukjai",
		   Using   : true,
		   APIKeys : "dgftriujksjker",
        }

        ok, err := govalidator.ValidateStruct(&BotModel) // ใช้ pointer
       

        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })

	t.Run("Name is required", func(t *testing.T) {
        BotModel := entity.BotModel{
           Name:    "",
		   Using   : true,
		   APIKeys : "dgftriujksjker",
        }

		ok, err := govalidator.ValidateStruct(BotModel) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Name is required"))
    })
	t.Run("Name too long", func(t *testing.T) {
        BotModel := entity.BotModel{
           Name:    "คนเดินเท้าเบียดเสียดร่มกันไปมาด้วยอารมณ์ไม่ดีทั่วไป และเสียหลักที่มุมถนน ซึ่งคนเดินเท้าอีกหลายหมื่นคนลื่นไถลมาตั้งแต่เช้า (ถ้าวันนี้เคยมีเช้า) เพิ่มตะกอนใหม่ลงบนเปลือกโคลนหนาๆ ติดแน่นอยู่ที่จุดเหล่านั้นบนทางเท้า และสะสมด้วยดอกเบี้ยทบต้น",
		   Using   : true,
		   APIKeys : "dgftriujksjker",
        }

		ok, err := govalidator.ValidateStruct(BotModel) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Name too long"))
    })
	t.Run("Using is required", func(t *testing.T) {
        BotModel := entity.BotModel{
           Name:    "sukjai",
		
		   APIKeys : "dgftriujksjker",
        }

		ok, err := govalidator.ValidateStruct(BotModel) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("Using is required"))
    })

	t.Run("API is required", func(t *testing.T) {
        BotModel := entity.BotModel{
           Name:    "sukjai",
		   Using   : true,
		   APIKeys : "",
        }

		ok, err := govalidator.ValidateStruct(BotModel) 
		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil
	
		g.Expect(err.Error()).To(Equal("API keys is required"))
    })



}