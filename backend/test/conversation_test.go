package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestConversation(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`Conversation is success`, func(t *testing.T) { // เป็นค่าลบ
		ChatRoom := entity.Conversation{
			
			Message :  "Hi",
			ChatRoomID : 2,
			STID :  1    ,
			
		}

		ok, err := govalidator.ValidateStruct(ChatRoom) 

		g.Expect(ok).To(BeTrue()) 
		g.Expect(err).To(BeNil()) 
	})

	t.Run(`Message is required`, func(t *testing.T) { // เป็นค่าลบ
		 conversation := entity.Conversation{
			
			Message :  "", //ผิดตรงนี้
			ChatRoomID : 2,
			STID :  1    ,
			
		}

		ok, err := govalidator.ValidateStruct(conversation) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("Message is required"))
	})

	t.Run(`ChatRoomID is required`, func(t *testing.T) { // เป็นค่าลบ
		conversation := entity.Conversation{
		   
		   Message :  "Hi",
		   ChatRoomID : 0,// ผิดตรงนี้
		   STID :  1    ,
		   
	   }

	   ok, err := govalidator.ValidateStruct(conversation) 

	   g.Expect(ok).NotTo(BeTrue()) //
	   g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	   g.Expect(err.Error()).To(Equal("ChatRoomID is required"))
   })

   t.Run(`SendType ID is required`, func(t *testing.T) { // เป็นค่าลบ
	conversation := entity.Conversation{
	   
	   Message :  "Hi",
	   ChatRoomID : 2,
	   STID :  0   ,// ผิดตรงนี้
	   
   }

   ok, err := govalidator.ValidateStruct(conversation) 

   g.Expect(ok).NotTo(BeTrue()) //
   g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

   g.Expect(err.Error()).To(Equal("SendType ID is required"))
})




	


}

