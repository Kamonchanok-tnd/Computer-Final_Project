import { useRoutes, RouteObject } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";  // เส้นทางสำหรับ Admin
import UserRoutes from "./UserRoutes";    // เส้นทางสำหรับ User
import LoginRoutes from "./LoginRoutes";  // เส้นทางสำหรับ Login

function ConfigRoutes() {
  // ลบข้อมูลจาก localStorage
  // localStorage.removeItem("isLogin");
  // localStorage.removeItem("role");

  const isLoggedIn = localStorage.getItem("isLogin") === "true";  // ตรวจสอบสถานะการล็อกอิน
  const role = localStorage.getItem("role");  // ตรวจสอบบทบาทของผู้ใช้ (admin, user)

  console.log("isLoggedIn:", isLoggedIn);  // ตรวจสอบว่า isLoggedIn เป็น true หรือ false
  console.log("role:", role);  // ตรวจสอบว่า role เป็น admin หรือ user
  
  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    if (role === "admin") {
      routes = AdminRoutes(isLoggedIn);  // เส้นทางสำหรับ Admin
    } else if (role === "user") {
      routes = UserRoutes(isLoggedIn);  // เส้นทางสำหรับ User
    } else {
      console.error("Role is undefined or incorrect.");
    }
  } else {
    routes = LoginRoutes();  // หากไม่ได้ล็อกอิน ให้ไปที่หน้า Login
  }

  console.log("Routes:", routes);  // ตรวจสอบค่าของ routes
  return useRoutes(routes);  // ใช้เส้นทางที่กำหนดให้กับ useRoutes
}

export default ConfigRoutes;
