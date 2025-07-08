import axios from 'axios';
import { message } from 'antd';
import { errorCodeMap } from '../utils/errorCodeMap';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const error = err?.response?.data?.error;
    const code = err?.response?.data?.code;

    const action = errorCodeMap[code];

    if (action) {
      action(); // เช่น logout, redirect, show message
    } else {
      message.error(error || 'เกิดข้อผิดพลาด');
    }

    return Promise.reject(err);
  }
);

export default api;
