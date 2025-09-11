package unit

import (
	"sukjai_project/entity"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestUsersValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	// ✅ case: ข้อมูลถูกต้องทั้งหมด
	t.Run("all fields correct", func(t *testing.T) {
		user := entity.Users{
			Username:          "johndoe",
			Password:          "securepassword",
			Email:             "johndoe@example.com",
			Facebook:          "johndoe.fb",
			Line:              "johndoe.line",
			PhoneNumber:       "0812345678",
			Role:              "admin",
			Age:               30,
			Gender:            "male",
			ResetToken:        "token123",
			ResetTokenExpiry:  time.Now().Add(24 * time.Hour),
			ConsentAccepted:   true,
			ConsentAcceptedAt: time.Now(),
		}

		ok, err := govalidator.ValidateStruct(user)
		if err != nil {
			
		}

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	// ❌ case: Username ว่าง
	t.Run("username is required", func(t *testing.T) {
		user := entity.Users{
			Username:    "",
			Password:    "securepassword",
			Email:       "johndoe@example.com",
			PhoneNumber: "0812345678", // ✅ ใส่เบอร์ให้ถูก เพื่อไม่ให้ชน validation อื่น
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Username is required"))
	})

	// ❌ case: Password ว่าง
	t.Run("password is required", func(t *testing.T) {
		user := entity.Users{
			Username:    "johndoe",
			Password:    "",
			Email:       "johndoe@example.com",
			PhoneNumber: "0812345678", // ✅ ใส่เบอร์ให้ถูก
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Password is required"))
	})

	// ❌ case: Email ว่าง
	t.Run("email is required", func(t *testing.T) {
		user := entity.Users{
			Username:    "johndoe",
			Password:    "securepassword",
			Email:       "",
			PhoneNumber: "0812345678", // ✅ ใส่เบอร์ให้ถูก
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Email is required"))
	})

	// ❌ case: Email format ไม่ถูกต้อง
	t.Run("email format invalid", func(t *testing.T) {
		user := entity.Users{
			Username:    "johndoe",
			Password:    "securepassword",
			Email:       "not-an-email",
			PhoneNumber: "0812345678", // ✅ ใส่เบอร์ให้ถูก
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Email format is invalid"))
	})

	// ❌ case: Phone number ว่าง
	t.Run("phone number is required", func(t *testing.T) {
		user := entity.Users{
			Username: "johndoe",
			Password: "securepassword",
			Email:    "johndoe@example.com",
			// PhoneNumber ว่าง
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Phone number is required"))
	})

	// ❌ case: Phone number format invalid
	t.Run("phone number format invalid", func(t *testing.T) {
		user := entity.Users{
			Username:    "johndoe",
			Password:    "securepassword",
			Email:       "johndoe@example.com",
			PhoneNumber: "12345", // ❌ ไม่ใช่เบอร์มือถือไทย
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Phone number format is invalid"))
	})

	// ✅ case: Phone number correct
	t.Run("phone number correct", func(t *testing.T) {
		user := entity.Users{
			Username:    "johndoe",
			Password:    "securepassword",
			Email:       "johndoe@example.com",
			PhoneNumber: "0812345678", // ✅ เบอร์ถูกต้อง
		}

		ok, err := govalidator.ValidateStruct(user)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
