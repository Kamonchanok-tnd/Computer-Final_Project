// // DashboardContents.tsx
// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
//   Cell,
// } from "recharts";
// import { useNavigate } from "react-router-dom";

// import {
//   getDailySoundUsage,
//   DailySoundUsage,
//   getDailyWordHealingViews,
//   DailyViewsByTitle,
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

// const DashboardContents: React.FC = () => {
//   const navigate = useNavigate();

//   // State Music
//   const [musicData, setMusicData] = useState<{ day: string; plays: number }[]>([]);
//   const [loadingMusic, setLoadingMusic] = useState(true);
//   const [musicError, setMusicError] = useState<string | null>(null);

//   // State Chanting
//   const [chantingData, setChantingData] = useState<{ day: string; chants: number }[]>([]);
//   const [loadingChanting, setLoadingChanting] = useState(true);
//   const [chantingError, setChantingError] = useState<string | null>(null);

//   // State WordHealing
//   const [wordHealingData, setWordHealingData] = useState<{ day: string; total_views: number }[]>([]);
//   const [loadingWordHealing, setLoadingWordHealing] = useState(true);
//   const [wordHealingError, setWordHealingError] = useState<string | null>(null);

//   // State Top Content Comparison
//   const [topContentData, setTopContentData] = useState<TopContent[]>([]);
//   const [loadingTopContent, setLoadingTopContent] = useState(true);
//   const [topContentError, setTopContentError] = useState<string | null>(null);

//   // Fetch Music Data
//   useEffect(() => {
//     const fetchMusicData = async () => {
//       try {
//         const data: DailySoundUsage[] = await getDailySoundUsage();
//         const formattedData = data.map((item) => ({
//           day: new Date(item.date).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           }),
//           plays: item.play_count,
//         }));
//         setMusicData(formattedData);
//       } catch (err) {
//         setMusicError("ไม่สามารถโหลดข้อมูลได้");
//         console.error(err);
//       } finally {
//         setLoadingMusic(false);
//       }
//     };
//     fetchMusicData();
//   }, []);

//   // Fetch Chanting Data
//   useEffect(() => {
//     const fetchChantingData = async () => {
//       try {
//         const data = await getDailySoundUsage(); // เปลี่ยนเป็น service ของ chanting ของคุณ
//         const formatted = data.map((item) => ({
//           day: new Date(item.date).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           }),
//           chants: item.play_count,
//         }));
//         setChantingData(formatted);
//       } catch (err) {
//         setChantingError("ไม่สามารถโหลดข้อมูลสวดมนต์ได้");
//         console.error(err);
//       } finally {
//         setLoadingChanting(false);
//       }
//     };
//     fetchChantingData();
//   }, []);

//   // Fetch WordHealing Data
//   useEffect(() => {
//     const fetchWordHealingData = async () => {
//       try {
//         const data: DailyViewsByTitle[] = await getDailyWordHealingViews();
//         const formatted = data.map((item) => ({
//           day: new Date(item.date).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           }),
//           total_views: item.total_views,
//         }));
//         setWordHealingData(formatted);
//       } catch (err) {
//         setWordHealingError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
//         console.error(err);
//       } finally {
//         setLoadingWordHealing(false);
//       }
//     };
//     fetchWordHealingData();
//   }, []);

//   // Fetch Top Content Comparison
//   useEffect(() => {
//     const fetchTopContent = async () => {
//       setLoadingTopContent(true);
//       try {
//         const data = await getTopContentComparison();
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
// const categoryLabels: Record<string, { label: string; colorBg: string; colorText: string }> = {
//   Meditation: { label: "สมาธิ", colorBg: "bg-blue-50", colorText: "text-blue-700" },      // ฟ้าอ่อน
//   Breathing: { label: "ฝึกหายใจ", colorBg: "bg-orange-50", colorText: "text-orange-700" }, // ส้มอ่อน
//   ASMR: { label: "ASMR", colorBg: "bg-indigo-50", colorText: "text-indigo-700" },         // ม่วงอมฟ้าอ่อน
//   Chanting: { label: "สวดมนต์", colorBg: "bg-purple-50", colorText: "text-purple-700" },  // ม่วงอ่อน
//   Mirror: { label: "ระบายความรู้สึก", colorBg: "bg-pink-50", colorText: "text-pink-700" }, // ชมพูอ่อน
//   WordHealing: { label: "Word Healing", colorBg: "bg-green-50", colorText: "text-green-700" }, // เขียวอ่อน
// };


