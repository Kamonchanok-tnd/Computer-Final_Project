import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/loading/Loadable";
import { Navigate } from "react-router-dom";
import HomePage from "../pages/secondary function/audio content home/audiohome";
import BreathingPage from "../pages/secondary function/breathing/breath";

import MeditationPage from "../pages/secondary function/meditation/meditation";
import ChatSpace from "../pages/Chat-space/chat";
import Headers from "../layout/HeaderLayout/Header";

import Assessments from "../pages/assessment/assessments";
import Result from "../pages/assessment/result";
import MoodPopup from "../components/assessment/MoodPopup";
import VoiceChat from "../pages/Voice-Chat/VoiceChat";

// Lazy load หน้า EditProfile และ Home
const EditProfile = Loadable(lazy(() => import("../pages/users/edit_user/edituser")));
const Home = Loadable(lazy(() => import("../pages/homeuser/homeuser")));

const UserRoutes = (isLoggedIn: boolean): RouteObject[] => {
  return [
    {
      path: "/", // เส้นทางสำหรับหน้า Home
      element: <Headers />,
      children: [
        {
          index: true,
          element: isLoggedIn ? <Home /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า Home
        },
        {
          path: "/user", // เส้นทางสำหรับหน้า Home
          element: isLoggedIn ? <Home /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า Home
        },
        {
          path: "/edit-profile", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <EditProfile /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/audiohome", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <HomePage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/breath-in", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <BreathingPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/meditation", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <MeditationPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/chat", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <ChatSpace isNewChatDefault={true}/> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/chat/:chatroom_id", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <ChatSpace isNewChatDefault={false}/> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/voice-chat/:id", 
          element: isLoggedIn ? <VoiceChat /> : <Navigate to="/" />,
        },

        //assessment
        {
          path: "/assessment", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <MoodPopup /> : <Navigate to="/" />, // 
        },
        {
          path: "/assessments", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <Assessments /> : <Navigate to="/" />, // 
        },
        {
          path: "/result", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <Result /> : <Navigate to="/" />, // 
        }
      ],
    },
    // {
    //   path: "/user/edit-profile", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
    //   element: isLoggedIn ? <EditProfile /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    // },
    // {
    //   path: "/user/audiohome", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
    //   element: isLoggedIn ? <HomePage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    // },
    // {
    //   path: "/user/breath-in", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
    //   element: isLoggedIn ? <BreathingPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    // },
    
    // {
    //   path: "/user/meditation", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
    //   element: isLoggedIn ? <MeditationPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    // },
    // {
    //   path: "/user/chat", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
    //   element: isLoggedIn ? <ChatSpace /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    // }
  ];
};

export default UserRoutes;
