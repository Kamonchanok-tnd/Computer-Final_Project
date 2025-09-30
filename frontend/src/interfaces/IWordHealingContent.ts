// interfaces/IWordHealingContent.ts
export interface WordHealingContent {
  error: (message: string) => void;
  id: number;
  name: string;
  author: string;
  content: string;
  article_type_id?: number | null;  // article_type_id (number)
  no_of_like: number;
  date: string;              // YYYY-MM-DD
  photo: string;             // base64 หรือ URL
  viewCount: number;
}
