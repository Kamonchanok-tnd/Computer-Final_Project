import { Questionnaire } from "./IQuestionnaire";

export interface QuestionnaireGroup {
  id: number;
  name: string;
  description?: string;
  questionnaires: Questionnaire[];
}
