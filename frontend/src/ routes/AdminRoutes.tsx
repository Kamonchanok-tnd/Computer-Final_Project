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
import VideoForm from "../pages/admin/meditation/meditation";
import SoundListPage from "../pages/admin/sounds/soundslist";

import QuestionnairePage from "../pages/admin/questionnaire/home/questionnairePage";
import FormStepInfo from "../pages/admin/questionnaire/create/FormStepInfo";
import FormStepQuestion from "../pages/admin/questionnaire/create/FormStepQuestion";
import EditQuestionnaire from "../pages/admin/questionnaire/edit/edit_questionnaire";
import ListSound from "../pages/admin/Listsound/Listsound";
import MessagePage from "../pages/admin/message/home/messagePage";
import CreateMessagePage from "../pages/admin/message/create/createMessagePage";

// const QuestionnairePage = Loadable(lazy(() => import("../pages/admin/questionnaire/questionnaire"))); // ✅ เพิ่มตรงนี้
// const CreateQuestionnairePage = Loadable(lazy(() => import("../pages/admin/questionnaire/createquestionnaire"))); // ✅ เพิ่มตรงนี้

const AdminRoutes = (isLoggedIn: boolean): RouteObject[] => {
    return [
        {
            path: "/admin", // เส้นทางของ Admin
            element: isLoggedIn ? <AdminLayout /> : <Navigate to="/" />, // ใช้ FullLayout ถ้าเป็นผู้ใช้ที่ล็อกอิน
            children: [
                {
                    index: true,
                    element: <AdminDashboard />, // หน้า Dashboard ของ Admin
                },
                {
                    path: "/admin/edityourself",
                    element: <EditYourself />, // หน้า Settings ของ Admin
                },
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
                {
                    path: "/admin/questionnairePage",        // หน้าจัดการเเบบทดสอบ
                    element: <QuestionnairePage />,
                },
                {
                    path: "/admin/createQuestionnaire",     // หน้าสร้างเเบบทดสอบ
                    element: <FormStepInfo />,
                },
                {
                    path: "/admin/createQuestion",         // หน้าสร้างคำถาม
                    element: <FormStepQuestion />,
                },
                 {
                    path: "/admin/editQuestionnaire",     // หน้าสร้างเเบบทดสอบ
                    element: <EditQuestionnaire/>,
                },
                {
                    path: "/admin/edityourself",
                    element: <EditYourself />, // หน้า Settings ของ Admin
                },
                {
                    path: "prompt",  // เส้นทางสำหรับจัดการ Prompt
                    element: <PromptAdminPage />,
                },
                // ระบบ 2
                {
                    path: "/admin/meditation",  // เส้นทางสำหรับจัดการ Prompt
                    element: <VideoForm/>,
                },
                {
                    path: "/admin/sounds",  // เส้นทางสำหรับจัดการ Prompt
                    element: <SoundListPage/>,
                },
                {
                    path :"/admin/listsound",
                    element: <ListSound/>
                },
                {
                    path :"/admin/messagePage",
                    element: <MessagePage/>
                },
                {
                    path :"/admin/createMessagePage",
                    element: <CreateMessagePage/>
                }
            ],
        },
    ]
};

export default AdminRoutes;
