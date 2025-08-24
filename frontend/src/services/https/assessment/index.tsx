import axios from "axios";
import { Question } from '../../../interfaces/IQuestion';
import { AnswerOption } from '../../../interfaces/IAnswerOption';
import { QuestionnaireGroup } from '../../../interfaces/IQuestionnaireGroup';
import { AssessmentAnswer } from '../../../interfaces/IAssessmentAnswer';

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

export const submitAnswer = async (
  answer: AssessmentAnswer
): Promise<void> => {
  await axiosInstance.post("/assessment/answer", {
    arid: answer.arid,
    qid: answer.qid,
    aoid: answer.answerOptionID,
    point: answer.point,
    question_number: answer.question_number, // ✅ ต้องใช้แบบนี้
  });
};


// ✅ ฟังก์ชันใหม่: สรุปผล
// services/https/assessment/index.ts
export const finishAssessment = async (ARID: number): Promise<any> => {
  const res = await axiosInstance.post(`/assessment/finish/${ARID}`);
  return res.data.transaction; // ✅ ส่งกลับเฉพาะ transaction
};


export const createAssessmentResult = async (
  quID: number,
  uid: number,
  qgID?: number
): Promise<number> => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const payload: any = { QuID: quID, UID: uid, Date: today };
  if (typeof qgID === "number") payload.QGID = qgID;

  const res = await axiosInstance.post("/assessment/result", payload);

  // รองรับกรณี backend ส่ง { ID } หรือส่ง object เต็ม { ID, Date, ... }
  const id =
    res.data?.ID ?? res.data?.id ?? res.data?.Id ?? res.data?.data?.ID;
  if (!id) {
    // เผื่อ backend เปลี่ยนรูปแบบในอนาคต
    throw new Error("Cannot read created AssessmentResult ID from response");
  }
  return Number(id);
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

export const getTransactionByID = async (id: number): Promise<any> => {
  const res = await axiosInstance.get(`/assessment/Transaction/${id}`);
  return res.data;
};