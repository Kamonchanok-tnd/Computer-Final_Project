// interfaces/IWordHealingContent.ts
export interface WordHealingContent {
  name: string;
  author: string;
  photo?: string;
  no_of_like: number;
  date: string; // ใช้ string ในรูปแบบ YYYY-MM-DD สำหรับ input type="date"
}