export interface Transaction {
  id: number;
  arid: number;
  description: string;
  totalScore: number;
  createdAt: string;
}

// src/interfaces/ITransaction.ts
export interface ITransaction {
  ID: number;                         // 👈 แก้จาก id → ID
  arid?: number;                      // AssessmentResult ID
  total_score: number;
  max_score: number;
  description: string;
  result: string;
  result_level: "happy" | "bored" | "sad" | string;
  test_type: "positive" | "negative" | string;
  questionnaire_group?: string;
  CreatedAt: string;                 // 👈 ISO string เช่น "2025-08-25T20:56:56.39959+07:00"
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

