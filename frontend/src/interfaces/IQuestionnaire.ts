// interfaces/IQuestionnaire.ts
import { Question } from "./IQuestion";
export interface Questionnaire {
  id?: number;
  nameQuestionnaire: string;
  description: string;
  quantity: number;
  uid: number;
  questions?: Question[];
}