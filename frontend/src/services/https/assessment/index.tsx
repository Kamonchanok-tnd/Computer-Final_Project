import axios from "axios";
import { Question } from '../../../interfaces/IQuestion';
import { AnswerOption } from '../../../interfaces/IAnswerOption';
import { QuestionnaireGroup } from '../../../interfaces/IQuestionnaireGroup';

// ✅ Inline axiosInstance พร้อมแนบ token
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // แก้เป็น env ก็ได้ถ้ามี .env.local
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchQuestions = async (): Promise<Question[]> => {
  const res = await axiosInstance.get("/assessment/Questions");
  return res.data;
};

export const fetchAnswerOptions = async (): Promise<AnswerOption[]> => {
  const res = await axiosInstance.get("/assessment/AnswerOptions");
  return res.data;
};

// ✅ ฟังก์ชันใหม่: ส่งคำตอบ
export const submitAnswer = async (
  ARID: number,
  QID: number,
  AOID: number,
  Point: number
): Promise<void> => {
  await axiosInstance.post("/assessment/answer", {
    ARID,
    QID,
    AOID,
    Point,
  });
};

// ✅ ฟังก์ชันใหม่: สรุปผล
export const finishAssessment = async (ARID: number): Promise<void> => {
  await axiosInstance.post(`/assessment/finish/${ARID}`);
};

// ✅ เพิ่มฟังก์ชันนี้
export const createAssessmentResult = async (quID: number): Promise<number> => {
  const res = await axiosInstance.post("/assessment/result", { QuID: quID });
  return res.data.ID; // สมมุติว่า backend ส่งกลับ ID ของ result
};

export const getAllQuestionnaireGroups = async (): Promise<QuestionnaireGroup[]> => {
  try {
    const res = await axiosInstance.get("/questionnaire-groups");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch questionnaire groups", error);
    return [];
  }
};
