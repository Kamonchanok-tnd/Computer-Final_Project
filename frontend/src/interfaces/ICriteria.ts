// ICriteria.ts
import { Calculation } from "./ICalculation";
export interface Criteria {
  id: number;
  description: string;
  minScore: number;
  maxScore: number;
  calculations?: Calculation[];
}