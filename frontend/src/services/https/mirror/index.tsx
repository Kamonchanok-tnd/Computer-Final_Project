import api from '../../../interceptors/axios';
import { IMirror } from '../../../interfaces/IMirror';
import { IMonthlySummary } from '../../../interfaces/IMonthlySummary';

export const createMirror = async (mirror: IMirror): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/mirror', mirror);
  return response.data;
};

export const getMirrorByDate = async (date: string): Promise<IMirror> => {
  const response = await api.get<IMirror>(`/mirror/${date}`);
  
  return response.data;
};

export const updateMirrorById = async (id: number, data: IMirror): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(`/mirror/${id}`, data);
  return response.data;
};

export const deleteMirrorById = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/mirror/${id}`);
  return response.data;
};

export async function getMirrorSummary(month: string) {
  // month รูปแบบ YYYY-MM เช่น "2025-08"
  const res = await api.get<IMonthlySummary[]>("/mirror/summary", { params: { month } });
  return res.data;
}