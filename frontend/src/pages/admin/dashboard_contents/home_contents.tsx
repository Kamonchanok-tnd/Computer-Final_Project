

// //DashboardContents.tsx
// import React, { useEffect, useState } from "react";
// import { Line } from "@ant-design/charts";
// import { useNavigate } from "react-router-dom";
// import admin from "../../../assets/creative.png";
// import {
//   getTopContentComparison,
//   TopContent,
// } from "../../../services/https/dashboardcontents";

// // Components
// import MusicCard from "./meditation/meditationgard";
// import ChantingCard from "./chanting/chantinggard";
// import WordHealingCard from "./word-healing/wordgard";
// import MirrorCard from "./mirror/mirrorgard";
// import ASMRCard from "./asmr/asmrgard";
// import BreathingCard from "./breathing/breatinggard";
// import ChatTrendCardRecharts from "./chat/ChatTrendCardRecharts";
// import QuestionnaireTrendChart from "./questionaire/QuestionnaireTrendChart";

// // DashboardCard component
// const DashboardCard: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({
//   title,
//   className,
//   children,
// }) => (
//   <div className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>
//     <h2 className="font-semibold mb-2">{title}</h2>
//     {children}
//   </div>
// );

// const HomeContents: React.FC = () => {
//   const navigate = useNavigate();

//   // State Top Content Comparison
//   const [topContentData, setTopContentData] = useState<TopContent[]>([]);
//   const [loadingTopContent, setLoadingTopContent] = useState(true);
//   const [topContentError, setTopContentError] = useState<string | null>(null);


//   // Fetch Top Content Comparison
//   useEffect(() => {
//     const fetchTopContent = async () => {
//       setLoadingTopContent(true);
//       try {
//         const data = await getTopContentComparison();
//         console.log("ข้อมูลผู้ใช้ทั้งหมด",data);
//         const usersByCategory = data.reduce((acc: Record<string, number>, item) => {
//           acc[item.category] = (acc[item.category] || 0) + item.unique_users;
//           return acc;
//         }, {});

//         setTopContentData(
//           Object.entries(usersByCategory).map(([category, users]) => ({
//             name: category,
//             category,
//             unique_users: users,
//           }))
//         );
//       } catch (err) {
//         console.error(err);
//         setTopContentError("ไม่สามารถโหลดข้อมูล Top Content ได้");
//       } finally {
//         setLoadingTopContent(false);
//       }
//     };
//     fetchTopContent();
//   }, []);

//   // Mapping category เป็นชื่อภาษาไทย + สีเพสเทลอ่อน
//   const categoryLabels: Record<string, { label: string; colorBg: string; colorText: string }> = {
//   Meditation: { label: "สมาธิ", colorBg: "bg-blue-50", colorText: "text-blue-700" },      // ฟ้าอ่อน
//   Breathing: { label: "ฝึกหายใจ", colorBg: "bg-orange-50", colorText: "text-orange-700" }, // ส้มอ่อน
//   ASMR: { label: "ASMR", colorBg: "bg-indigo-50", colorText: "text-indigo-700" },         // ม่วงอมฟ้าอ่อน
//   Chanting: { label: "สวดมนต์", colorBg: "bg-purple-50", colorText: "text-purple-700" },  // ม่วงอ่อน
//   Mirror: { label: "ระบายความรู้สึก", colorBg: "bg-pink-50", colorText: "text-pink-700" }, // ชมพูอ่อน
//   WordHealing: { label: "Word Healing", colorBg: "bg-green-50", colorText: "text-green-700" }, // เขียวอ่อน
//   Chat: { label: "แชท", colorBg: "bg-teal-50", colorText: "text-teal-700" },              // ✅ เพิ่ม Chat
//   Questionnaire: { label: "แบบสอบถาม", colorBg: "bg-yellow-50", colorText: "text-yellow-700" }, // ✅ เพิ่ม Survey
// };

//   // แปลง data ให้ตรงกับรูปแบบของ AntD Charts (long format)
//   const lineData = topContentData.map((item) => ({
//   category: categoryLabels[item.category]?.label || item.category,
//   users: item.unique_users,
// }));


//   // สร้าง summary จาก topContentData แบบไดนามิก
//   const summaryData = topContentData.map(item => {
//   const mapping = categoryLabels[item.category] || { label: item.category, colorBg: "bg-gray-100", colorText: "text-gray-700" };
//   return {
//     title: mapping.label,
//     value: item.unique_users,
//     bg: mapping.colorBg,
//     textColor: mapping.colorText,
//   };
// });

