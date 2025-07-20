package entity
import (
	"gorm.io/gorm"
)

type Prompt struct {
	gorm.Model
	Name 	  string    `json:"name"`
	Objective string `json:"objective"`
	Persona     string    `json:"persona"`
	Tone        string    `json:"tone"`
	Instruction string    `json:"instruction"`
	Constraint  string    `json:"constraint"`
	Context     string    `json:"context"`
	IsUsing     bool      `json:"is_using"`  
}