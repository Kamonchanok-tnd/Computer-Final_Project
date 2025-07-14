import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// ฟังก์ชันในการดึงข้อมูลเสียงประเภทสมาธิ
export const getMeditationSounds = async () => {
    try {
        const response = await axios.get(`${apiUrl}/sounds/meditation`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`  // ถ้าคุณใช้ JWT token ในการยืนยันตัวตน
            }
        });
        return response.data;  // ส่งข้อมูลเสียงกลับไปให้ UI
    } catch (error) {
        console.error('Error fetching meditation sounds:', error);
        throw error;  // จะโยน error ไปให้ UI รับมือกับข้อผิดพลาด
    }
};
