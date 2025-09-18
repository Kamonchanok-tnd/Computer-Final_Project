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
export interface ViewsByTitle {
  date: string;
  title: string;
  total_views: number;
  month?: number;
  year?: number;
  label?: string;
}

export const getWordHealingViews = async (
  type: "daily" | "weekly" | "monthly" | "yearly"
): Promise<ViewsByTitle[]> => {
  try {
    const res = await axios.get(`${apiUrl}/word-healing?type=${type}`, getAuthHeader());
    return Array.isArray(res.data.results) ? res.data.results : [];
  } catch (error) {
    console.error("Error fetching word healing views:", error);
    return [];
  }
};



// Interface สำหรับ Mirror
// Interface สำหรับ response รายเดือน
export interface MonthlyMirrorUsage {
  year: number;
  month: number;
  day: number;  
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
  year: number;
  month: number;
  day: number;      // เพิ่ม
  category: string;
  play_count: number;
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

export const getAverageScore = async (
  questionnaireId: number,
  queryParams?: string // เช่น "gender=male&age_min=20&age_max=30"
): Promise<AverageScoreData> => {
  try {
    const url = queryParams
      ? `${apiUrl}/dashboard/questionnaire/${questionnaireId}/average-score?${queryParams}`
      : `${apiUrl}/dashboard/questionnaire/${questionnaireId}/average-score`;

    const res = await axios.get(url, getAuthHeader());
    return res.data; // ตรงนี้ต้องตรงกับ AverageScoreData
  } catch (err: any) {
    console.error("โหลดคะแนนเฉลี่ยล้มเหลว:", err);
    throw new Error(err.message || "ไม่สามารถโหลดคะแนนเฉลี่ยได้");
  }
};

export interface Respondent {
  id:number
  user_id: number;
  username: string;
  questionnaire_name: string;
  score: number;
  result: string;
  taken_at: string;
  q_type : string ;
}

export const getLatestRespondents = async (limit: number = 5): Promise<Respondent[]> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionnaire/recent/use?limit=${limit}`, getAuthHeader());
    return res.data;
  } catch (err: any) {
    console.error("Cannot fetch latest respondents:", err);
    throw new Error(err.message || "Cannot fetch latest respondents");
  }
};


interface Transaction {
  questionnaire_group: string;
  total_score: number;
  date: string;
  session_number?: number; // Pre/Post มี session_number
}

// เรียก Pre/Post

// start dashboard แบบรายคน
export interface UserSummary {
  id: number;
  username: string;
  avatar: string;
  gender: string;
  email: string;
}

export const GetUserassessment = async (): Promise<UserSummary[]> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionnaire/user`, getAuthHeader());
    return res.data;
  } catch (err: any) {
    console.error("Cannot fetch latest respondents:", err);
    throw new Error(err.message || "Cannot fetch latest respondents");
  }
}
export interface UserKPI {
  total_taken: number;
  completed: number;
  last_taken_date: string ; // จะได้แปลงเป็น Date ใน frontend
}
export const GetUserKPI = async (id: number): Promise<UserKPI> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionnaire/user/overiew/${id}`, getAuthHeader());
    return res.data;
  } catch (err: any) {
    console.error("Cannot fetch latest respondents:", err);
    throw new Error(err.message || "Cannot fetch latest respondents");
  }
}

export interface UserAssessmentSummary {
  questionnaire_name: string;
  count_taken: number;
}
export const GetCountTaken = async (id: number): Promise<UserAssessmentSummary[]> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionnaire/user/bar/${id}`, getAuthHeader());
    return res.data;
  } catch (err: any) {
    console.error("Cannot fetch latest respondents:", err);
    throw new Error(err.message || "Cannot fetch latest respondents");
  }
}

export interface QuestionnaireGroup {
  ID: number;
  Name: string; // เช่น "pre-test", "post-test"
  Description?: string;

}



export const getPrePostTransactionsCompare = async (uid: number, description: string): Promise<Transaction[]> => {
  try {
    const response = await axios.get<Transaction[]>(`${apiUrl}/dashboard/questionnaire/user/prepost`, {
      params: { uid, description },
      ...getAuthHeader(), // spread object headers เข้า config ของ axios
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pre/post transactions:", error);
    return [];
  }
};

export const getPersonalTransactions = async (uid: number, description: string): Promise<Transaction[]> => {
  try {
    const response = await axios.get<Transaction[]>(`${apiUrl}/dashboard/questionnaire/user/personal`, {
      params: { uid, description }, ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching standalone transactions:", error);
    return [];
  }
};

export interface IDetailquestionire {
  questionnaire_group: string;
  latest_score: number;
  previous_score?: number | null;
  latest_result: string;
  average_score: number;
}

export const GetDetailQuestionnaire = async (
  uid: number,
  description: string
): Promise<IDetailquestionire> => {
  try {
    const res = await axios.get(`${apiUrl}/dashboard/questionnaire/user/detail`, {
      params: { uid, description },...getAuthHeader() // ส่ง query params
    });
    return res.data;
  } catch (err: any) {
    console.error("Cannot fetch latest respondents:", err);
    throw new Error(err.message || "Cannot fetch latest respondents");
  }
};

// ฟังก์ชันสำหรับเรียก API เพื่อดาวน์โหลด Excel
export const downloadExcelFile = async (): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/excel`, {
      method: "GET",
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export.xlsx"; // ตั้งชื่อไฟล์
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};
