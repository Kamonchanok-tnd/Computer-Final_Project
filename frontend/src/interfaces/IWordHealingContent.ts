// interfaces/IWordHealingContent.ts
export interface WordHealingContent {
  error: (message: string) => void;  // ฟังก์ชันรับข้อความ error
  id: number;                   // ID ของบทความ
  name: string;                 // ชื่อบทความ
  author: string;               // ผู้เขียน
  content: string;              // เนื้อหาของบทความเป็น string
  articleType: string;          // ประเภทของบทความ (เช่น Opinion piece, Analysis piece)
  no_of_like: number;           // จำนวนการกดถูกใจ
  date: string;                 // วันที่เผยแพร่
  photo: string;                // URL ของภาพประกอบ
}

