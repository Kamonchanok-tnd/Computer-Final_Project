import { message } from "antd";

const apiUrl = "http://localhost:8000";

// ฟังก์ชันสำหรับการเพิ่ม headers สำหรับการตรวจสอบสิทธิ์
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem('Authorization')}`, // ใช้ Authorization จาก localStorage หรืออื่น ๆ
  };
}

// Define the interface for the payload parameter
interface ValidatePayload {
  token: string;
}

// ฟังก์ชันตรวจสอบรหัสยืนยัน
async function validateApi(payload: ValidatePayload) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(`${apiUrl}/validate-reset-token`, requestOptions);
    const data = await response.json();
    // console.log("Backend response:", data);

    // ถ้าสถานะเป็น 200, รหัสยืนยันถูกต้อง
    if (response.status === 200) {
      message.success(data.message);
      return { status: response.status, data }; // คืนค่าข้อมูล
    } else {
      message.error(data.error || "รหัสยืนยันไม่ถูกต้องหรือหมดอายุ");
      return { status: response.status, data };
    }
  } catch (error) {
    console.error("Error validating:", error);
    message.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน");
    return { status: null, data: null };
  }
}

// ฟังก์ชันสำหรับการจัดการกับการตั้งรหัสผ่านใหม่
async function resetPassword(id: number, newPassword: string, token: string) {
  const requestOptions = {
    method: "PATCH",
    headers: getAuthHeaders(), // ฟังก์ชันสำหรับการเพิ่ม headers สำหรับการตรวจสอบสิทธิ์
    body: JSON.stringify({
      id: id, // ID ของ Employee
      new_password: newPassword, // รหัสผ่านใหม่
      token: token, // รหัสยืนยัน (ที่ใช้ในการรีเซ็ตรหัสผ่าน)
    }),
  };

  try {
    // ส่งคำขอไปยัง API
    const response = await fetch(`${apiUrl}/update-password`, requestOptions); // ปรับ URL ให้ตรงกับ backend
    
    // เช็คว่า response status เป็น 2xx หรือไม่
    if (!response.ok) {
      const errorData = await response.json();
      // แสดงข้อความผิดพลาดถ้า status ไม่ใช่ 2xx
      message.error(errorData.error || "เกิดข้อผิดพลาดในการตั้งรหัสผ่าน");
      return { status: response.status, data: errorData };
    }

    const data = await response.json(); // อ่าน JSON ของ response
    message.success(data.message || "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว"); // แสดงข้อความจาก response
    return { status: response.status, data }; // รวม status และ data

  } catch (error) {
    console.error("Error resetting password:", error);
    message.error("เกิดข้อผิดพลาดในการตั้งรหัสผ่าน");
    return { status: null, data: null }; // กรณีเกิดข้อผิดพลาด
  }
}


// ส่งออกฟังก์ชัน validateApi และ resetPassword
export { validateApi, resetPassword };
