package unit

import (
	"strings"
	"sukjai_project/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func init() {
    govalidator.CustomTypeTagMap.Set("youtube_url", govalidator.CustomTypeValidator(
        func(i interface{}, context interface{}) bool {
            url, ok := i.(string)
            if !ok || url == "" {
                return false
            }

            // ตรวจว่าเป็น URL
            if !govalidator.IsURL(url) {
                return false
            }

            // ตรวจว่าเป็น YouTube domain
            lower := strings.ToLower(url)
            if strings.Contains(lower, "youtube.com") || strings.Contains(lower, "youtu.be") {
                return true
            }
            return false
        }))
}
func TestSound(t *testing.T) {
	
	g := NewGomegaWithT(t)
	t.Run(`Conversation is success`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be",      
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 20,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 1,
		 
		}

		ok, err := govalidator.ValidateStruct(sound)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
	t.Run(`Name is required`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"" ,//ตรงนี้
			Sound:"https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be",      
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 20,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 1,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run(`Sound path is required`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"",   // ตรงนี้ผิด   
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 20,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 1,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("Sound path is required"))
	})

	t.Run(`Sound must be a valid YouTube URL`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"https://example.com/video.mp3",   // ตรงนี้ผิด   
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 20,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 1,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("Sound must be a valid YouTube URL"))
	})

	t.Run(`Owner is required`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be",      
			Lyric: "",
			Owner: "",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 20,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 1,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("Owner is required"))
	})

	t.Run(`Duration is required`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be",      
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 0,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 1,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("Duration is required"))
	})

	t.Run(`SoundType is required`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be",      
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 30,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 0,  
			UID  : 1,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("SoundType is required"))
	})

	t.Run(`UID is required`, func(t *testing.T) { // เป็นค่าลบ
		sound := entity.Sound{

			Name:"สมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Sound:"https://m.youtube.com/watch?si=CyYCDNb2Y1wPRSCG&v=x0-NKbGzvm4&feature=youtu.be",      
			Lyric: "",
			Owner: "SKT Meditation",
			Description: "เสียงสมาธิบำบัดแบบ SKT ท่าที่ 1-2",
			Duration: 30,
			LikeSound : 0,
			View : 0,
			Score : 0, 
			STID  : 1,  
			UID  : 0,
		 
		}
	ok, err := govalidator.ValidateStruct(sound) 
	g.Expect(ok).NotTo(BeTrue()) //
	g.Expect(err).NotTo(BeNil()) //จะ err ถ้าเป็น ไม่nil

	g.Expect(err.Error()).To(Equal("UID is required"))
	})


	




}