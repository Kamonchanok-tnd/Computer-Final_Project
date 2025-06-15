export interface UsersInterface {
  Username: string;      // ชื่อผู้ใช้งาน
  Password: string;      // รหัสผ่าน
  Email: string;         // อีเมล์
  Facebook?: string;     // Facebook (optional)
  Line?: string;         // Line (optional)
  PhoneNumber?: string;  // หมายเลขโทรศัพท์ (optional)
  Role: string;          // บทบาทของผู้ใช้
  Age: number;           // อายุ
  Gender: string;        // เพศ
}