package unit

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"sukjai_project/entity"
)

/* Validator สำหรับใช้ในเทสต์เท่านั้น */
func ValidateWordHealingContentForTest(w entity.WordHealingContent) (bool, error) {
	if strings.TrimSpace(w.Name) == "" {
		return false, fmt.Errorf("Name is required")
	}
	if strings.TrimSpace(w.Author) == "" {
		return false, fmt.Errorf("Author is required")
	}
	if w.Photo != nil && strings.TrimSpace(*w.Photo) == "" {
		return false, fmt.Errorf("Photo cannot be empty when provided")
	}
	if w.Date.IsZero() {
		return false, fmt.Errorf("Date is required")
	}
	if w.Date.After(time.Now()) {
		return false, fmt.Errorf("Date cannot be in the future")
	}
	if strings.TrimSpace(w.Content) == "" {
		return false, fmt.Errorf("Content is required")
	}
	if strings.TrimSpace(w.ArticleType) == "" {
		return false, fmt.Errorf("Article type is required")
	}
	
	return true, nil
}

func makeValidWHC() entity.WordHealingContent {
	return entity.WordHealingContent{
		Name:        "Good name",
		Author:      "Good author",
		Photo:       nil,
		NoOfLike:    0,
		Date:        time.Now().Add(-time.Hour),
		Content:     "some content",
		ArticleType: "quote",
		ViewCount:   0,
	}
}

func assertError(t *testing.T, err error, want string) {
	t.Helper()
	if err == nil {
		t.Fatalf("expected error %q, got nil", want)
	}
	if got := err.Error(); got != want {
		t.Fatalf("unexpected error.\n got: %q\nwant: %q", got, want)
	}
}

/* ====== Tests (รูปแบบเดียวกับตัวอย่าง) ====== */
func TestWordHealingContentValidation(t *testing.T) {

	t.Run("all fields correct", func(t *testing.T) {
		w := makeValidWHC()
		ok, err := ValidateWordHealingContentForTest(w)
		if !ok || err != nil {
			t.Fatalf("expected ok with nil error, got ok=%v err=%v", ok, err)
		}
	})

	t.Run("name is required", func(t *testing.T) {
		w := makeValidWHC()
		w.Name = ""
		ok, err := ValidateWordHealingContentForTest(w)
		if ok {
			t.Fatalf("expected !ok for empty name")
		}
		assertError(t, err, "Name is required")
	})

	t.Run("author is required", func(t *testing.T) {
		w := makeValidWHC()
		w.Author = "   "
		ok, err := ValidateWordHealingContentForTest(w)
		if ok {
			t.Fatalf("expected !ok for empty author")
		}
		assertError(t, err, "Author is required")
	})

	t.Run("photo provided but empty", func(t *testing.T) {
		w := makeValidWHC()
		empty := "   "
		w.Photo = &empty
		ok, err := ValidateWordHealingContentForTest(w)
		if ok {
			t.Fatalf("expected !ok for empty photo when provided")
		}
		assertError(t, err, "Photo cannot be empty when provided")
	})

	t.Run("date in the future", func(t *testing.T) {
		w := makeValidWHC()
		w.Date = time.Now().Add(time.Hour)
		ok, err := ValidateWordHealingContentForTest(w)
		if ok {
			t.Fatalf("expected !ok for future date")
		}
		assertError(t, err, "Date cannot be in the future")
	})

	t.Run("content is required", func(t *testing.T) {
		w := makeValidWHC()
		w.Content = "   "
		ok, err := ValidateWordHealingContentForTest(w)
		if ok {
			t.Fatalf("expected !ok for empty content")
		}
		assertError(t, err, "Content is required")
	})

	t.Run("article type is required", func(t *testing.T) {
		w := makeValidWHC()
		w.ArticleType = " "
		ok, err := ValidateWordHealingContentForTest(w)
		if ok {
			t.Fatalf("expected !ok for empty article type")
		}
		assertError(t, err, "Article type is required")
	})

}
