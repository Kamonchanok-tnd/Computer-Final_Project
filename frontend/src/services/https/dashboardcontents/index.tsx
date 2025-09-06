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
export const getDailyMeditationUsage = async (): Promise<DailySoundUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/sounds/daily-usage`, getAuthHeader());
    console.log("Raw data from API (service):", res.data);

    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching daily sound usage:", error);
    return [];
  }
};


export const getDailyChantingUsage = async (): Promise<DailySoundUsage[]> => {
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
export interface MonthlyViewsByTitle {
  year: number;
  month: number;         // 1-12
  title: string;
  total_views: number;
  monthLabel?: string;   // สำหรับแสดงบน chart เช่น "ส.ค. 2025"
  date?: string;
}

// ดึงข้อมูลการอ่านต่อเดือน พร้อมชื่อเรื่อง
export const getMonthlyWordHealingViews = async (): Promise<MonthlyViewsByTitle[]> => {
  try {
    const res = await axios.get(`${apiUrl}/word-healing`, getAuthHeader());
    console.log("Raw data from API (WordHealing monthly):", res.data);

    const results: MonthlyViewsByTitle[] = Array.isArray(res.data.results) ? res.data.results : [];

    // สร้าง monthLabel สำหรับแสดงบน chart
    results.forEach((item) => {
      item.monthLabel = new Date(item.year, item.month - 1).toLocaleString("th-TH", {
        month: "short",
        year: "numeric",
      });
    });

    return results;
  } catch (error) {
    console.error("Error fetching monthly word healing views:", error);
    return [];
  }
};



// Interface สำหรับ Mirror
// Interface สำหรับ response รายเดือน
export interface MonthlyMirrorUsage {
  year: number;
  month: number;
  title: string; // Title ของวันแรกของเดือน
  count: number; // จำนวนครั้งในเดือนนั้น
  
}

// ฟังก์ชันเรียก API /mirror/monthly
export const getMonthlyMirrorUsage = async (): Promise<MonthlyMirrorUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/mirror`, getAuthHeader());
    console.log("Raw data from API (mirror monthly):", res.data);

    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching monthly mirror usage:", error);
    return [];
  }
};


export interface DailyVideoUsage {
  date: string;
  view_count: number;
  sound_name ?: string
  play_count ?: number
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


export interface DailySoundUsage {
  year: number;        // ปี
  month: number;       // เดือน
  category: string;    // สมาธิ, สวดมนต์, ฝึกหายใจ, asmr
  play_count: number;  // จำนวนครั้งเล่น
}

export const getSoundFourType = async (): Promise<DailySoundUsage[]> => {
  try {
    const res = await axios.get(`${apiUrl}/sound/four-type`, getAuthHeader());
    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (err) {
    console.error("Error fetching four-type sound usage:", err);
    return [];
  }
};


// dashboard questionaire
export interface QuestionaireOverview {
  total_questionnaires: number;
  total_assessments: number;
  total_users: number;
  
}
export const GetQuestionaireOverview = async (): Promise<QuestionaireOverview | null> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionaire/overview`, getAuthHeader());
   
    return res.data.results || null;
  } catch (err) {
    console.error("Error fetching questionaire:", err);
    return null; 
  }
};

export interface Stats {
  name_questionnaire: string;
  total_taken: number;
}

export async function fetchQuestionnaireStats(): Promise<Stats[]> {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionaire/stats`, getAuthHeader());
    return Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch (error) {
    console.error("Failed to fetch questionnaire stats:", error);
    return [];
  }
}

export interface SurveyVisualizationData {
  name_questionnaire: string;
  result_level: string;
  total_count: number;
  total_taken: number;
}

export const getSurveyVisualization = async (
  withResults: boolean = true
): Promise<SurveyVisualizationData[]> => {
  try {
    const url = withResults
      ? `${apiUrl}/dashboard/questionaire/resultsoverview`
      : `${apiUrl}/dashboard/questionaire/stats`; // stats แค่ total_taken

    const response = await axios.get(url, getAuthHeader());
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch survey visualization:", error);
    return [];
  }
};


export const getSurveyVisualizationById = async (
  questionnaireId: number
): Promise<SurveyVisualizationData[]> => {
  try {
    const response = await axios.get(
      `${apiUrl}/dashboard/questionaire/resultsoverview/${questionnaireId}`,
      getAuthHeader()
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Failed to fetch survey visualization for ID ${questionnaireId}:`, error);
    return [];
  }
};

export interface AverageScoreData {
  questionnaireId: number;
  questionnaireName: string;
  averageScore: number;
  totalTaken: number;
  maxScore: number;           // เพิ่ม
  minScore: number;           // เพิ่ม
  trend: { date: string; avgScore: number }[]; // เพิ่ม สำหรับ sparkline chart
}

export const getAverageScore = async (questionnaireId: number): Promise<AverageScoreData> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionnaire/${questionnaireId}/average-score`, getAuthHeader());
    return res.data; // ตรงนี้ต้องตรงกับ AverageScoreData
  } catch (err: any) {
    console.error("โหลดคะแนนเฉลี่ยล้มเหลว:", err);
    throw new Error(err.message || "ไม่สามารถโหลดคะแนนเฉลี่ยได้");
  }
};
