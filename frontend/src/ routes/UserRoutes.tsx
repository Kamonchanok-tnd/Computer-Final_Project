import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import FullLayout from "../layout/FullLayout/ index";
import Loadable from "../components/third-patry/Loadable";
import { Navigate } from "react-router-dom";

const UserDashboard = Loadable(lazy(() => import("../pages/dashboard/userdashbord")));
const UserProfile = Loadable(lazy(() => import("../pages/dashboard/userprofile")));
const EditProfile = Loadable(lazy(() => import("../pages/users/edit_user/edituser")));


const UserRoutes =(isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/user",  // เส้นทางของ User
      element: isLoggedIn ? <FullLayout /> : <Navigate to="/" />, // Layout สำหรับ User
      children: [
        {
          index: true,  // เส้นทางหลักของ User
          element: <UserDashboard />, // หน้า Dashboard ของ User
        },
        {
          path: "/user/profile",
          element: <UserProfile />, // หน้าโปรไฟล์ของ User
        },
        {
          path: "/user/edit-profile",
          element: <EditProfile />, // หน้าโปรไฟล์ของ User
        },
      ],
    },
  ];
};

export default UserRoutes;
