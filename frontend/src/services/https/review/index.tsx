import { IReview } from "../../../interfaces/IReview";
import { apiUrl } from "../Chat";
const Authorization = localStorage.getItem("token");
export async function CreateReview(data: IReview) {
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
      const response = await fetch(`${apiUrl}/ReviewSound`, requestOptions);
  
      // ตรวจสอบว่า status เป็น 2xx หรือไม่
      if (!response.ok) {
        const errorData = await response.json();
        // โยน error เพื่อให้ไปเข้า catch ที่เรียกใช้งาน CreateReview
        throw new Error(errorData.error || "เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์");
      }
  
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("CreateReview error:", error);
      // โยน error กลับไปให้ฟังก์ชันผู้เรียก handle เอง
      throw new Error(error.message || "ไม่สามารถส่งรีวิวได้");
    }
  }

  export async function UpdateReview(data: IReview) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${Authorization}`);
  
    const raw = JSON.stringify(data);
  
    const requestOptions: RequestInit = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
    };
  
    try {
      const response = await fetch(`${apiUrl}/UpdateReviewSound`, requestOptions);
  
      // ตรวจสอบว่า status เป็น 2xx หรือไม่
      if (!response.ok) {
        const errorData = await response.json();
        // โยน error เพื่อให้ไปเข้า catch ที่เรียกใช้งาน CreateReview
        throw new Error(errorData.error || "เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์");
      }
  
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("CreateReview error:", error);
      // โยน error กลับไปให้ฟังก์ชันผู้เรียก handle เอง
      throw new Error(error.message || "ไม่สามารถส่งรีวิวได้");
    }
  }

  export async function CheckReview(uid: number, sid: number) {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Authorization}`,
      },
    };
  
    try {
      const response = await fetch(`${apiUrl}/ReviewSound/${uid}/${sid}`, requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  }