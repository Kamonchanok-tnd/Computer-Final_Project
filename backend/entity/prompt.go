package entity
import (
	"gorm.io/gorm"
)

type Prompt struct {
	gorm.Model
	Name        string `json:"name"        valid:"required~Name is required,stringlength(1|128)~Name too long"`
	Objective   string `json:"objective"   valid:"required~Objective is required,stringlength(1|4096)~Objective too long"`
	Persona     string `json:"persona"     valid:"stringlength(0|4096)~Persona too long"`
	Tone        string `json:"tone"        valid:"stringlength(0|4096)~Tone too long"`
	Instruction string `json:"instruction" valid:"stringlength(0|4096)~Instruction too long"`
	Constraint  string `json:"constraint"  valid:"stringlength(0|4096)~Constraint too long"`
	Context     string `json:"context"     valid:"stringlength(0|4096)~Context too long"`
	IsUsing     bool   `json:"is_using"`
}
