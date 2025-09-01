// interfaces/IQuestionnaire.ts
import { Question } from "./IQuestion";
import { QuestionnaireGroup } from "./IQuestionnaireGroup";

export interface Questionnaire {
  id?: number;                    // ID ของแบบทดสอบ (optional)
  nameQuestionnaire: string;       // ชื่อแบบทดสอบ
  description: string;             // คำอธิบาย
  quantity: number;                // จำนวนคำถาม
  uid: number;                     // รหัสผู้ใช้
  testType: string;                // ประเภทแบบทดสอบ ("positive" หรือ "negative")

  // Optional Fields สำหรับเงื่อนไข
  conditionOnID?: number;          // ID ของแบบทดสอบที่ต้องทำก่อน (optional)
  conditionScore?: number;         // คะแนนที่ต้องได้จากแบบทดสอบก่อนหน้า (optional)
  conditionType?: string;          // ประเภทของเงื่อนไขคะแนน (optional)

  picture?: string;                // รูปภาพแบบ base64 (optional)
  priority?: number;

  questions?: Question[];          // คำถาม (optional)
  groups: QuestionnaireGroup[];    // กลุ่มคำถาม
}