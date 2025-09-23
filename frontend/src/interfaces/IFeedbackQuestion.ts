export type FeedbackQuestionType = "rating" | "text";

export interface IFeedbackQuestion {
  ID: number;
  key: string;          // เช่น "overall", "suggestion", "ux_ease"
  label: string;        // ข้อความโชว์
  type: FeedbackQuestionType;
  is_active: boolean;
  sort: number;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}
