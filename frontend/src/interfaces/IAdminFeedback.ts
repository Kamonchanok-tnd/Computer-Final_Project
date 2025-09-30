// Overview (ภาพรวมรายข้อในช่วงเดือน)
export type QuestionType = "rating" | "text" | "choice_single" | "choice_multi";

export interface IOptionStat {
  id: number;
  label: string;
  count: number;
  pct?: number; // backend ส่งมา (0–100); ถ้าไม่มี เราจะคำนวณ fallback ฝั่ง UI
}

export interface IQuestionOverview {
  id: number;
  key: string;
  label: string;
  type: QuestionType;
  responses: number;
  avg_rating?: number | null; // เฉพาะ rating (อาจ null)
  options?: IOptionStat[];    // เฉพาะ choice_*
  samples?: string[];         // เฉพาะ text
}

export interface IKPIs {
  total_submissions: number;
  respondents: number;
  overall_rating?: number | null; // อาจ null ถ้ายังไม่ตั้ง OVERALL_RATING_KEY/ไม่พบคำถามคีย์
  avg_rating_all?: number | null; // ข้อมูลประกอบ
  text_feedback_count: number;
}

export interface IAdminOverviewResponse {
  period: string;        // YYYY-MM
  kpis: IKPIs;           // ⬅ ต้องมีให้ตรงกับ backend
  questions: IQuestionOverview[];
}

// ===== รายคน
export interface IUserAnswer {
  question_id: number;
  type: QuestionType;
  label: string;
  rating?: number | null;
  text?: string | null;

  // single-choice
  option_id?: number;
  option_label?: string | null;

  // multi-choice
  option_ids?: number[];
  option_labels?: string[];
}

export interface IUserSubmission {
  submission_id: number;
  period_key?: string | null; // YYYY-MM
  submitted_at?: string;      // ISO datetime
  source?: string | null;
  answers: IUserAnswer[];
}

export interface IUserReportResponse {
  uid: string;                // backend ส่ง string → แก้เป็น string
  from_period?: string;
  to_period?: string;
  submissions: IUserSubmission[];
}
