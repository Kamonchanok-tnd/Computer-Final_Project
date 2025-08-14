import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// ฟังก์ชันในการดึงข้อมูลเสียงประเภทสมาธิ
export const getMeditationSounds = async (uid: number) => {
    try {
        const response = await axios.get(`${apiUrl}/sounds/meditation?uid=${uid}`, {
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

// ฟังก์ชันในการเพิ่มข้อมูลวิดีโอใหม่
export const createVideo = async (values: any) => {
  try {
    const response = await axios.post(`${apiUrl}/videos`, values, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // ถ้ามีการใช้ token
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มวิดีโอ:', error);
    throw error;
  }
};

// ฟังก์ชันในการดึงประเภทเสียงทั้งหมด
export const getSoundTypes = async () => {
  try {
    const response = await axios.get(`${apiUrl}/sound-types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data; // คาดว่า response จะเป็น array ของ SendType
  } catch (error) {
    console.error('Error fetching sound types:', error);
    throw error;
  }
};