// summaryData.push({
//   title: "ผู้ใช้ทั้งหมด",
//   value: topContentData.reduce((sum, item) => sum + item.unique_users, 0),
//   bg: "bg-yellow-100",
//   textColor: "text-yellow-800",
// });

//   // Config ของ Line Chart
//   const lineConfig = {
//   data: lineData,
//   xField: "category",
//   yField: "users",
//   smooth: true,
//   point: {
//     size: 6,
//     shape: "circle",
//     style: (item: any) => ({
//       fill: categoryLabels[item.category]?.colorBg || "#60A5FA",
//       stroke: "#fff",
//       lineWidth: 2,
//     }),
//   },
//   tooltip: {
//     showMarkers: true,
//     formatter: (datum: any) => ({
//       name: datum.category,
//       value: `${datum.users} ผู้ใช้`,
//     }),
//   },
//   legend: false,
//   height: 300,
// };



//   return (
//     <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
//       <header className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 md:gap-0">
//   <div className="flex items-center gap-3">
//     <img src={admin} alt="Admin" className="w-15 h-15" />
//     <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ </h1>
//   </div>
//   <input
//     type="text"
//     placeholder="Search..."
//     className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none w-full md:w-64"
//   />
// </header>


//       <main className="p-6 space-y-6">
//         <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Left: Top Content Comparison */}
//           <DashboardCard title="ผู้ใช้ตามหมวดหมู่" className="col-span-1 md:col-span-2">
//             {loadingTopContent ? (
//               <p>กำลังโหลดข้อมูล...</p>
//             ) : topContentError ? (
//               <p className="text-red-500">{topContentError}</p>
//             ) : (
//               <div className="w-full h-64">
//                 <Line {...lineConfig} />
//               </div>
//             )}
//           </DashboardCard>

//           {/* Right: Summary Card */}
//           <DashboardCard title="Summary" className="col-span-1 flex flex-col gap-2">
//             {summaryData.map((item, idx) => (
//               <div
//                 key={idx}
//                 className={`${item.bg} ${item.textColor} rounded-lg flex justify-between items-center px-4 py-2`}
//               >
//                 <span>{item.title}</span>
//                 <span className="font-semibold">{item.value.toLocaleString()}</span>
//               </div>
//             ))}
//           </DashboardCard>
//         </section>

//         {/* Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <div className="col-span-2">
//           <ChatTrendCardRecharts onViewMore={() => navigate("/admin/dashboard/contents/chat")}/>
//           </div>
//           <div className="col-span-2">
//           <QuestionnaireTrendChart onViewMore={() => navigate("/admin/dashboard/contents/questionnaire")}/>
//           </div>
        
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <MusicCard onViewMore={() => navigate("/admin/dashboard/contents/sound")}/>
//           {/* <ChantingCard onViewMore={() => navigate("/admin/chanting-details")}/> */}
//           <WordHealingCard onViewMore={() => navigate("/admin/wordhealing-details")}/>
//           <MirrorCard onViewMore={() => navigate("/admin/mirror-details")} />
//           {/* <ASMRCard onViewMore={() => navigate("/admin/asmr-details")} />
//           <BreathingCard onViewMore={() => navigate("/admin/breathing-details")} /> */}
//           {/* <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-center text-gray-400">
//             ยังไม่มีข้อมูล
//           </div> */}
          
//         </div>
//       </main>
//     </div>
//   );
// };

// export default HomeContents;





