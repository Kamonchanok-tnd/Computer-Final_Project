// interfaces/IQuestionnaire.ts
import { Question } from "./IQuestion";
import { QuestionnaireGroup } from "./IQuestionnaireGroup";

export interface Questionnaire {
  id?: number;
  nameQuestionnaire: string;
  description: string;
  quantity: number;
  uid: number;
  questions?: Question[];
  groups: QuestionnaireGroup[];
}