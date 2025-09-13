package unit

import (
	"sukjai_project/entity"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestUsers_AllFieldsCorrect(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username:         "johndoe",
		Password:         "Secure@123",
		Email:            "johndoe@example.com",
		PhoneNumber:      "0812345678",
		Role:             "admin",
		Age:              30,
		Gender:           "male",
		ResetToken:       "token123",
		ResetTokenExpiry: time.Now().Add(24 * time.Hour),
		ConsentAccepted:  true,
		ConsentAcceptedAt: time.Now(),
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "cute.png",
			Name:   "John Avatar",
		},
	}

	ok, err := govalidator.ValidateStruct(user)
	if !ok || err != nil {
		t.Fatalf("Validation failed: %v", err)
	}

	g.Expect(ok).To(BeTrue())
	g.Expect(err).To(BeNil())
}

func TestUsers_UsernameRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username:    "",
		Password:    "securepassword",
		Email:       "johndoe@example.com",
		PhoneNumber: "0812345678",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).NotTo(BeTrue())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("กรุณากรอกชื่อผู้ใช้"))
}

func TestUsers_PasswordRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username: "johndoe",
		Password: "",
		Email:    "johndoe@example.com",
		PhoneNumber: "0812345678",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).NotTo(BeTrue())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("กรุณากรอกรหัสผ่าน"))
}

func TestUsers_EmailRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username: "johndoe",
		Password: "securepassword",
		Email:    "",
		PhoneNumber: "0812345678",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).NotTo(BeTrue())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("กรุณากรอกอีเมล"))
}

func TestUsers_EmailFormatInvalid(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username:    "johndoe",
		Password:    "securepassword",
		Email:       "not-an-email",
		PhoneNumber: "0812345678",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).NotTo(BeTrue())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("รูปแบบอีเมลไม่ถูกต้อง"))
}

func TestUsers_PhoneNumberRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username: "johndoe",
		Password: "securepassword",
		Email:    "johndoe@example.com",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).NotTo(BeTrue())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("กรุณากรอกเบอร์โทรศัพท์"))
}

func TestUsers_PhoneNumberFormatInvalid(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username:    "johndoe",
		Password:    "securepassword",
		Email:       "johndoe@example.com",
		PhoneNumber: "12345",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).NotTo(BeTrue())
	g.Expect(err).NotTo(BeNil())
	g.Expect(err.Error()).To(Equal("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง"))
}

func TestUsers_PhoneNumberCorrect(t *testing.T) {
	g := NewGomegaWithT(t)

	user := entity.Users{
		Username:    "johndoe",
		Password:    "securepassword",
		Email:       "johndoe@example.com",
		PhoneNumber: "0812345678",
		ProfileAvatar: entity.ProfileAvatar{
			Avatar: "default.png",
			Name:   "Default Name",
		},
	}

	ok, err := govalidator.ValidateStruct(user)

	g.Expect(ok).To(BeTrue())
	g.Expect(err).To(BeNil())
}
