import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/loading/Loadable";
import { Navigate } from "react-router-dom";

import BreathingPage from "../pages/secondary function/breathing/breath";
import MeditationMain from "../pages/secondary function/meditation/meditation";

import ChatSpace from "../pages/Chat-space/chat";

import MirrorPage from "../pages/mirror/MirrorPage";
import MonthlyOverviewPage from "../pages/mirror/MonthlyReport.tsx";
import Headers from "../layout/HeaderLayout/Header";
import RelaxActivities from "../pages/secondary function/audio content home/RelaxActivities";

import Assessments from "../pages/assessment/assessments";
import Result from "../pages/assessment/result";
import MoodPopup from "../components/assessment/MoodPopup";
import ASMRApp from "../pages/secondary function/ASMR/ASMRApp.tsx";
import VoiceChat from "../pages/Voice-Chat/VoiceChat";
import ChatRedirector from "../components/Chat.tsx/ChatRedirector";
import AddSoundPlaylist from "../pages/secondary function/Playlist/Playlist";
import MeditationPage from "../pages/secondary function/meditation/meditation";
// import Playermediameditation from "../pages/secondary function/meditation/playermedia/playmedia";
import Player from "../pages/secondary function/playermedia/player";
import PlayerPlaylist from "../pages/secondary function/playermedia/playerPlaylist";
import ChantingMain from "../pages/secondary function/chanting/chatingMain";
import Playermediameditation from "../pages/secondary function/meditation/playermeditation/playmedia";
import AddSoundPlaylistMeditation from "../pages/secondary function/meditation/editplaylistmeditation/editplaylistmeditation";

// Lazy load หน้า EditProfile และ Home
const EditProfile = Loadable(
  lazy(() => import("../pages/users/edit_user/edituser"))
);
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
          element: isLoggedIn ? <RelaxActivities /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/audiohome/breath-in", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <BreathingPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/audiohome/meditation", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <MeditationMain /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },

        {
          path: "/audiohome/asmr",
          element: isLoggedIn ? <ASMRApp /> : <Navigate to="/" />,
        },

        {
          path: "/chat/new", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? (
            <ChatSpace isNewChatDefault={true} />
          ) : (
            <Navigate to="/" />
          ), // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/chat/:chatroom_id", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? (
            <ChatSpace isNewChatDefault={false} />
          ) : (
            <Navigate to="/" />
          ), // หากล็อกอินแล้วจะแสดงหน้า EditProfile
        },
        {
          path: "/chat/voice-chat/:id",
          element: isLoggedIn ? <VoiceChat /> : <Navigate to="/" />,
        },
        {
          path: "/chat",
          element: isLoggedIn ? <ChatRedirector /> : <Navigate to="/" />,
        },
        {
          path: "/audiohome/chanting",
          element: isLoggedIn ? <ChantingMain /> : <Navigate to="/" />,
        },
        {
          path: "/audiohome/chanting/play/:id",
          element: isLoggedIn ? <Player /> : <Navigate to="/" />,
        },
        {
          path: "/audiohome/chanting/playlist/play/:pid/:id",
          element: isLoggedIn ? <PlayerPlaylist /> : <Navigate to="/" />,
        },
        {
          path: "/audiohome/Playlist/:id",
          element: isLoggedIn ? <AddSoundPlaylist /> : <Navigate to="/" />,
        },
        {
          path: "/audiohome/meditation/play/:ID",
          element: isLoggedIn ? <Playermediameditation /> : <Navigate to="/" />,
        },

        {
          path: "/playmediameditation/:ID",
          element: isLoggedIn ? <Playermediameditation /> : <Navigate to="/" />,
        },
        {
          path: "/editplaylist/:id",
          element: isLoggedIn ? (
            <AddSoundPlaylistMeditation />
          ) : (
            <Navigate to="/" />
          ),
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
        },
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

    {
      path: "/user/meditation", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <MeditationPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
    {
      path: "/user/chat", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <ChatSpace /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
    {
      path: "/user/mirror", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <MirrorPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
    {
      path: "/user/mirror/overview", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <MonthlyOverviewPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
  ];
};

export default UserRoutes;
