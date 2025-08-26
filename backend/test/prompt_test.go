package unit

import (
	"encoding/json"
	"strings"
	"testing"

	"sukjai_project/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestPrompt_RequiredFields(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run(`Name is required`, func(t *testing.T) {
		p := entity.Prompt{
			Name:      "", // ผิด
			Objective: "Help users",
		}
		ok, err := govalidator.ValidateStruct(p)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Name is required"))
	})

	t.Run(`Objective is required`, func(t *testing.T) {
		p := entity.Prompt{
			Name:      "Sukjai",
			Objective: "", // ผิด
		}
		ok, err := govalidator.ValidateStruct(p)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Objective is required"))
	})
}

func TestPrompt_MaxLengthConstraints(t *testing.T) {
	g := NewGomegaWithT(t)

	// สมมติ: Name ≤ 128, Objective ≤ 4096, ที่เหลือ ≤ 4096
	too := strings.Repeat("x", 4097) // ยาวเกิน
	okLen := strings.Repeat("a", 128)

	t.Run(`Name too long`, func(t *testing.T) {
		p := entity.Prompt{
			Name:      okLen + "z", // 129 (เกิน 128)
			Objective: "ok",
		}
		ok, err := govalidator.ValidateStruct(p)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Name")) // เช่น "Name too long"
	})

	t.Run(`Objective too long`, func(t *testing.T) {
		p := entity.Prompt{
			Name:      "ok",
			Objective: too,
		}
		ok, err := govalidator.ValidateStruct(p)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Objective")) // เช่น "Objective too long"
	})

	t.Run(`Persona/Tone/Instruction/Constraint/Context too long`, func(t *testing.T) {
		fields := []struct {
			name string
			make func() entity.Prompt
		}{
			{"Persona", func() entity.Prompt { return entity.Prompt{Name: "ok", Objective: "ok", Persona: too} }},
			{"Tone", func() entity.Prompt { return entity.Prompt{Name: "ok", Objective: "ok", Tone: too} }},
			{"Instruction", func() entity.Prompt { return entity.Prompt{Name: "ok", Objective: "ok", Instruction: too} }},
			{"Constraint", func() entity.Prompt { return entity.Prompt{Name: "ok", Objective: "ok", Constraint: too} }},
			{"Context", func() entity.Prompt { return entity.Prompt{Name: "ok", Objective: "ok", Context: too} }},
		}
		for _, f := range fields {
			t.Run(f.name, func(t *testing.T) {
				p := f.make()
				ok, err := govalidator.ValidateStruct(p)
				g.Expect(ok).NotTo(BeTrue())
				g.Expect(err).NotTo(BeNil())
				g.Expect(err.Error()).To(ContainSubstring(f.name))
			})
		}
	})
}

func TestPrompt_JSONTags_RoundTrip(t *testing.T) {
	g := NewGomegaWithT(t)

	in := []byte(`{
		"name":"Sukjai",
		"objective":"Help users briefly",
		"persona":"Friendly",
		"tone":"Calm",
		"instruction":"Be concise",
		"constraint":"No PII",
		"context":"Admin UI",
		"is_using":true
	}`)
	var p entity.Prompt
	err := json.Unmarshal(in, &p)
	g.Expect(err).To(BeNil())
	g.Expect(p.Name).To(Equal("Sukjai"))
	g.Expect(p.IsUsing).To(BeTrue())

	// marshal กลับต้องได้ key ตาม tag
	out, err := json.Marshal(p)
	g.Expect(err).To(BeNil())

	var m map[string]any
	_ = json.Unmarshal(out, &m)
	for _, k := range []string{
		"name", "objective", "persona", "tone",
		"instruction", "constraint", "context", "is_using",
	} {
		_, ok := m[k]
		g.Expect(ok).To(BeTrue(), "missing json key %q", k)
	}
}

func TestPrompt_Defaults_And_Unicode(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run(`IsUsing default false`, func(t *testing.T) {
		var p entity.Prompt
		g.Expect(p.IsUsing).To(BeFalse())
	})

	t.Run(`Unicode/Emoji accepted`, func(t *testing.T) {
		p := entity.Prompt{
			Name:      "ผู้ช่วยใจดี 😊",
			Objective: "ตอบแบบอ่อนโยนให้กำลังใจผู้ใช้",
			Persona:   "เอาใจใส่มาก ๆ",
			Tone:      "อบอุ่น",
			Context:   "หน้าแอดมิน",
		}
		ok, err := govalidator.ValidateStruct(p)
		g.Expect(err).To(BeNil())
		g.Expect(ok).To(BeTrue())
	})
}

func TestPrompt_ValidCase(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run(`All valid`, func(t *testing.T) {
		p := entity.Prompt{
			Name:        "Empathy Assistant",
			Objective:   "Provide concise supportive replies",
			Persona:     "Empathic",
			Tone:        "Warm",
			Instruction: "Be concise and supportive",
			Constraint:  "Avoid medical diagnosis",
			Context:     "Admin console",
			IsUsing:     true,
		}
		ok, err := govalidator.ValidateStruct(p)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
