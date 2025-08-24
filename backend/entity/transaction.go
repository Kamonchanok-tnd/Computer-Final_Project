package entity
import (
	"gorm.io/gorm"
)
type Transaction struct {
	gorm.Model
	Description 		string `json:"description"`
	TotalScore  		int    `json:"total_score"`
	MaxScore    		int    `json:"max_score"`
	Result      		string `json:"result"`
	TestType    		string `json:"test_type"`
	ResultLevel 		string `json:"result_level"`
	QuestionnaireGroup 	string `json:"questionnaire_group"`
	ARID      			uint   `json:"arid"`
} 