import React, { use, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import admin from "../../../assets/creative.png";
import {
  getTopContentComparison,
  TopContent,
} from "../../../services/https/dashboardcontents";

// Components
import MusicCard from "./meditation/meditationgard";

import WordHealingCard from "./word-healing/wordgard";
import MirrorCard from "./mirror/mirrorgard";

import ChatTrendCardRecharts from "./chat/ChatTrendCardRecharts";
import QuestionnaireTrendChart from "./questionaire/QuestionnaireTrendChart";


// DashboardCard component
const DashboardCard: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({
  title,
  className,
  children,
}) => (
  <div className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>
    <h2 className="font-semibold mb-2">{title}</h2>
    {children}
  </div>
);

const HomeContents: React.FC = () => {
  const navigate = useNavigate();

  // State Top Content Comparison
  const [topContentData, setTopContentData] = useState<TopContent[]>([]);
  const [loadingTopContent, setLoadingTopContent] = useState(true);
  const [topContentError, setTopContentError] = useState<string | null>(null);
 
  function getRolePath( subPath: string) {
    const role = localStorage.getItem("role");
    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
    navigate(`/${rolePrefix}/${subPath}`)
   
  }

  // Fetch Top Content Comparison
  useEffect(() => {
    const fetchTopContent = async () => {
      setLoadingTopContent(true);
      try {
        const data = await getTopContentComparison();
        const usersByCategory = data.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.unique_users;
          return acc;
        }, {});

        setTopContentData(
          Object.entries(usersByCategory).map(([category, users]) => ({
            name: category,
            category,
            unique_users: users,
          }))
        );
      } catch (err) {
        console.error(err);
        setTopContentError("ไม่สามารถโหลดข้อมูล Top Content ได้");
      } finally {
        setLoadingTopContent(false);
      }
    };
    fetchTopContent();
  }, []);

  // Mapping category เป็นชื่อภาษาไทย + สี Tailwind
  const categoryLabels: Record<
    string,
    { label: string; colorBg: string; colorText: string }
  > = {
    Meditation: { label: "สมาธิ", colorBg: "bg-blue-50", colorText: "text-blue-700" },
    Breathing: { label: "ฝึกหายใจ", colorBg: "bg-orange-50", colorText: "text-orange-700" },
    ASMR: { label: "ASMR", colorBg: "bg-indigo-50", colorText: "text-indigo-700" },
    Chanting: { label: "สวดมนต์", colorBg: "bg-purple-50", colorText: "text-purple-700" },
    Mirror: { label: "ระบายความรู้สึก", colorBg: "bg-pink-50", colorText: "text-pink-700" },
    WordHealing: { label: "Word Healing", colorBg: "bg-green-50", colorText: "text-green-700" },
    Chat: { label: "แชท", colorBg: "bg-teal-50", colorText: "text-teal-700" },
    Questionnaire: { label: "แบบสอบถาม", colorBg: "bg-yellow-50", colorText: "text-yellow-700" },
  };

  // Data สำหรับ Recharts
  const chartData = topContentData.map((item) => {
    const mapping = categoryLabels[item.category] || { label: item.category, colorText: "text-gray-700" };
    return {
      category: mapping.label,
      users: item.unique_users,
      color: mapping.colorText,
    };
  });

  // Summary Data
  const summaryData = topContentData.map((item) => {
    const mapping = categoryLabels[item.category] || { label: item.category, colorBg: "bg-gray-50", colorText: "text-gray-700" };
    return {
      title: mapping.label,
      value: item.unique_users,
      colorBg: mapping.colorBg,
      colorText: mapping.colorText,
    };
  });

  // เพิ่มผู้ใช้ทั้งหมด
  summaryData.push({
    title: "ผู้ใช้ทั้งหมด",
    value: topContentData.reduce((sum, item) => sum + item.unique_users, 0),
    colorBg: "bg-red-50",
    colorText: "text-red-700",
  });

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
      <header className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <img src={admin} alt="Admin" className="w-15 h-15" />
          <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ </h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Top Content Comparison */}
          <DashboardCard title="ผู้ใช้ตามหมวดหมู่" className="col-span-1 md:col-span-2">
            {loadingTopContent ? (
              <p>กำลังโหลดข้อมูล...</p>
            ) : topContentError ? (
              <p className="text-red-500">{topContentError}</p>
            ) : (
              <div className="w-full h-95">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value} ผู้ใช้`, "จำนวน"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardCard>

          {/* Right: Summary Card */}
          <DashboardCard title="Summary" className="col-span-1 flex flex-col gap-2">
            {summaryData.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg flex justify-between items-center px-4 py-2 ${item.colorBg} ${item.colorText}`}
              >
                <span>{item.title}</span>
                <span className="font-semibold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </DashboardCard>
        </section>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-2">
            <ChatTrendCardRecharts
           
              onViewMore={() =>  getRolePath("dashboard/contents/chat")}
            />
          </div>
          <div className="col-span-2">
            <QuestionnaireTrendChart
              onViewMore={() => getRolePath("dashboard/contents/questionnaire")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MusicCard onViewMore={() => getRolePath("dashboard/contents/sound")} />
          <WordHealingCard onViewMore={() => getRolePath("wordhealing-details")} />
          <MirrorCard/>
        </div>
      </main>
    </div>
  );
};

export default HomeContents;
