import { Heart, Book, Waves, Headphones, Play, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import userImage from "../../../assets/user.png"; // รูปตัวละคร

function RelaxActivities() {
  const navigate = useNavigate();

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
  ];

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gradient-to-b from-white to-[#C2F4FF]">
      {/* Greeting bubble */}
      <div className="w-full max-w-4xl relative mb-20">
        {/* กล่องข้อความ */}
        <div className="bg-[#E6F9FF] rounded-xl p-4 w-[75%] shadow-sm">
          <p className="font-bold text-gray-900 mb-1">สวัสดี สุภัสสร</p>
          <p className="text-gray-800 text-base leading-relaxed">
            Heal Jai ให้ใจได้พัก เมื่อทุกอย่างมันเยอะไป ลองแวะมาพักที่ SUT HealJai
            เรามีกิจกรรมสบาย ๆ และข้อความดี ๆ ที่พร้อมอยู่ข้างคุณเสมอ
          </p>
        </div>

        {/* ปุ่มวงกลม ChevronDown */}
        <div
          className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-10 
          bg-[#B3E5FC] rounded-full flex items-center justify-center shadow-lg 
          cursor-pointer hover:scale-110 transition"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <ChevronDown className="text-white w-5 h-5" />
        </div>

        {/* ตัวละคร */}
        <img
          src={userImage}
          alt="Character"
          className="absolute right-0 top-20 w-28 transition-all duration-300"
        />
      </div>

      {/* Header */}
      <div className="w-full max-w-4xl mb-4">
        <h2 className="text-xl font-bold text-gray-800">กิจกรรมผ่อนคลาย</h2>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
        {activities.map((act, idx) => (
          <div
            key={idx}
            className={`${act.gradient} rounded-xl p-5 flex flex-col justify-between h-52 shadow-lg 
              transition-transform duration-300 hover:scale-[1.03]`}
          >
            {/* เนื้อหาด้านบนของการ์ด */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">{act.title}</h3>
              <p className="text-gray-700 text-sm">{act.description}</p>
              <div className="bg-white rounded-full p-3 inline-flex shadow-md">
                {act.icon}
              </div>
            </div>

            {/* ปุ่มอยู่มุมขวาล่าง */}
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
        ))}
      </div>
    </div>
  );
}

export default RelaxActivities;
