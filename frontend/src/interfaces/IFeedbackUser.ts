// แบบฟอร์มที่ผู้ใช้ส่งเข้ามา
export interface AnswerSubmit {
  question_id: number;
  rating?: number;
  text?: string;
  option_id?: number;
  option_ids?: number[];
}

export interface SubmitFeedbackPayload {
  uid: number;          // user id ที่ล็อกอินอยู่
  period_key?: string;  // YYYY-MM (ถ้าไม่ส่ง backend จะกำหนดให้เอง)
  answers: AnswerSubmit[];
}
