package unit

import (
	"errors"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

/* ===== ฟังก์ชันช่วย: ตรวจ tag + ตรรกะข้ามฟิลด์ (XOR ของ WID/SID) ===== */
func ValidateLike(l entity.Like) (bool, error) {
	govalidator.SetFieldsRequiredByDefault(false)

	// 1) ตรวจตามแท็กก่อน (เช่น UID ต้องมีค่า)
	if ok, err := govalidator.ValidateStruct(l); !ok {
		return false, err
	}

	// 2) ตรวจตรรกะ: ต้องเลือกอย่างใดอย่างหนึ่งระหว่าง WID กับ SID
	if l.WID == 0 && l.SID == 0 {
		return false, errors.New("ต้องระบุอย่างน้อยหนึ่งรายการ: WID หรือ SID")
	}
	if l.WID != 0 && l.SID != 0 {
		return false, errors.New("ระบุได้เพียงอย่างใดอย่างหนึ่ง: WID หรือ SID")
	}
	return true, nil
}

/* ===== ตัวช่วย: เคสตั้งต้นที่ถูกต้อง 100% ===== */
func makeValidLikeWID() entity.Like {
	return entity.Like{
		UID: 7,
		WID: 123, // เลือก WID
		// SID เว้นว่าง
	}
}

func makeValidLikeSID() entity.Like {
	return entity.Like{
		UID: 7,
		SID: 55, // เลือก SID
	}
}

/* ===== ชุดเทส ===== */
func TestLikeValidation(t *testing.T) {
	// ✅ ปกติครบ (UID + WID อย่างเดียว) → ผ่าน
	t.Run("all fields correct with WID", func(t *testing.T) {
		g := NewWithT(t)
		l := makeValidLikeWID()
		ok, err := ValidateLike(l)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ✅ ปกติครบ (UID + SID อย่างเดียว) → ผ่าน
	t.Run("all fields correct with SID", func(t *testing.T) {
		g := NewWithT(t)
		l := makeValidLikeSID()
		ok, err := ValidateLike(l)
		g.Expect(ok).To(BeTrue(), "unexpected error: %v", err)
		g.Expect(err).To(BeNil())
	})

	// ❌ UID ว่าง (0) → ไม่ผ่าน (ตามแท็ก)
	t.Run("uid is required", func(t *testing.T) {
		g := NewWithT(t)
		l := makeValidLikeWID()
		l.UID = 0 // ทำให้ผิด
		ok, err := ValidateLike(l)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผู้ใช้ (UID)"))
	})

	// ❌ ไม่ระบุทั้ง WID และ SID → ไม่ผ่าน (XOR: อย่างน้อยหนึ่ง)
	t.Run("missing both wid and sid", func(t *testing.T) {
		g := NewWithT(t)
		l := entity.Like{UID: 9} // ไม่มี wid/sid
		ok, err := ValidateLike(l)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ต้องระบุอย่างน้อยหนึ่งรายการ: WID หรือ SID"))
	})

	// ❌ ระบุทั้ง WID และ SID → ไม่ผ่าน (XOR: ได้แค่อย่างเดียว)
	t.Run("both wid and sid provided", func(t *testing.T) {
		g := NewWithT(t)
		l := entity.Like{UID: 9, WID: 1, SID: 2}
		ok, err := ValidateLike(l)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ระบุได้เพียงอย่างใดอย่างหนึ่ง: WID หรือ SID"))
	})
}
