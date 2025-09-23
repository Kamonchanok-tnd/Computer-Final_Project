package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestPlaylist(t *testing.T) {
	
	g := NewGomegaWithT(t)
	t.Run(`Conversation is success`, func(t *testing.T) { // เป็นค่าลบ
		playlist := entity.Playlist{
			Name: "Sukjai",
			UID:    1,
			BID:     2,
			STID:1 ,// foreign key ที่เชื่อมโยงกับ Playlist
			
		}

		ok, err := govalidator.ValidateStruct(playlist)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run(`Name is required`, func(t *testing.T) { // เป็นค่าลบ
		playlist := entity.Playlist{
			Name: "",//ผิดตรงนี้
			UID:    1,
			BID:     2,
			STID:1 ,// foreign key ที่เชื่อมโยงกับ Playlist
			
		}

		ok, err := govalidator.ValidateStruct(playlist) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run(`UID is required`, func(t *testing.T) { // เป็นค่าลบ
		playlist := entity.Playlist{
			Name: "Sukjai",
			UID:    0,//ผิดตรงนี้
			BID:     2,
			STID:1 ,// foreign key ที่เชื่อมโยงกับ Playlist
			
		}

		ok, err := govalidator.ValidateStruct(playlist) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("UID is required"))
	})
	
	t.Run(`Background is required`, func(t *testing.T) { // เป็นค่าลบ
		playlist := entity.Playlist{
			Name: "Sukjai",
			UID:    1,
			BID:     0, //ผิดตรงนี้
			STID:1 ,
			
		}

		ok, err := govalidator.ValidateStruct(playlist) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("Background is required"))
	})

	t.Run(`SoundType is required`, func(t *testing.T) { // เป็นค่าลบ
		playlist := entity.Playlist{
			Name: "Sukjai",
			UID:    1,
			BID:     2,
			STID:0 ,//ผิดตรงนี้
			
		}

		ok, err := govalidator.ValidateStruct(playlist) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("SoundType is required"))
	})


	




}
