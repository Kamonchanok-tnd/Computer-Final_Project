import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import MinimalLayout from "../layout/MinimalLayout";
import SignInPages from "../pages/login/login";
import Loadable from "../components/third-patry/Loadable";

const  Login = Loadable(lazy(() => import("../pages/login/login")));

const LoginRoutes = (): RouteObject[] => {
  return [
    {
      path: "/", // ใช้ path "/" เพื่อให้เป็นหน้าเริ่มต้น
      element: <MinimalLayout />, // Layout สำหรับ Login
      children: [
        {
          path: "/", // Login page path
          element: <Login />, // หน้า Login
        },
      ],
    },
  ];
};

export default LoginRoutes;
