import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;


// ฟังก์ชันในการดึงข้อมูลเสียงประเภทฝึกหายใจ
export const getBreathingSounds = async () => {
  try {
    const response = await axios.get(`${apiUrl}/sounds/breathing`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data; // ส่งข้อมูลเสียงกลับไปให้ UI
  } catch (error) {
    console.error("Error fetching breathing sounds:", error);
    throw error;
  }
};