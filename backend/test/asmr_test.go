package unit

import (
	"testing"
	"time"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func validASMR() entity.ASMR {
	return entity.ASMR{
		Time: time.Date(2025, 9, 10, 10, 0, 0, 0, time.UTC),
		UID:  1,
	}
}

func TestASMR_AllCases(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Time is required", func(t *testing.T) {
		m := validASMR()
		m.Time = time.Time{} // zero time
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุเวลา"))
	})

	t.Run("UID is required", func(t *testing.T) {
		m := validASMR()
		m.UID = 0
		ok, err := govalidator.ValidateStruct(m)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("กรุณาระบุผู้ใช้"))
	})

	t.Run("All valid", func(t *testing.T) {
		ok, err := govalidator.ValidateStruct(validASMR())
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
