// แบบประเมิน “ชุดเดียว” (Admin form)

export interface RatingItem {
  label: string;
  sort: number;
}

export interface FinalComment {
  enabled: boolean;
  label: string;
}

export interface FeedbackFormResponse {
  ratings: RatingItem[];
  final_comment?: FinalComment; // ไม่มี -> ไม่เปิดช่องคอมเมนต์
}

export interface SaveFormPayload {
  ratings: RatingItem[];
  final_comment?: FinalComment;
}

export interface MessageOnly {
  message: string;
}
