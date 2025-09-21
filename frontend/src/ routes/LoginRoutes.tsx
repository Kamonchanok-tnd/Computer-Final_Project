// ตรวจสอบให้แน่ใจว่า LoginRoutes ถูกต้อง
import { RouteObject } from "react-router-dom";
// import LoginPage from "../pages/LoginPage";  // สมมติว่ามีหน้า LoginPage
import SignInPages from "../pages/authen/login/login";
import SignUpPages from "../pages/users/register/register";
import ForgotPasswordPage from "../pages/authen/resetpassword/resetpassword";
// import ValidateUuidPage from "../pages/authen/resetpassword/validateUuid";
// import ResetPasswordPage from "../pages/authen/resetpassword/newpassword";
//import ConsentPopup from "../pages/authen/consent/ConsentPopup";
const LoginRoutes = (): RouteObject[] => {
  return [
    {
      path: "/",
      element: <SignInPages  />,  // ต้องการให้หน้า Login แสดงเมื่อเส้นทางเป็น '/'
    },
    // {
    //   path: "/consent",  // เส้นทางสำหรับหน้า สมัครสมาชิก
    //   element: <ConsentPopup />,  // หน้า Signup
    // },
    {
      path: "/signup",  // เส้นทางสำหรับหน้า สมัครสมาชิก
      element: <SignUpPages />,  // หน้า Signup
    },
    {
      path: "/forgot-password",  // เส้นทางสำหรับหน้า สมัครสมาชิก
      element: <ForgotPasswordPage />,  // หน้า Signup 
    },
    // {
    //   path: "/reset-password",  // เส้นทางสำหรับหน้า สมัครสมาชิก
    //   element: <ValidateUuidPage />,  // หน้า Signup /reset-password
    // },
    // {
    //   path: "/update-password",  // เส้นทางสำหรับหน้า สมัครสมาชิก
    //   element: <ResetPasswordPage/>,  // หน้า Signup /reset-password
    // },
  ];
};

export default LoginRoutes;
