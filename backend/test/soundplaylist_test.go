package unit

import (
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestSoundplaylist(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`SoundPlaylist is success`, func(t *testing.T) { // เป็นค่าลบ
		soundplaylist := entity.SoundPlaylist{
			SID : 1 ,
			PID : 2 ,
			
		}

		ok, err := govalidator.ValidateStruct(soundplaylist)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run(`SoundID is required`, func(t *testing.T) { // เป็นค่าลบ
		soundplaylist := entity.SoundPlaylist{
			SID : 0 ,
			PID : 2 ,
			
		}

		ok, err := govalidator.ValidateStruct(soundplaylist) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("SoundID is required"))
	})

	t.Run(`PlaylistID is required`, func(t *testing.T) { // เป็นค่าลบ
		soundplaylist := entity.SoundPlaylist{
			SID : 1 ,
			PID : 0 ,
			
		}

		ok, err := govalidator.ValidateStruct(soundplaylist) 

		g.Expect(ok).NotTo(BeTrue()) //
		g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

		g.Expect(err.Error()).To(Equal("PlaylistID is required"))
	})


}