import { useEffect, useState } from 'react';
import axios from 'axios';
import { IPrompt } from '../../interfaces/IPrompt';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export default function PromptList() {
  const [prompts, setPrompts] = useState<IPrompt[]>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/getprompt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrompts(res.data);
    } catch (error) {
      console.error("❌ Error fetching prompts:", error);
    }
  };

  const setAsActive = async (id: number) => {
    try {
      await axios.post(`${API_URL}/prompt/${id}/use`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(); // รีโหลดรายการใหม่หลังอัปเดต
    } catch (error) {
      console.error("❌ Error setting active prompt:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-2">📝 รายการ Prompt ที่มี</h2>
      <ul className="space-y-2">
        {prompts.map((p) => (
          <li
            key={p.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold line-clamp-1">
                📌 {p.objective || 'ไม่มีหัวข้อ'}
              </p>
              <p className="text-sm text-gray-600">
                Persona: {p.persona || 'ไม่ระบุ'}
              </p>
            </div>
            <div>
              {p.is_using ? (
                <span className="text-green-600 font-bold">✅ กำลังใช้งาน</span>
              ) : (
                <button
                  onClick={() => {
                    if (p.id !== undefined) setAsActive(p.id);
                  }}
                  className="text-blue-600 underline"
                >
                  ใช้ Prompt นี้
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
