import axios from "axios";
import { Question } from '../../../interfaces/IQuestion';
import { AnswerOption } from '../../../interfaces/IAnswerOption';

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
