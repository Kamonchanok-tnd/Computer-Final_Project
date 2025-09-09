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
import DashboardMeditation from "../pages/admin/dashboard_contents/meditation/dashmed";
import DashboardChanting from "../pages/admin/dashboard_contents/chanting/dashchanting";
import DashboardWordHealing from "../pages/admin/dashboard_contents/word-healing/dashword";
import DashboardMirror from "../pages/admin/dashboard_contents/mirror/dashmirror";
import DashboardAsmr from "../pages/admin/dashboard_contents/asmr/dashasmr";
import DashboardBreathing from "../pages/admin/dashboard_contents/breathing/dashbreathing";
import VideoForm from "../pages/admin/meditation/meditation";
import WebData from "../pages/admin/userdataweb/userdata";

import HomeContents from "../pages/admin/dashboard_contents/home_contents";
import DashboardContents from "../pages/admin/dashboard_contents/dashboard_contents";
import QuestionnairePage from "../pages/admin/questionnaire/home/questionnairePage";
import ManageTestOrder from "../pages/assessment/ManageTestOrder";
import FormStepInfo from "../pages/admin/questionnaire/create/createQuestionnairePage";
import FormStepQuestion from "../pages/admin/questionnaire/create/createQuestionAndAnswer";
import EditQuestionnaire from "../pages/admin/questionnaire/edit/editQuestionnairePage";
import ListSound from "../pages/admin/Listsound/Listsound";
import MessagePage from "../pages/admin/message/home/messagePage";
import EditMessagePage from "../pages/admin/message/edit/editMesagePage";
import CreateMessagePage from "../pages/admin/message/create/createMessagePage";
import EditSound from "../pages/admin/meditation/editSound";
import CreateCriteriaPage from "../pages/admin/questionnaire/create/createCriteriaPage";
import ChatSpaceDetail from "../pages/admin/dashboard_contents/chat/ChatSpaceDetail";

import EditCriteriaPage from "../pages/admin/questionnaire/edit/editCriteriaPage";
import EditQuestionAndAnswerPage from "../pages/admin/questionnaire/edit/editQuestionAndAnswer";
import Quetionairedetail from "../pages/admin/dashboard_contents/questionaire/quetionairedetail";

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
                {
                  path: "/admin/dashboard/contents",
                  element: <HomeContents />, // หน้า Settings ของ Admin DashboardContents
                },
                {
                  path: "/admin/dashboard/contents/sound",
                  element: <DashboardContents />, // หน้า Settings ของ Admin DashboardContents
                },
                {
                   path: "/admin/meditation-details",
                  element: <DashboardMeditation />, // หน้า Settings ของ Admin DashboardChanting
                },
                {
                   path: "/admin/chanting-details",
                  element: <DashboardChanting />, // หน้า Settings ของ Admin DashboardChanting
                },
                {
                   path: "/admin/wordhealing-details",
                  element: <DashboardWordHealing />, // หน้า Settings ของ Admin DashboardChanting
                },
                {
                   path: "/admin/mirror-details",
                  element: <DashboardMirror />, // หน้า Settings ของ Admin DashboardChanting
                },
                {
                   path: "/admin/asmr-details",
                  element: <DashboardAsmr />, // หน้า Settings ของ Admin DashboardChanting
                },
                {
                   path: "/admin/breathing-details",
                  element: <DashboardBreathing />, // หน้า Settings ของ Admin DashboardChanting
                },
                {
                    path: "/admin/dashboard/contents/chat",
                   element: <ChatSpaceDetail />, // หน้า Settings ของ Admin DashboardChanting
                 },
                 {
                    path: "/admin/dashboard/contents/questionnaire",
                   element: <Quetionairedetail />, // หน้า Settings ของ Admin DashboardChanting
                 },

                 {
                   path: "/admin/activity",
                  element: <WebData />, // หน้า Settings ของ Admin DashboardChanting
                },
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
                    path: "/admin/manageTestOrder",     // หน้าสร้างเเบบทดสอบ
                    element: <ManageTestOrder/>,
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
                    path: "/admin/meditation",  
                    element: <VideoForm/>,
                },
                {
                    path: "/admin/sounds", //ดูรายการเสียง
                    element: <ListSound/>,
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
                },
                   {
                    path :"/admin/editMessagePage",
                    element: <EditMessagePage/>
                },
                {
                    path: "/admin/sounds/:id", //ดูรายการเสียง
                    element: <EditSound/>,
                },
                {
                    path: "/admin/createCriteriaPage", // สร้างเกณฑ์
                    element: <CreateCriteriaPage/>,
                },
                {
                    path: "/admin/editCriteriaPage", // เเก้้ไขเกณฑ์
                    element: <EditCriteriaPage/>,
                },
                {
                    path: "/admin/editQuestionAndAnswerPage", // เเก้ไขคำถามเเละคำตอบ
                    element: <EditQuestionAndAnswerPage/>,
                }
               
            ],
        },
    ]
};

export default AdminRoutes;
