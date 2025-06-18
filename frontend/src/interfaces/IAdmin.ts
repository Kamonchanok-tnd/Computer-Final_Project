export interface AdminInterface {
  ID: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  age: number;
  gender: string;
}



export interface AdminResponse {
  status: string;
  message: string;
  data: AdminInterface; // ห่อหุ้มข้อมูลผู้ใช้ใน data
}
