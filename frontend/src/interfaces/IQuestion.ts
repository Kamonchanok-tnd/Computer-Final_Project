// interfaces/IQuestion.ts
import { AnswerOption } from "./IAnswerOption";
export interface Question {
  id: number;
  nameQuestion: string;
  quID: number;
  priority: number;
  answers?: AnswerOption[];
}

