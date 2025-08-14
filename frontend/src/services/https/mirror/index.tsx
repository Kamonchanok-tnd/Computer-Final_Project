import api from '../../../interceptors/axios';
import { IMirror } from '../../../interfaces/IMirror';

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
