import axios from 'axios'
import { IPrompt } from '../../../interfaces/IPrompt'

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

console.log("API_URL:", API_URL)
console.log

export const createPrompt = async (prompt: Omit<IPrompt, 'id'>): Promise<IPrompt> => {
  const response = await axios.post<IPrompt>(`${API_URL}/admin/prompt`,prompt,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
}

export const getPrompts = async (): Promise<IPrompt[]> => {
  const response = await axios.get<IPrompt[]>(`${API_URL}/admin/getprompt`,
     {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};


export const deletePrompt = async (id: number): Promise<void> => {
}

export const updatePrompt = async (id: number, prompt: Partial<IPrompt>): Promise<IPrompt> => {
  const response = await axios.put<IPrompt>(`${API_URL}/${id}`, prompt)
  return response.data
}