//   const categoryColors: Record<string, string> = {
//   Meditation: "#BFDBFE",    // bg-blue-100
//   Breathing: "#FFEDD5",     // bg-orange-100
//   ASMR: "#E0E7FF",          // bg-indigo-100
//   Chanting: "#EDE9FE",      // bg-purple-100
//   Mirror: "#FBCFE8",        // bg-pink-100
//   WordHealing: "#D1FAE5",   // bg-green-100
// };



//   // สร้าง data ใหม่ให้ BarChart
//   const topContentChartData = topContentData.map(item => ({
//     ...item,
//     categoryLabel: categoryLabels[item.category]?.label || item.category,
//   }));

//   // สร้าง summary จาก topContentData แบบไดนามิก
//   const summaryData = topContentData.map(item => {
//     const mapping = categoryLabels[item.category] || { label: item.category, colorBg: "bg-gray-100", colorText: "text-gray-700" };
//     return {
//       title: mapping.label,
//       value: item.unique_users,
//       bg: mapping.colorBg,
//       textColor: mapping.colorText,
//     };
//   });

//   // ถ้าต้องการรวมผู้ใช้ทั้งหมดด้วย
//   summaryData.push({
//     title: "ผู้ใช้ทั้งหมด",
//     value: topContentData.reduce((sum, item) => sum + item.unique_users, 0),
//     bg: "bg-yellow-100",
//     textColor: "text-yellow-700",
//   });

//   return (
//     <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
//       <header className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 md:gap-0">
//         <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ 👋</h1>
//         <input
//           type="text"
//           placeholder="Search..."
//           className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none w-full md:w-64"
//         />
//       </header>

//       <main className="p-6 space-y-6">
//         <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Left: Top Content Comparison */}
//           <DashboardCard title="ผู้ใช้ตามหมวดหมู่" className="col-span-1 md:col-span-2">
//   {loadingTopContent ? (
//     <p>กำลังโหลดข้อมูล...</p>
//   ) : topContentError ? (
//     <p className="text-red-500">{topContentError}</p>
//   ) : (
//     <div className="w-full h-64">
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart
//           data={topContentChartData}
//           margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
//         >
//           <XAxis
//             dataKey="categoryLabel"
//             tick={{ fill: "#6B7280", fontSize: 12 }} // สีเทาอ่อน
//           />
//           <YAxis
//             tick={{ fill: "#6B7280", fontSize: 12 }}
//             allowDecimals={false}
//           />
//           <Tooltip
//             contentStyle={{ backgroundColor: "#F3F4F6", borderRadius: 8 }}
//             formatter={(value: any, name: string) => [`${value} ผู้ใช้`, name]}
//           />
//           <Legend verticalAlign="top" height={36} />
          
//           {/* สร้างเส้นสำหรับแต่ละ category */}
//           {topContentChartData.map((entry, index) => (
//             <Line
//               key={entry.category}
//               type="monotone"
//               dataKey="unique_users"
//               name={categoryLabels[entry.category]?.label || entry.category}
//               stroke={categoryColors[entry.category] || "#8884d8"}
//               strokeWidth={3}
//               dot={{ r: 6, fill: categoryColors[entry.category] || "#8884d8" }}
//               activeDot={{ r: 8 }}
//               connectNulls
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   )}
// </DashboardCard>


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
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <MusicCard
//             data={musicData}
//             loading={loadingMusic}
//             error={musicError}
//             onViewMore={() => navigate("/admin/meditation-details")}
//           />
//           <ChantingCard
//             data={chantingData}
//             loading={loadingChanting}
//             error={chantingError}
//             onViewMore={() => navigate("/admin/chanting-details")}
//           />
//           <WordHealingCard
//             data={wordHealingData}
//             loading={loadingWordHealing}
//             error={wordHealingError}
//             onViewMore={() => navigate("/admin/wordhealing-details")}
//           />
//           <MirrorCard onViewMore={() => navigate("/admin/mirror-details")} />
//           <ASMRCard onViewMore={() => navigate("/admin/asmr-details")} />
//           <BreathingCard onViewMore={() => navigate("/admin/breathing-details")} />
//           <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-center text-gray-400">
//             ยังไม่มีข้อมูล
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DashboardContents;












//DashboardContents.tsx
import React, { useEffect, useState } from "react";
import { Line } from "@ant-design/charts";
import { useNavigate } from "react-router-dom";
import admin from "../../../assets/creative.png";
import {
  getTopContentComparison,
  TopContent,
} from "../../../services/https/dashboardcontents";

