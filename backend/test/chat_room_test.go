package unit

import (
	"sukjai_project/entity"
	"testing"
	"time"
	. "github.com/onsi/gomega"
	"github.com/asaskevich/govalidator"
)

func init() {
    govalidator.CustomTypeTagMap.Set("start_date_valid", govalidator.CustomTypeValidator(func(i interface{}, context interface{}) bool {
        chatRoom, ok := context.(entity.ChatRoom)
        if !ok {
            return false
        }

        start, ok := i.(time.Time)
        if !ok {
            return false
        }

        now := time.Now()
        // เงื่อนไข: start >= now && start <= chatRoom.EndDate
        if start.Before(now) {
            return false
        }
        if start.After(chatRoom.EndDate) {
            return false
        }
        return true
    }))

	govalidator.CustomTypeTagMap.Set("uid_valid", govalidator.CustomTypeValidator(func(i interface{}, context interface{}) bool {
        uid, ok := i.(uint)
        if !ok {
            return false
        }
        return uid > 0
    }))
}

func TestChatRoom(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`ChatRoom is success`, func(t *testing.T) { // เป็นค่าลบ
		ChatRoom := entity.ChatRoom{

			StartDate : time.Now(),
			EndDate  : time.Now(),
			IsClose  : false,
			UID      : 1,
		}

		ok, err := govalidator.ValidateStruct(ChatRoom) 

		g.Expect(ok).To(BeTrue()) 
		g.Expect(err).To(BeNil()) 
	})


	t.Run(`ChatRoom is required`, func(t *testing.T) { // เป็นค่าลบ
		ChatRoom := entity.ChatRoom{

			StartDate: time.Time{}, // ผิดตรงนี้
			EndDate  : time.Now(),
			IsClose  : false,
			UID      : 1,
		}

		ok, err := govalidator.ValidateStruct(ChatRoom) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("StartDate is required"))
	})



	t.Run("ChatRoom invalid: StartDate in past", func(t *testing.T) {
		chatRoom := entity.ChatRoom{
			StartDate: time.Now().Add(-1 * time.Hour), // ย้อนหลัง
			EndDate:   time.Now().Add(1 * time.Hour),
			IsClose:   false,
			UID:       1,
		}
	
		ok, err := govalidator.ValidateStruct(chatRoom)
	
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("StartDate must be in the present"))
	})

	t.Run("ChatRoom valid: StartDate in future", func(t *testing.T) {
		chatRoom := entity.ChatRoom{
			StartDate: time.Now().Add(1 * time.Hour),  // อนาคต
			EndDate:   time.Now().Add(2 * time.Hour), // ต้องมากกว่า StartDate
			IsClose:   false,
			UID:       1,
		}

		ok, err := govalidator.ValidateStruct(chatRoom)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("UID is required", func(t *testing.T) {
		chatRoom := entity.ChatRoom{
			StartDate: time.Now(), 
			EndDate:   time.Now(),
			IsClose:   false,
			UID:       0, // ผิดตรงนี้
		}
	
		ok, err := govalidator.ValidateStruct(chatRoom)
	
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("UID is required"))
	})

	

}

