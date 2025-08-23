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
export const finishAssessment = async (ARID: number): Promise<void> => {
  await axiosInstance.post(`/assessment/finish/${ARID}`);
};

export const createAssessmentResult = async (quID: number, uid: number): Promise<number> => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const res = await axiosInstance.post("/assessment/result", {
    QuID: quID,
    UID: uid,
    Date: today,
  });
  return res.data.ID;
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
