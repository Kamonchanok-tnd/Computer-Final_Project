import { RouteObject } from "react-router-dom";
import FullLayout from "../layout/FullLayout/ index";
import { Navigate } from "react-router-dom";

import Loadable from "../components/third-patry/Loadable";
import { lazy } from "react";

const AdminDashboard = Loadable(lazy(() => import("../pages/dashboard/admindashboard")));
const AdminSettings = Loadable(lazy(() => import("../pages/dashboard/adminsetting")));
const CreateAdmin = Loadable(lazy(() => import("../pages/create_admin/createadmin")));

const AdminRoutes = (isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/admin",  // เส้นทางของ Admin
      element: isLoggedIn ? <FullLayout /> : <Navigate to="/" />,  // ใช้ FullLayout ถ้าเป็นผู้ใช้ที่ล็อกอิน
      children: [
        {
          index: true,
          element: <AdminDashboard />, // หน้า Dashboard ของ Admin
        },
        {
          path: "/admin/settings",
          element: <AdminSettings />, // หน้า Settings ของ Admin
        },
        {
          path: "/admin/create",
          element: <CreateAdmin />, // หน้า Settings ของ Admin
        },
      ],
    },
  ];
};

export default AdminRoutes;
