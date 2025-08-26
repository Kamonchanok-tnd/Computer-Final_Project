import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export interface ActivityPayload {
  uid: number;       // user id
  action: string;    // เช่น "login", "visit_page"
  page: string;      // เช่น "/home"
}

// ฟังก์ชันสำหรับบันทึกกิจกรรม
export async function logActivity(payload: ActivityPayload) {
  try {
    const response = await axios.post(`${apiUrl}/activity`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // ถ้ามี JWT
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to log activity:", error.response?.data || error.message);
    throw error;
  }
}

/* ===== Admin Dashboard API ===== */
export interface VisitFrequency {
  date: string;
  visits: number;
}

export interface RetentionRate {
  date: string;
  retentionRate: number; // %
}

// ดึงข้อมูล visit frequency
export async function getVisitFrequency(): Promise<VisitFrequency[]> {
  try {
    const { data } = await axios.get(`${apiUrl}/visit-frequency`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  } catch (error: any) {
    console.error("❌ Failed to fetch visit frequency:", error.response?.data || error.message);
    throw error;
  }
}

// ดึงข้อมูล retention rate
export async function getRetentionRate(): Promise<RetentionRate[]> {
  try {
    const { data } = await axios.get(`${apiUrl}/retention-rate`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  } catch (error: any) {
    console.error("❌ Failed to fetch retention rate:", error.response?.data || error.message);
    throw error;
  }
}
