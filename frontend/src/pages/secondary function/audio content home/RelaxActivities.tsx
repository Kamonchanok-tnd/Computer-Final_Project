import {
  Heart,
  Book,
  Waves,
  Headphones,
  Play,
  ChevronDown,
  PenTool,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState,useRef } from "react";
import userImage from "../../../assets/user.png";
import { GetUsersById } from "../../../services/https/login";
import { logActivity } from "../../../services/https/activity";
function RelaxActivities() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  const userId = localStorage.getItem("id");

  const getUserById = async (id: string) => {
    const res = await GetUsersById(id);
    if (res?.status === 200) {
      setUsername(res.data.username);
    } else {
      setUsername("ผู้ใช้");
    }
  };

  useEffect(() => {
    if (userId) {
      getUserById(userId);
    }
  }, [userId]);

  const hasLoggedRef = useRef(false); // ref เพื่อตรวจสอบว่า log แล้วหรือยัง
  
    useEffect(() => {
      if (hasLoggedRef.current) return; // ถ้าเรียกแล้ว → ข้าม
      hasLoggedRef.current = true;       // บันทึกว่าเรียกแล้ว
  
      const uid = Number(localStorage.getItem("id"));
      if (!uid) return;
  
      logActivity({
        uid,
        action: "visit_page",
        page: "/audiohome",
      });
    }, []);
  

  const activities = [
    {
      title: "ทำสมาธิและฝึกลมหายใจ",
      description: "หายใจเข้า... แล้วปล่อยความเครียดออกไป",
      icon: <Waves className="w-10 h-10 text-[#00B8D9]" />,
      gradient: "bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA]",
      path: "/audiohome/meditation",
    },
    {
      title: "ข้อความให้กำลังใจ",
      description: "รับข้อความให้กำลังใจ ที่อาจเป็นสิ่งเล็ก ๆ แต่ช่วยได้มากกว่าที่คิด",
      icon: <Heart className="w-10 h-10 text-[#F06292]" />,
      gradient: "bg-gradient-to-br from-[#F8BBD0] to-[#F48FB1]",
      path: "/message",
    },
    {
      title: "สวดมนต์",
      description: "ฟังเสียงสวดมนต์ให้ใจสงบ",
      icon: <Book className="w-10 h-10 text-[#FFD54F]" />,
      gradient: "bg-gradient-to-br from-[#FFF9C4] to-[#FFE082]",
      path: "/audiohome/chanting",
    },
    {
      title: "ASMR",
      description: "ฟังเสียงกระซิบหรือเสียงเบา ๆ ให้ใจสงบ",
      icon: <Headphones className="w-10 h-10 text-[#AED581]" />,
      gradient: "bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7]",
      path: "/audiohome/asmr",
    },
    {
      title: "เขียนระบายบนกระจก",
      description: "ลองเขียนความรู้สึกลงบนกระจก เพื่อปล่อยวางและระบายความรู้สึก",
      icon: <PenTool className="w-10 h-10 text-[#BA68C8]" />,
      gradient: "bg-gradient-to-br from-[#E1BEE7] to-[#CE93D8]",
      path: "/audiohome/mirror",
    },
  ];

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-white dark:from-transparent to-[#C2F4FF] dark:to-[#C2F4FF]/30 font-ibmthai">
      {/* Greeting bubble */}
      <div className="w-full max-w-4xl relative mb-20">
        <div className="bg-[#E6F9FF] rounded-xl p-4 w-[75%] shadow-sm dark:bg-chat-dark">
          <p className="font-bold text-gray-900 mb-1 dark:text-text-dark">สวัสดี {username || "..."}</p>
          <p className="text-gray-800 text-base leading-relaxed dark:text-text-dark">
            Heal Jai ให้ใจได้พัก เมื่อทุกอย่างมันเยอะไป ลองแวะมาพักที่ SUT HealJai
            เรามีกิจกรรมสบาย ๆ และข้อความดี ๆ ที่พร้อมอยู่ข้างคุณเสมอ
          </p>
        </div>

        <div
          className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-10 
          bg-[#B3E5FC] rounded-full flex items-center justify-center shadow-lg 
          cursor-pointer hover:scale-110 transition"
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          <ChevronDown className="text-white w-5 h-5" />
        </div>

        <img
          src={userImage}
          alt="Character"
          className="absolute right-0 top-20 w-28 transition-all duration-300"
        />
      </div>

      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-text-dark">กิจกรรมผ่อนคลาย</h2>
      </div>

      {/* Activities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
        {activities.map((act, idx) => {
          const isLastOdd =
            activities.length % 2 !== 0 && idx === activities.length - 1;
          return (
            <div
              key={idx}
              className={`${act.gradient} rounded-xl p-5 flex flex-col justify-between h-52 shadow-lg 
                transition-transform duration-300 hover:scale-[1.03] 
                ${isLastOdd ? "sm:col-span-2 sm:mx-auto sm:w-1/2" : ""}`}
            >
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800">{act.title}</h3>
                <p className="text-gray-700 text-sm">{act.description}</p>
                <div className="bg-white rounded-full p-3 inline-flex shadow-md">
                  {act.icon}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate(act.path)}
                  className="flex items-center bg-white px-4 py-2 rounded-full 
                    border border-gray-300 text-sm text-gray-700 shadow 
                    hover:bg-gray-50 transition cursor-pointer"
                >
                  <span>ดูกิจกรรม</span>
                  <div className="ml-2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                    <Play className="w-3 h-3 text-black" />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RelaxActivities;
