import { IFeedback } from "./IFeedback";
import { IFeedbackQuestion } from "./IFeedbackQuestion";

export interface IFeedbackAnswer {
  ID: number;
  feedback_id: number;   // link -> Feedback.ID
  question_id: number;   // link -> FeedbackQuestion.ID

  rating?: number | null; // เมื่อ type = "rating"
  text?: string | null;   // เมื่อ type = "text"

  // relations (optional preload):
  Feedback?: IFeedback | null;
  Question?: IFeedbackQuestion | null;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}
