package unit

import (
	"sukjai_project/entity"
	"testing"

	. "github.com/onsi/gomega"
)

func TestUserActivityValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	// ✅ ข้อมูลถูกต้อง
	t.Run("all fields correct", func(t *testing.T) {
		activity := entity.UserActivity{
			UID:    1,
			Action: "login",
			Page:   "/dashboard",
		}

		err := activity.Validate()
		g.Expect(err).To(BeNil())
	})

	// ❌ UID = 0 → error
	t.Run("uid is required", func(t *testing.T) {
		activity := entity.UserActivity{
			UID:    0,
			Action: "login",
			Page:   "/dashboard",
		}

		err := activity.Validate()
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("User ID is required"))
	})

	// ❌ Action ว่าง
	t.Run("action is required", func(t *testing.T) {
		activity := entity.UserActivity{
			UID:    1,
			Action: "",
			Page:   "/dashboard",
		}

		err := activity.Validate()
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Action is required"))
	})

	// ❌ Page ว่าง
	t.Run("page is required", func(t *testing.T) {
		activity := entity.UserActivity{
			UID:    1,
			Action: "login",
			Page:   "",
		}

		err := activity.Validate()
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Page is required"))
	})
}
