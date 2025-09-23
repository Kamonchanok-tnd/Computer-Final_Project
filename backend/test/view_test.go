package unit

import (
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

// เคสตั้งต้น: ถูกต้องครบ (guest)
func makeValidViewGuest() entity.View {
	return entity.View{
		UID:         nil, // guest
		WHID:        10,
		ReadMS:      12000, // 12 วินาที
		PctScrolled: 80,
	}
}

// เคสตั้งต้น: ถูกต้องครบ (ผู้ใช้ล็อกอิน)
func makeValidViewMember() entity.View {
	uid := uint(7)
	return entity.View{
		UID:         &uid,
		WHID:        10,
		ReadMS:      5000,
		PctScrolled: 50,
	}
}

func TestViewValidation(t *testing.T) {
	govalidator.SetFieldsRequiredByDefault(false)

	// ✅ guest view → ผ่าน
	t.Run("all fields correct (guest)", func(t *testing.T) {
		g := NewWithT(t)
		v := makeValidViewGuest()
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ✅ member view → ผ่าน
	t.Run("all fields correct (member)", func(t *testing.T) {
		g := NewWithT(t)
		v := makeValidViewMember()
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ WHID ว่าง → ไม่ผ่าน (required)
	t.Run("whid is required", func(t *testing.T) {
		g := NewWithT(t)
		v := makeValidViewGuest()
		v.WHID = 0 // ทำให้ผิด
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุเนื้อหา (WHID)"))
	})

	// ❌ ReadMS ติดลบ → ไม่ผ่าน (range)
	t.Run("readMS negative", func(t *testing.T) {
		g := NewWithT(t)
		v := makeValidViewMember()
		v.ReadMS = -1
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("เวลาที่อ่านต้องอยู่ระหว่าง 0–864000000 มิลลิวินาที"))
	})

	// ❌ PctScrolled ติดลบ → ไม่ผ่าน
	t.Run("pctScrolled negative", func(t *testing.T) {
		g := NewWithT(t)
		v := makeValidViewMember()
		v.PctScrolled = -1
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("เปอร์เซ็นต์การเลื่อนต้องอยู่ระหว่าง 0–100"))
	})

	// ❌ PctScrolled > 100 → ไม่ผ่าน
	t.Run("pctScrolled over 100", func(t *testing.T) {
		g := NewWithT(t)
		v := makeValidViewGuest()
		v.PctScrolled = 101
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("เปอร์เซ็นต์การเลื่อนต้องอยู่ระหว่าง 0–100"))
	})

	// ✅ เฉพาะฟิลด์บังคับ (WHID) + ค่า default อื่น ๆ → ผ่าน
	t.Run("only required fields valid", func(t *testing.T) {
		g := NewWithT(t)
		v := entity.View{
			WHID: 1,
			// UID=nil, ReadMS/PctScrolled=0 (default)
		}
		ok, err := govalidator.ValidateStruct(v)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})
}
