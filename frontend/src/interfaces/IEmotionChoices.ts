// Interface สำหรับข้อมูล EmotionChoice
import { AnswerOption } from "./IAnswerOption";
export interface EmotionChoice {
  id: number;                        // รหัสของ EmotionChoice
  name: string;                      // ชื่อของ EmotionChoice
  picture: string;                   // รูปภาพของ EmotionChoice
  answerOptions: AnswerOption[];     // ตัวเลือกคำตอบที่เกี่ยวข้อง (ถ้ามี)
}