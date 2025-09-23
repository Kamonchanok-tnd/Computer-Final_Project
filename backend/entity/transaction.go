package entity
import (
	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model
	Description        string `json:"description"        valid:"required~กรุณาระบุคำอธิบาย,length(0|256)~คำอธิบายต้องไม่เกิน 256 ตัวอักษร"`
	TotalScore         int    `json:"total_score"        valid:"required~กรุณาระบุผลคะแนน,range(0|100000)~คะแนนรวมต้องไม่ติดลบ"`
	MaxScore           int    `json:"max_score"          valid:"required~กรุณาระบุคะแนนสูงสุด,range(1|100000)~คะแนนเต็มต้องมากกว่า 0"`
	Result             string `json:"result"             valid:"required~กรุณาระบุผลการประเมิน"`
	TestType           string `json:"test_type"          valid:"required~กรุณาระบุประเภทการทดสอบ"`
	ResultLevel        string `json:"result_level"       valid:"required~กรุณาระบุระดับผลการประเมิน"`
	QuestionnaireGroup string `json:"questionnaire_group" valid:"required~กรุณาระบุกลุ่มแบบสอบถาม"`
	ARID               uint   `json:"arid"               valid:"required~กรุณาระบุรหัสผลการประเมิน (ARID)"`
}