// Components
import MusicCard from "./meditation/meditationgard";
import ChantingCard from "./chanting/chantinggard";
import WordHealingCard from "./word-healing/wordgard";
import MirrorCard from "./mirror/mirrorgard";
import ASMRCard from "./asmr/asmrgard";
import BreathingCard from "./breathing/breatinggard";

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


  // Fetch Top Content Comparison
  useEffect(() => {
    const fetchTopContent = async () => {
      setLoadingTopContent(true);
      try {
        const data = await getTopContentComparison();
        console.log("ข้อมูลผู้ใช้ทั้งหมด",data);
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

  // Mapping category เป็นชื่อภาษาไทย + สีเพสเทลอ่อน
  const categoryLabels: Record<string, { label: string; colorBg: string; colorText: string }> = {
  Meditation: { label: "สมาธิ", colorBg: "bg-blue-50", colorText: "text-blue-700" },      // ฟ้าอ่อน
  Breathing: { label: "ฝึกหายใจ", colorBg: "bg-orange-50", colorText: "text-orange-700" }, // ส้มอ่อน
  ASMR: { label: "ASMR", colorBg: "bg-indigo-50", colorText: "text-indigo-700" },         // ม่วงอมฟ้าอ่อน
  Chanting: { label: "สวดมนต์", colorBg: "bg-purple-50", colorText: "text-purple-700" },  // ม่วงอ่อน
  Mirror: { label: "ระบายความรู้สึก", colorBg: "bg-pink-50", colorText: "text-pink-700" }, // ชมพูอ่อน
  WordHealing: { label: "Word Healing", colorBg: "bg-green-50", colorText: "text-green-700" }, // เขียวอ่อน
};

  // แปลง data ให้ตรงกับรูปแบบของ AntD Charts (long format)
  const lineData = topContentData.map((item) => ({
  category: categoryLabels[item.category]?.label || item.category,
  users: item.unique_users,
}));


  // สร้าง summary จาก topContentData แบบไดนามิก
  const summaryData = topContentData.map(item => {
  const mapping = categoryLabels[item.category] || { label: item.category, colorBg: "bg-gray-100", colorText: "text-gray-700" };
  return {
    title: mapping.label,
    value: item.unique_users,
    bg: mapping.colorBg,
    textColor: mapping.colorText,
  };
});

summaryData.push({
  title: "ผู้ใช้ทั้งหมด",
  value: topContentData.reduce((sum, item) => sum + item.unique_users, 0),
  bg: "bg-yellow-100",
  textColor: "text-yellow-800",
});

  // Config ของ Line Chart
  const lineConfig = {
  data: lineData,
  xField: "category",
  yField: "users",
  smooth: true,
  point: {
    size: 6,
    shape: "circle",
    style: (item: any) => ({
      fill: categoryLabels[item.category]?.colorBg || "#60A5FA",
      stroke: "#fff",
      lineWidth: 2,
    }),
  },
  tooltip: {
    showMarkers: true,
    formatter: (datum: any) => ({
      name: datum.category,
      value: `${datum.users} ผู้ใช้`,
    }),
  },
  legend: false,
  height: 300,
};



  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
      <header className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 md:gap-0">
  <div className="flex items-center gap-3">
    <img src={admin} alt="Admin" className="w-15 h-15" />
    <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ </h1>
  </div>
  <input
    type="text"
    placeholder="Search..."
    className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none w-full md:w-64"
  />
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
              <div className="w-full h-64">
                <Line {...lineConfig} />
              </div>
            )}
          </DashboardCard>

          {/* Right: Summary Card */}
          <DashboardCard title="Summary" className="col-span-1 flex flex-col gap-2">
            {summaryData.map((item, idx) => (
              <div
                key={idx}
                className={`${item.bg} ${item.textColor} rounded-lg flex justify-between items-center px-4 py-2`}
              >
                <span>{item.title}</span>
                <span className="font-semibold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </DashboardCard>
        </section>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MusicCard onViewMore={() => navigate("/admin/dashboard/contents/sound")}/>
          {/* <ChantingCard onViewMore={() => navigate("/admin/chanting-details")}/> */}
          <WordHealingCard onViewMore={() => navigate("/admin/wordhealing-details")}/>
          <MirrorCard onViewMore={() => navigate("/admin/mirror-details")} />
          {/* <ASMRCard onViewMore={() => navigate("/admin/asmr-details")} />
          <BreathingCard onViewMore={() => navigate("/admin/breathing-details")} /> */}
          {/* <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-center text-gray-400">
            ยังไม่มีข้อมูล
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default HomeContents;
