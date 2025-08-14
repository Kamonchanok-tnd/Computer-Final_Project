// interfaces/IQuestion.ts
import { AnswerOption } from "./IAnswerOption";
export interface Question {
  id: number;
  nameQuestion: string;
  quID: number;
  priority: number;
  picture?: string | null;  // ✅ เพิ่มฟิลด์นี้
  answers?: AnswerOption[];
}

