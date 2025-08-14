// src/services/https/emotion.ts
import api from '../../../interceptors/axios';
import { IEmotion } from '../../../interfaces/IEmotion';

// ดึงรายการอารมณ์ทั้งหมด (emoji จากฐานข้อมูล)
export const getEmotions = async (): Promise<IEmotion[]> => {
  const response = await api.get<IEmotion[]>('/emotions');
  return response.data;
};

// ดึงอารมณ์ตาม ID
export const getEmotionByID = async (id: number): Promise<IEmotion> => {
  const response = await api.get<IEmotion>(`/emotions/${id}`);
  return response.data;
};
