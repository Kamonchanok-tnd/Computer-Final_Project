import axios from "axios";

export const apiUrl = import.meta.env.VITE_API_URL; // แก้เป็น backend ของคุณ

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,

  },
  
});
(console.log(localStorage.getItem("token")))

export interface DailySoundUsage {
  date: string;
  play_count: number;
}


// ดึงข้อมูล daily usage พร้อม header
export const getDailySoundUsage = async (): Promise<DailySoundUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/sounds/daily-usage`, getAuthHeader());
    console.log("Raw data from API (service):", res.data);

    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching daily sound usage:", error);
    return [];
  }
};


export const getSoundChanting = async (): Promise<DailySoundUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/sounds/chanting`, getAuthHeader());
    console.log("Raw data from API (service):", res.data);

    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching daily sound usage:", error);
    return [];
  }
};

