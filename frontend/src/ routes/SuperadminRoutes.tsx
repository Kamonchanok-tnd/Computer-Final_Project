import { RouteObject } from "react-router-dom";
import FullLayout from "../layout/SuperadminLayout/ index";
import { Navigate } from "react-router-dom";

import Loadable from "../components/loading/Loadable";
import { lazy } from "react";
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
import CreateCriteriaPage from "../pages/admin/questionnaire/create/CreateCriteriaPage";
import ChatSpaceDetail from "../pages/admin/dashboard_contents/chat/ChatSpaceDetail";

import EditCriteriaPage from "../pages/admin/questionnaire/edit/editCriteriaPage";
import EditQuestionAndAnswerPage from "../pages/admin/questionnaire/edit/editQuestionAndAnswer";
import Quetionairedetail from "../pages/admin/dashboard_contents/questionaire/quetionairedetail";
// import CreateAdmin from "../pages/superadmin/create_admin/createadmin";
// import DashboardAdmin from "../pages/superadmin/dashboard_admin/dashboard";
// import EditAdmin from "../pages/superadmin/edit_admin/EditAdmin";
// const AdminDashboard = Loadable(lazy(() => import("../pages/dashboard/admindashboard")));
const AdminSettings = Loadable(lazy(() => import("../pages/dashboard/adminsetting")));
const CreateAdmin = Loadable(lazy(() => import("../pages/superadmin/create_admin/createadmin")));
const DashboardAdmin = Loadable(lazy(() => import("../pages/superadmin/dashboard_superadmin/dashboard")));
const EditAdmin = Loadable(lazy(() => import("../pages/superadmin/edit_admin/EditAdmin")));
const PromptAdminPage = Loadable(lazy(() => import("../pages/prompt/index")));

const SuperadminRoutes = (isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/superadmin",  // เส้นทางของ Admin
      element: isLoggedIn ? <FullLayout /> : <Navigate to="/" />,  // ใช้ FullLayout ถ้าเป็นผู้ใช้ที่ล็อกอิน
      children: [
        {
          index: true,
          element: <DashboardAdmin />, // หน้า Dashboard ของ Admin
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
        {
                          path: "/superadmin/dashboard/contents",
                          element: <HomeContents />, // หน้า Settings ของ Admin DashboardContents
                        },
                        {
                          path: "/superadmin/dashboard/contents/sound",
                          element: <DashboardContents />, // หน้า Settings ของ Admin DashboardContents
                        },
                        {
                           path: "/superadmin/meditation-details",
                          element: <DashboardMeditation />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                           path: "/superadmin/chanting-details",
                          element: <DashboardChanting />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                           path: "/superadmin/wordhealing-details",
                          element: <DashboardWordHealing />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                           path: "/superadmin/mirror-details",
                          element: <DashboardMirror />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                           path: "/superadmin/asmr-details",
                          element: <DashboardAsmr />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                           path: "/superadmin/breathing-details",
                          element: <DashboardBreathing />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                            path: "/superadmin/dashboard/contents/chat",
                           element: <ChatSpaceDetail />, // หน้า Settings ของ Admin DashboardChanting
                         },
                         {
                            path: "/superadmin/dashboard/contents/questionnaire",
                           element: <Quetionairedetail />, // หน้า Settings ของ Admin DashboardChanting
                         },
        
                         {
                           path: "/superadmin/activity",
                          element: <WebData />, // หน้า Settings ของ Admin DashboardChanting
                        },
                        {
                            path: "/superadmin/questionnairePage",        // หน้าจัดการเเบบทดสอบ
                            element: <QuestionnairePage />,
                        },
                        {
                            path: "/superadmin/createQuestionnaire",     // หน้าสร้างเเบบทดสอบ
                            element: <FormStepInfo />,
                        },
                        {
                            path: "/superadmin/createQuestion",         // หน้าสร้างคำถาม
                            element: <FormStepQuestion />,
                        },
                        {
                            path: "/superadmin/editQuestionnaire",     // หน้าสร้างเเบบทดสอบ
                            element: <EditQuestionnaire/>,
                        },
                        {
                            path: "/superadmin/manageTestOrder",     // หน้าสร้างเเบบทดสอบ
                            element: <ManageTestOrder/>,
                        },
                        {
                            path: "prompt",  // เส้นทางสำหรับจัดการ Prompt
                            element: <PromptAdminPage />,
                        },
                        // ระบบ 2
                        {
                            path: "/superadmin/meditation",  
                            element: <VideoForm/>,
                        },
                        {
                            path: "/superadmin/sounds", //ดูรายการเสียง
                            element: <ListSound/>,
                        },
                        
                        {
                            path :"/superadmin/listsound",
                            element: <ListSound/>
                        },
                        {
                            path :"/superadminmessagePage",
                            element: <MessagePage/>
                        },
                        {
                            path :"/superadmin/createMessagePage",
                            element: <CreateMessagePage/>
                        },
                           {
                            path :"/superadmin/editMessagePage",
                            element: <EditMessagePage/>
                        },
                        {
                            path: "/superadmin/sounds/:id", //ดูรายการเสียง
                            element: <EditSound/>,
                        },
                        {
                            path: "/superadmin/createCriteriaPage", // สร้างเกณฑ์
                            element: <CreateCriteriaPage/>,
                        },
                        {
                            path: "/superadmin/editCriteriaPage", // เเก้้ไขเกณฑ์
                            element: <EditCriteriaPage/>,
                        },
                        {
                            path: "/superadmin/editQuestionAndAnswerPage", // เเก้ไขคำถามเเละคำตอบ
                            element: <EditQuestionAndAnswerPage/>,
                        }
      ],
    },
  ];
};

export default SuperadminRoutes;
