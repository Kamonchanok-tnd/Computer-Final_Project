package entity
import (
	"gorm.io/gorm"
)

type Prompt struct {
	gorm.Model
	Objective string 
	Persona   string
	Tone      string
	Instruction string
	Constraint  string
	Context     string
	IsUsing       bool   
}