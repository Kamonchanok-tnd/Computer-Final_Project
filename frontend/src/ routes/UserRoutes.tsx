import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import { Navigate } from "react-router-dom";

// Lazy load หน้า EditProfile และ Home
const EditProfile = Loadable(lazy(() => import("../pages/users/edit_user/edituser")));
const Home = Loadable(lazy(() => import("../pages/homeuser/homeuser")));

const UserRoutes = (isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/user", // เส้นทางสำหรับหน้า Home
      element: isLoggedIn ? <Home /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า Home
    },
    {
      path: "/user/edit-profile", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <EditProfile /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
  ];
};

export default UserRoutes;
