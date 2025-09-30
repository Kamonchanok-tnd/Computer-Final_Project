package unit

import (
	"testing"
	"time"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestWordHealingContent_All(t *testing.T) {
	
	// ตรวจเฉพาะฟิลด์ที่มีแท็ก valid
	govalidator.SetFieldsRequiredByDefault(false)

	t.Run("all fields correct", func(t *testing.T) {
		g := NewWithT(t)

		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:          "Calm Ocean",
			Author:        "Alice",
			Photo:         &photo,
			NoOfLike:      0,
			Date:          time.Now(),
			Content:       "Short healing paragraph...",
			ArticleTypeID: 1,
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("name is required", func(t *testing.T) {
		g := NewWithT(t)

		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:          "",
			Author:        "Alice",
			Photo:         &photo,
			NoOfLike:      0,
			Date:          time.Now(),
			Content:       "x",
			ArticleTypeID: 1,
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run("author is required", func(t *testing.T) {
		g := NewWithT(t)

		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:          "Calm Ocean",
			Author:        "",
			Photo:         &photo,
			NoOfLike:      0,
			Date:          time.Now(),
			Content:       "x",
			ArticleTypeID: 1,
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Author is required"))
	})

	t.Run("photo provided but empty", func(t *testing.T) {
		g := NewWithT(t)

		// photo เป็น pointer แต่ค่าว่าง ไม่ถูก validate (ผ่าน)
		empty := ""
		w := entity.WordHealingContent{
			Name:          "Calm Ocean",
			Author:        "Alice",
			Photo:         &empty,
			NoOfLike:      0,
			Date:          time.Now(),
			Content:       "x",
			ArticleTypeID: 1,
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("date in the future", func(t *testing.T) {
		g := NewWithT(t)

		// ไม่มี rule ห้ามอนาคต (ผ่าน)
		future := time.Now().AddDate(0, 0, 1)
		w := entity.WordHealingContent{
			Name:          "Calm Ocean",
			Author:        "Alice",
			Photo:         nil,
			NoOfLike:      0,
			Date:          future,
			Content:       "x",
			ArticleTypeID: 1,
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("content is required", func(t *testing.T) {
		g := NewWithT(t)

		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:          "Calm Ocean",
			Author:        "Alice",
			Photo:         &photo,
			NoOfLike:      0,
			Date:          time.Now(),
			Content:       "",
			ArticleTypeID: 1,
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Content is required"))
	})

	t.Run("article type is required", func(t *testing.T) {
		g := NewWithT(t)

		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:          "Calm Ocean",
			Author:        "Alice",
			Photo:         &photo,
			NoOfLike:      0,
			Date:          time.Now(),
			Content:       "x",
			ArticleTypeID: 0, // zero value ของ uint  ไม่ผ่าน required
			ViewCount:     0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		
	})
}
