import { RouteObject } from "react-router-dom";
import FullLayout from "../layout/FullLayout/ index";
import { Navigate } from "react-router-dom";

import Loadable from "../components/third-patry/Loadable";
import { lazy } from "react";
// import CreateAdmin from "../pages/superadmin/create_admin/createadmin";
// import DashboardAdmin from "../pages/superadmin/dashboard_admin/dashboard";
// import EditAdmin from "../pages/superadmin/edit_admin/EditAdmin";
const AdminDashboard = Loadable(lazy(() => import("../pages/dashboard/admindashboard")));
const AdminSettings = Loadable(lazy(() => import("../pages/dashboard/adminsetting")));
const CreateAdmin = Loadable(lazy(() => import("../pages/superadmin/create_admin/createadmin")));
const DashboardAdmin = Loadable(lazy(() => import("../pages/superadmin/dashboard_superadmin/dashboard")));
const EditAdmin = Loadable(lazy(() => import("../pages/superadmin/edit_admin/EditAdmin")));


const SuperadminRoutes = (isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/superadmin",  // เส้นทางของ Admin
      element: isLoggedIn ? <FullLayout /> : <Navigate to="/" />,  // ใช้ FullLayout ถ้าเป็นผู้ใช้ที่ล็อกอิน
      children: [
        {
          index: true,
          element: <AdminDashboard />, // หน้า Dashboard ของ Admin
        },
        {
          path: "/superadmin/settings",
          element: <AdminSettings />, // หน้า Settings ของ Admin
        },
        {
          path: "/superadmin/create",
          element: <CreateAdmin />, // หน้า Settings ของ Admin
        },
        {
          path: "/superadmin/dashboard",
          element: <DashboardAdmin />, // หน้า Settings ของ Admin
        },
        {
           path: "/superadmin/edit/:id",
          element: <EditAdmin />, // หน้า Settings ของ Admin
        },
      ],
    },
  ];
};

export default SuperadminRoutes;
