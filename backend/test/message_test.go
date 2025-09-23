package unit

import (
	"sukjai_project/entity"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestWordHealingContent_All(t *testing.T) {
	g := NewGomegaWithT(t)
	govalidator.SetFieldsRequiredByDefault(false) // ใช้ tag ที่เรากำหนดเท่านั้น

	// ---------------- TAG-BASED ----------------

	t.Run("tag: all fields correct", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "Short healing paragraph...",
			ArticleType: "story",
			ViewCount:   0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("tag: photo can be nil", func(t *testing.T) {
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       nil,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("tag: name is required", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run("tag: author is required", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("Author is required"))
	})

	t.Run("tag: content is required", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "",
			ArticleType: "story",
			ViewCount:   0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("Content is required"))
	})

	t.Run("tag: article type is required", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "",
			ViewCount:   0,
		}
		ok, err := govalidator.ValidateStruct(w)
		g.Expect(ok).To(BeFalse())
		g.Expect(err.Error()).To(Equal("Article type is required"))
	})

	// ---------------- BUSINESS RULES ----------------

	t.Run("biz: date is required (zero)", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Time{},
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err.Error()).To(Equal("Date is required"))
	})

	t.Run("biz: date cannot be in the future", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now().Add(2 * time.Hour),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err.Error()).To(Equal("Date cannot be in the future"))
	})

	t.Run("biz: no_of_like must be >= 0", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    -1,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err.Error()).To(Equal("NoOfLike must be >= 0"))
	})

	t.Run("biz: view_count must be >= 0", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   -5,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err.Error()).To(Equal("ViewCount must be >= 0"))
	})

	t.Run("biz: photo provided but empty", func(t *testing.T) {
		empty := "   "
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &empty,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "story",
			ViewCount:   0,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err.Error()).To(Equal("Photo cannot be empty when provided"))
	})

	t.Run("biz: article type not in allowed set", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "essay",
			ViewCount:   0,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err.Error()).To(Equal("Article type must be one of: quote, poem, story"))
	})

	t.Run("biz: article type case-insensitive ok", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    0,
			Date:        time.Now(),
			Content:     "x",
			ArticleType: "PoEm",
			ViewCount:   0,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err).To(BeNil())
	})

	t.Run("biz: valid all", func(t *testing.T) {
		photo := "data:image/png;base64,xxx"
		w := entity.WordHealingContent{
			Name:        "Calm Ocean",
			Author:      "Alice",
			Photo:       &photo,
			NoOfLike:    10,
			Date:        time.Now().Add(-1 * time.Hour),
			Content:     "Short healing paragraph...",
			ArticleType: "story",
			ViewCount:   100,
		}
		err := entity.ValidateWordHealingContent(w)
		g.Expect(err).To(BeNil())
	})
}
