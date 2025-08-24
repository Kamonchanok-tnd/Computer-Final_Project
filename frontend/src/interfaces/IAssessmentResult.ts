import { UsersInterface } from './IUser';
import {Questionnaire} from './IQuestionnaire'
import {AssessmentAnswer} from './IAssessmentAnswer'
import {Transaction} from './ITransaction';
import {QuestionnaireGroup} from './IQuestionnaireGroup';

export interface IAssessmentResult {
  id: number;
  date: string;

  uid: number;     // FK to Users
  quid: number;    // FK to Questionnaire
  qgid: number;    // FK to QuestionnaireGroup

  user?: UsersInterface;                // optional object (ถ้ามี preload)
  questionnaire?: Questionnaire;
  questionnaireGroup?: QuestionnaireGroup;

  answers?: AssessmentAnswer[];
  transaction?: Transaction;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
