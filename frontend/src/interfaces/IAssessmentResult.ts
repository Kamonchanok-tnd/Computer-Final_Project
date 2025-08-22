import { UsersInterface } from './IUser';
import {Questionnaire} from './IQuestionnaire'
import {AssessmentAnswer} from './IAssessmentAnswer'
import {Transaction} from './ITransaction';

export interface IAssessmentResult {
  id: number;
  date: string;

  uid: number;     // FK to Users
  quid: number;    // FK to Questionnaire

  user?: UsersInterface;                // optional object (ถ้ามี preload)
  questionnaire?: Questionnaire;

  answers?: AssessmentAnswer[];
  transaction?: Transaction;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
