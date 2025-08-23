export interface AssessmentAnswer {
  id?: number; // optional ถ้า backend เป็น auto-increment
  arid: number;
  qid: number;
  answerOptionID: number;
  point: number;
  question_number: number;
}
