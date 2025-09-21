import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/loading/Loadable";
import { Navigate } from "react-router-dom";

const BreathingPage = Loadable(lazy(() => import("../pages/secondary function/breathing/breath"))); 
const MeditationMain =  Loadable(lazy(() => import("../pages/secondary function/meditation/meditation"))); 

const ChatSpace = Loadable(lazy(() => import("../pages/Chat-space/chat")));

const  MirrorPage = Loadable(lazy(() => import("../pages/mirror/MirrorPage"))); 
const MonthlyOverviewPage = Loadable(lazy(() => import("../pages/mirror/MonthlyOverviewPage")));
import Headers from "../layout/HeaderLayout/Header";
const RelaxActivities = Loadable(lazy(() => import("../pages/secondary function/audio content home/RelaxActivities"))); 
const  Assessments = Loadable(lazy(() => import("../pages/assessment/assessments")));
const MoodPopup = Loadable(lazy(() => import("../components/assessment/MoodPopup")));
const  AssessmentLists = Loadable(lazy(() => import("../components/assessment/AssessmentLists")));
const Result = Loadable(lazy(() => import("../pages/assessment/result"))); 
const AssessmentDashboard = Loadable(lazy(() => import("../pages/assessment/AssessmentDashboard")));
const ASMRApp = Loadable(lazy(() => import("../pages/secondary function/ASMR/ASMRApp"))); 


const VoiceChat = Loadable(lazy(() => import("../pages/Voice-Chat/VoiceChat")));
const ChatRedirector = Loadable(lazy(() => import("../components/Chat.tsx/ChatRedirector")));
const AddSoundPlaylist = Loadable(lazy(() => import("../pages/secondary function/Playlist/Playlist")))
const MeditationPage = Loadable(lazy(() => import("../pages/secondary function/meditation/meditation"))); 
// import Playermediameditation from "../pages/secondary function/meditation/playermedia/playmedia";
const PlayerPlaylist = Loadable(lazy(() => import("../pages/secondary function/playermedia/playerPlaylist"))); 
const Playermediameditation = Loadable(lazy(() => import("../pages/secondary function/meditation/playermeditation/playmedia"))); // "../pages/secondary function/meditation/playermeditation/playmedia";
const AddSoundPlaylistMeditation = Loadable(lazy(() => import("../pages/secondary function/meditation/editplaylistmeditation/editplaylistmeditation")));
const DoctorRecommendPage = Loadable(lazy(() => import("../pages/doctor/DoctorRecommendPage.tsx")))

const UserMessagePage = Loadable(lazy(() => import("../pages/secondary function/message/userMessagePage"))); 
const PlayerPlaylistMeditation = Loadable(lazy(() => import("../pages/secondary function/meditation/playermeditation/playerplaylistmeditation"))); // "../pages/secondary function/meditation/playermeditation/playerplaylistmeditation.tsx";
// Lazy load หน้า EditProfile และ Home
const EditProfile = Loadable(
  lazy(() => import("../pages/users/edit_user/edituser"))
);
const Home = Loadable(lazy(() => import("../pages/homeuser/homeuser")));
const ChantingMain = Loadable(lazy(() => import("../pages/secondary function/chanting/chatingMain")))
const Player = Loadable(lazy(() => import("../pages/secondary function/playermedia/player")))


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
          path: "/audiohome/meditation/playlist/play/:pid/:id",
          element: isLoggedIn ? <PlayerPlaylistMeditation /> : <Navigate to="/" />,
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

        {
          path: "/audiohome/message", // เส้นทางสำหรับหน้า message
          element: isLoggedIn ? <UserMessagePage/> : <Navigate to="/" />,
        },
        //assessment
        {
          path: "/assessment/:groupId/:quid",
          element: isLoggedIn ? <MoodPopup /> : <Navigate to="/" />,
        },
        {
          path: "/assessmentlists/:groupId/:quid",
          element: isLoggedIn ? <AssessmentLists /> : <Navigate to="/" />,
        },
        {
          path: "/assessments", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <Assessments /> : <Navigate to="/" />, //
        },
        {
          path: "/result", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <Result /> : <Navigate to="/" />, //
        },
        {
          path: "/assessment/dashboard", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
          element: isLoggedIn ? <AssessmentDashboard /> : <Navigate to="/" />, //
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
      path: "/audiohome/mirror", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <MirrorPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
    {
      path: "/user/mirror/overview", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <MonthlyOverviewPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
     {
      path: "/doctors", // เส้นทางสำหรับหน้าแก้ไขโปรไฟล์
      element: isLoggedIn ? <DoctorRecommendPage /> : <Navigate to="/" />, // หากล็อกอินแล้วจะแสดงหน้า EditProfile
    },
  ];
};

export default UserRoutes;
