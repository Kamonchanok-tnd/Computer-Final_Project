import { Questionnaire } from "./IQuestionnaire";

export interface QuestionnaireGroup {
  id: number;
  name: string;
  description?: string;
  questionnaires: Questionnaire[];
}

export interface NextQ {
  id: number;
  name: string;
  order_in_group: number;
  condition_on_id?: number;
  condition_score?: number;
}

export interface GroupOut {
  id: number;
  name: string;
  description: string;
  frequency_days?: number;
  trigger_type?: string;
  available: boolean;
  reason: string;
  next?: NextQ;
  pending_quids?: number[];
}
