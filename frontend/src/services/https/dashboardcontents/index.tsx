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


// Interface สำหรับ response ของ daily views
export interface DailyViewsByTitle {
  date: string;      // วัน
  title: string;     // ชื่อเรื่อง
  total_views: number; // จำนวนครั้งที่อ่าน
}

// ดึงข้อมูลการอ่านต่อวัน พร้อมชื่อเรื่อง
export const getDailyWordHealingViews = async (): Promise<DailyViewsByTitle[]> => {
  try {
    const res = await axios.get(`${apiUrl}/word-healing`, getAuthHeader());
    console.log("Raw data from API (WordHealing):", res.data);

    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching daily word healing views:", error);
    return [];
  }
};



// Interface สำหรับ Mirror
export interface DailyMirrorUsage {
  day: string;
  title: string; // Title ของวันแรก
  count: number; // จำนวนครั้ง (สำหรับ Mirror จะเป็น 1 ต่อวัน)
}

// ดึงข้อมูล Mirror ต่อวัน
export const getDailyMirrorUsage = async (): Promise<DailyMirrorUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/mirror`, getAuthHeader());
    console.log("Raw data from API (mirror):", res.data);

    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching daily mirror usage:", error);
    return [];
  }
};

export interface DailyVideoUsage {
  date: string;
  view_count: number;
}

// ASMR Usage
export const getDailyASMRUsage = async (): Promise<DailyVideoUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/asmr`, getAuthHeader());
    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (err) {
    console.error("Error fetching ASMR usage:", err);
    return [];
  }
};

// Breathing Usage
export const getDailyBreathingUsage = async (): Promise<DailyVideoUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/breathing`, getAuthHeader());
    
    // ดึง array จาก key "results"
    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (err) {
    console.error("Error fetching Breathing usage:", err);
    return [];
  }
};


export interface TopContent {
  name: string;
  category: string;
  unique_users: number;
}


export const getTopContentComparison = async (): Promise<TopContent[]> => {
  try {
    const res = await axios.get(`${apiUrl}/summarycontents`, getAuthHeader());
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    return [];
  } catch (err) {
    console.error("Error fetching top content comparison:", err);
    return [];
  }
};
