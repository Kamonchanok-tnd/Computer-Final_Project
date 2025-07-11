import { RouteObject } from "react-router-dom";

import { Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Loadable from "../components/loading/Loadable";
import { lazy } from "react";
// import EditYourself from "../pages/admin/edit_yourself/edit";
const AdminDashboard = Loadable(lazy(() => import("../pages/admin/dashboard_admin/dashboard_admin")));
const AdminSettings = Loadable(lazy(() => import("../pages/dashboard/adminsetting")));
// const CreateAdmin = Loadable(lazy(() => import("../pages/admin/create_admin/createadmin")));
// const DashboardAdmin = Loadable(lazy(() => import("../pages/admin/dashboard_admin/dashboard")));
const EditYourself = Loadable(lazy(() => import("../pages/admin/edit_yourself/edit")));
const PromptAdminPage = Loadable(lazy(() => import("../pages/prompt/index")));


const AdminRoutes = (isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/admin",  // เส้นทางของ Admin
      element: isLoggedIn ? <AdminLayout /> : <Navigate to="/" />,  // ใช้ FullLayout ถ้าเป็นผู้ใช้ที่ล็อกอิน
      children: [
        {
          index: true,
          element: <AdminDashboard />, // หน้า Dashboard ของ Admin
        },
        {
          path: "/admin/edityourself",
          element: <EditYourself />, // หน้า Settings ของ Admin
        },
        {
          path: "prompt",  // เส้นทางสำหรับจัดการ Prompt
          element: <PromptAdminPage />,
        }


        // {
        //   path: "/admin/create",
        //   element: <CreateAdmin />, // หน้า Settings ของ Admin
        // },
        // {
        //   path: "/admin/dashboard",
        //   element: <DashboardAdmin />, // หน้า Settings ของ Admin
        // },
        // {
        //    path: "/admin/edit/:id",
        //   element: <EditAdmin />, // หน้า Settings ของ Admin
        // },
      ],
    },
  ];
};

export default AdminRoutes;
