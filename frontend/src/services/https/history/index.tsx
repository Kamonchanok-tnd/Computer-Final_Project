import { IHistory } from "../../../interfaces/IHistory";
import { apiUrl } from "../Chat";

const Authorization = localStorage.getItem("token");
export async function CreateHistory(data:IHistory) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${Authorization}`);
  
    const raw = JSON.stringify(data);
  
    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };
  
    try {
      const response = await fetch(`${apiUrl}/History`, requestOptions);
  
      // ตรวจสอบว่า status เป็น 2xx หรือไม่
      if (!response.ok) {
        const errorData = await response.json();
        // โยน error เพื่อให้ไปเข้า catch ที่เรียกใช้งาน CreateReview
        throw new Error(errorData.error || "เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์");
      }
  
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("CreateHistory error:", error);
      // โยน error กลับไปให้ฟังก์ชันผู้เรียก handle เอง
      throw new Error(error.message || "ไม่สามารถเพิ่มประวัติได้");
    }
  }