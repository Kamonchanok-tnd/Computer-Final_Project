import api from '../../../interceptors/axios';
import { IPrompt } from '../../../interfaces/IPrompt';

export const createPrompt = async (prompt: Omit<IPrompt, 'id'>): Promise<IPrompt> => {
  const response = await api.post<IPrompt>('/admin/prompt', prompt);
  return response.data;
};

export const updatePrompt = async (id: number, prompt: Omit<IPrompt, 'id'>): Promise<IPrompt> => {
  const response = await api.put<IPrompt>(`/admin/prompt/${id}`, prompt);
  return response.data;
};

export const deletePrompt = async (id: number): Promise<void> => {
  await api.delete(`/admin/prompt/${id}`);
};

export const getPrompts = async (): Promise<IPrompt[]> => {
  const response = await api.get<IPrompt[]>('/admin/prompt');
  return response.data;
};

export const getPromptByID = async (id: number): Promise<IPrompt> => {
  const response = await api.get<IPrompt>(`/admin/prompt/${id}`);
  return response.data;
};

export const nowPrompt = async (id: number): Promise<void> => {
  await api.post(`/admin/prompt/use/${id}`);
};
