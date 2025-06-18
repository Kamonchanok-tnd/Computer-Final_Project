// ตรวจสอบให้แน่ใจว่า LoginRoutes ถูกต้อง
import { RouteObject } from "react-router-dom";
// import LoginPage from "../pages/LoginPage";  // สมมติว่ามีหน้า LoginPage
import SignInPages from "../pages/login/login";
import SignUpPages from "../pages/register/register";
const LoginRoutes = (): RouteObject[] => {
  return [
    {
      path: "/",
      element: <SignInPages  />,  // ต้องการให้หน้า Login แสดงเมื่อเส้นทางเป็น '/'
    },
    {
      path: "/signup",  // เส้นทางสำหรับหน้า สมัครสมาชิก
      element: <SignUpPages />,  // หน้า Signup
    },
  ];
};

export default LoginRoutes;
