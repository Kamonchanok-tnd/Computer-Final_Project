import { UsersInterface } from "../../../interfaces/IUser";
import { SignInInterface } from "../../../interfaces/SignIn";
import axios from "axios";
//import AxiosRequest from "./axiosInstance";
const apiUrl = import.meta.env.VITE_API_URL;
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");
const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};
async function SignIn(data: SignInInterface) {
  try {
    const res = await axios.post(`${apiUrl}/signin`, data, requestOptions);
    return res;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    return { status: 500, data: { message: "Network Error" } };
  }
}

async function GetGender() {
  return await axios
    .get(`${apiUrl}/genders`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetUsers() {
  return await axios
    .get(`${apiUrl}/users`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
const GetUsersById = async (id: string) => {
  const token = localStorage.getItem("token");  // ดึง token จาก localStorage
  //console.log("Token:", token); // เพิ่ม log เพื่อตรวจสอบว่า token มาไหม

  if (!token) {
    console.error("Token not found");
    return null; // ถ้าไม่มี token ให้หยุดการทำงาน
  }

  const requestOptions = {
    headers: {
      "Authorization": `Bearer ${token}`,  // เพิ่ม Authorization header ด้วย token
    },
  };

  try {
    const response = await axios.get(`${apiUrl}/user/${id}`, requestOptions); // URL ที่เหมาะสม
    return response;  // ส่งผลลัพธ์เมื่อได้รับข้อมูล
  } catch (error: any) {
    console.error("Error fetching user:", error); // เพิ่ม log สำหรับการแสดง error
    return error.response;  // คืนค่าเมื่อเกิดข้อผิดพลาด
  }
};




async function UpdateUsersById(id: string, data: UsersInterface) {
  const token = localStorage.getItem("token");  // ดึง token จาก localStorage
  if (!token) {
    console.error("Token not found");
    return null; // ถ้าไม่มี token ให้หยุดการทำงาน
  }

  const requestOptions = {
    headers: {
      "Authorization": `Bearer ${token}`,  // เพิ่ม Authorization header ด้วย token
    },
  };

  try {
    const response = await axios.put(`${apiUrl}/user/${id}`, data, requestOptions); // URL ที่เหมาะสม
    return response;  // ส่งผลลัพธ์เมื่อได้รับการตอบกลับ
  } catch (error: any) {
    console.error("Error updating user:", error);  // เพิ่ม log สำหรับการแสดง error
    return error.response;  // คืนค่าเมื่อเกิดข้อผิดพลาด
  }
}

async function DeleteUsersById(id: string) {
  return await axios
    .delete(`${apiUrl}/user/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function CreateUser(data: UsersInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
// ฟังก์ชันขอรีเซ็ตรหัสผ่าน
async function RequestPasswordReset(email: string) {
  return await axios
    .post(`${apiUrl}/forgot-password`, { email }, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ฟังก์ชันรีเซ็ตรหัสผ่าน
async function ResetPassword(token: string, newPassword: string) {
  return await axios
    .post(`${apiUrl}/reset-password`, { token, newPassword }, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


export {
  SignIn,
  GetGender,
  GetUsers,
  GetUsersById,
  UpdateUsersById,
  DeleteUsersById,
  CreateUser,
  RequestPasswordReset,
  ResetPassword,
};