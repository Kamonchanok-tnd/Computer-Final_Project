// ICriteria.ts
import { Calculation } from "./ICalculation";
export interface Criteria {
  id?: number;
  description: string;
  min_criteria_score: number;
  max_criteria_score: number;
  recommendation?: string; 
  calculations?: Calculation[];
}