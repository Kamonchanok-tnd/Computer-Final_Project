// Question types supported by backend
export type QuestionType = "rating" | "text" | "choice_single" | "choice_multi";

// ---- GET /admin/feedback-form response ----
export interface IFeedbackOption {
  id: number;        // <— เพิ่ม
  label: string;
  sort: number;
}

export interface IFeedbackQuestion {
  id: number;        // <— เพิ่ม
  label: string;
  type: QuestionType;
  sort: number;
  options?: IFeedbackOption[]; // only for choice_*
}

export interface FeedbackFormResponse {
  questions: IFeedbackQuestion[];
}

// ---- PUT /admin/feedback-form payload ----
export interface SaveOptionPayload {
  label: string;
  sort?: number;
}

export interface SaveQuestionPayload {
  label: string;
  type: QuestionType;
  sort?: number;
  options?: SaveOptionPayload[]; // only for choice_*
}

export interface SaveFormPayload {
  questions: SaveQuestionPayload[];
}

// ---- common ----
export interface MessageOnly {
  message: string;
}
