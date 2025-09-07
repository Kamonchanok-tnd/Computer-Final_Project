// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
// } from "recharts";
// import { useNavigate } from "react-router-dom";
// import { getSoundFourType } from "../../../services/https/dashboardcontents";
// import { DatePicker } from "antd";
// import moment from "moment";
// import { BookOpenCheck, ListMusic, Play } from "lucide-react";

// interface MusicData {
//   month: string; // "ส.ค. 2568"
//   category: string; // สมาธิ, สวดมนต์, ฝึกหายใจ, asmr
//   plays: number;
//   year: number; // ปีสำหรับกรอง
// }

// const DashboardContents: React.FC = () => {
//   const [musicData, setMusicData] = useState<MusicData[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [selectedYear, setSelectedYear] = useState<number | null>(null);
//   const navigate = useNavigate();

//   const categoryRoutes: Record<string, string> = {
//     "สมาธิ": "/admin/meditation-details",
//     "สวดมนต์": "/admin/chanting-details",
//     "ฝึกหายใจ": "/admin/breathing-details",
//     "asmr": "/admin/asmr-details",
//   };

//   const categoryColors: Record<string, string> = {
//     "สมาธิ": "#4CAF50",
//     "สวดมนต์": "#2196F3",
//     "ฝึกหายใจ": "#FF9800",
//     "asmr": "#9C27B0",
//   };

//   useEffect(() => {
//     const fetchMusicData = async () => {
//       try {
//         const res = await getSoundFourType();
//         console.log("Raw data from API (four-type):", res);

//         const formattedData: MusicData[] = res.reduce((acc: MusicData[], item: any) => {
//           const monthStr = new Date(item.year, item.month - 1).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//           });

//           const existing = acc.find(d => d.month === monthStr && d.category === item.category);
//           if (existing) {
//             existing.plays += item.play_count;
//           } else {
//             acc.push({ month: monthStr, category: item.category, plays: item.play_count, year: item.year });
//           }
//           return acc;
//         }, []);

//         setMusicData(formattedData);

//         // ตั้งปีล่าสุดเป็น default
//         if (formattedData.length > 0) {
//           const latestYear = Math.max(...formattedData.map(d => d.year));
//           setSelectedYear(latestYear);
//         }
//       } catch (err) {
//         console.error("Error fetching music data:", err);
//       }
//     };

//     fetchMusicData();
//   }, []);

//   // Filter ตามปีที่เลือก
//   const filteredData = selectedYear
//     ? musicData.filter(d => d.year === selectedYear)
//     : musicData;

//   // รวม plays ต่อเดือน (รวมทุก category)
//   const monthlyData = Object.values(
//     filteredData.reduce((acc: Record<string, { month: string; plays: number }>, item) => {
//       if (!acc[item.month]) {
//         acc[item.month] = { month: item.month, plays: 0 };
//       }
//       acc[item.month].plays += item.plays;
//       return acc;
//     }, {})
//   );

//   // Pivot data สำหรับกราฟหลายเส้น
//   const pivotData = Object.values(
//     filteredData.reduce((acc: Record<string, any>, item) => {
//       if (!acc[item.month]) {
//         acc[item.month] = { month: item.month };
//       }
//       acc[item.month][item.category] = (acc[item.month][item.category] || 0) + item.plays;
//       return acc;
//     }, {})
//   );

//   const totalPlays = filteredData.reduce((sum, item) => sum + item.plays, 0);
//   const uniqueCategories = new Set(filteredData.map((item) => item.category)).size;
//   const uniqueMonths = new Set(filteredData.map((item) => item.month)).size;
//   const avgPerMonth = uniqueMonths > 0 ? (totalPlays / uniqueMonths).toFixed(1) : 0;

//   const trackCount: Record<string, number> = {};
//   filteredData.forEach((item) => {
//     trackCount[item.category] = (trackCount[item.category] || 0) + item.plays;
//   });
//   const topTracks = Object.entries(trackCount)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5);

//   const handleCategoryClick = (name: string) => {
//     setSelectedCategory(selectedCategory === name ? null : name);
//     const route = categoryRoutes[name];
//     if (route) {
//       navigate(route);
//     }
//   };

//   const availableYears = Array.from(new Set(musicData.map(d => d.year))).sort((a, b) => b - a);

//   return (
//     <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
//       {/* สรุปยอดรวม */}
//       <div className="grid grid-cols-3 gap-4">
//       <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl  p-6 text-center flex justify-around items-center gap-8 ">
//            <div className="bg-white  text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
//              <ListMusic size={30} className=""/>
//            </div>
//            <div>
//             <p className="text-gray-600">รวมการเล่น</p>
//             <p className="text-2xl font-bold text-gray-600">{totalPlays} ครั้ง</p>
//            </div>
      
//           </div>
//        <div className="bg-gradient-to-br from-[#c7eab7] to-[#d7f2ca] rounded-2xl  p-6 text-center flex justify-around items-center gap-8 ">
//                   <div className="bg-white  text-[#a9cd99] p-4 rounded-full shadow-lg shadow-[#a9cd99]/20">
//                     <BookOpenCheck size={30} className=""/>
//                   </div>
//                   <div>
//                    <p className="text-gray-600">จำนวนประเภท</p>
//                    <p className="text-2xl font-bold text-gray-600">{uniqueCategories} ประเภท</p>
//                   </div>
             
//                  </div>
//         <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl  p-6 text-center flex justify-around items-center gap-8 ">
//                    <div className="bg-white  text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
//                      <BookOpenCheck size={30} className=""/>
//                    </div>
//                    <div>
//                     <p className="text-gray-600">เฉลี่ยต่อเดือน</p>
//                     <p className="text-2xl font-bold text-gray-600">{avgPerMonth} ครั้ง</p>
//                    </div>
              
//                   </div>
//       </div>

//       {/* Top Categories */}
//       <div className="bg-blue-100 rounded-2xl shadow-md p-6">
//         <h2 className="font-semibold text-lg mb-2">Top Categories</h2>
//         <div className="flex flex-wrap gap-2 mb-4">
//           {topTracks.map(([name], idx) => (
//             <button
//               key={idx}
//               onClick={() => handleCategoryClick(name)}
//               className={`px-3 py-1 rounded-lg transition ${
//                 selectedCategory === name
//                   ? "bg-blue-500 text-white"
//                   : "bg-blue-200 hover:bg-blue-300"
//               }`}
//             >
//               {name}
//             </button>
//           ))}
//         </div>
//         <ol className="list-decimal ml-6 space-y-1">
//           {topTracks.map(([name, count], idx) => (
//             <li key={idx} className="flex justify-between">
//               <span>{name}</span>
//               <span className="font-bold">{count} ครั้ง</span>
//             </li>
//           ))}
//         </ol>
//       </div>

//       {/* กลุ่มสองการ์ดล่างพร้อม DatePicker */}
//       <div className="space-y-4 bg-white rounded-2xl shadow-md p-6">
//         {/* ตัวเลือกปี */}
//         <div className="flex justify-end">
//           <DatePicker
//             picker="year"
//             value={selectedYear ? moment(String(selectedYear), "YYYY") : null}
//             onChange={(date, dateString) => setSelectedYear(date ? date.year() : null)}
//           />
//         </div>

//         {/* Trend Line รวมทุก category
//         <div className="bg-green-100 rounded-2xl shadow-md p-6">
//           <h2 className="font-semibold text-lg mb-4">Trend Line (รวมทุก Category ต่อเดือน)</h2>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <Tooltip formatter={(value: any) => [`${value} ครั้ง`, "เล่น"]} />
//                 <Line
//                   type="monotone"
//                   dataKey="plays"
//                   stroke="#4CAF50"
//                   strokeWidth={3}
//                   dot={{ r: 5 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div> */}

//         {/* Trend Line แยกตาม category */}
//         <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
//           <h2 className="font-semibold text-lg mb-4">Trend Line (แยกตาม Category)</h2>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={pivotData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <Tooltip />
//                 <Legend />
//                 {Object.keys(categoryRoutes).map((cat, idx) => (
//                   <Line
//                     key={idx}
//                     type="monotone"
//                     dataKey={cat}
//                     stroke={categoryColors[cat] || "#000000"}
//                     strokeWidth={2}
//                     dot={false}
//                   />
//                 ))}
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardContents;





// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
//   BarChart,
//   Bar,
// } from "recharts";
// import {
//   getSoundFourType,
//   getDailyBreathingUsage,
//   getDailyASMRUsage,
//   getDailyMeditationUsage,
//   getDailyChantingUsage,
// } from "../../../services/https/dashboardcontents";
// import { DatePicker } from "antd";
// import moment from "moment";
// import { BookOpenCheck, ListMusic } from "lucide-react";
// import dayjs, { Dayjs } from "dayjs";
// dayjs.locale("th");

// interface MusicData {
//   month: string;
//   category: string;
//   plays: number;
//   year: number;
// }

// interface TrackData {
//   sound_name: string;
//   plays: number;
//   category?: string;
// }

// const DashboardContents: React.FC = () => {
//   const [musicData, setMusicData] = useState<MusicData[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [selectedYear, setSelectedYear] = useState<number | null>(null);
//   const [categoryTracks, setCategoryTracks] = useState<TrackData[]>([]);

//   const categoryColors: Record<string, string> = {
//     "สมาธิ": "#4CAF50",
//     "สวดมนต์": "#2196F3",
//     "ฝึกหายใจ": "#FF9800",
//     "asmr": "#9C27B0",
//   };

//   const categoryService: Record<string, () => Promise<any[]>> = {
//     "สมาธิ": getDailyMeditationUsage,
//     "สวดมนต์": getDailyChantingUsage,
//     "ฝึกหายใจ": getDailyBreathingUsage,
//     "asmr": getDailyASMRUsage,
//   };

//   // Fetch summary data
//   useEffect(() => {
//     const fetchMusicData = async () => {
//       try {
//         const res = await getSoundFourType();
//         const formattedData: MusicData[] = res.reduce((acc: MusicData[], item: any) => {
//           const monthStr = new Date(item.year, item.month - 1).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//           });
//           const existing = acc.find(d => d.month === monthStr && d.category === item.category);
//           if (existing) existing.plays += item.play_count;
//           else acc.push({ month: monthStr, category: item.category, plays: item.play_count, year: item.year });
//           return acc;
//         }, []);
//         setMusicData(formattedData);
//         if (formattedData.length > 0) {
//           const latestYear = Math.max(...formattedData.map(d => d.year));
//           setSelectedYear(latestYear);
//         }
//       } catch (err) {
//         console.error("Error fetching music data:", err);
//       }
//     };
//     fetchMusicData();
//   }, []);

//   // Filter ตามปี
//   const filteredData = selectedYear
//     ? musicData.filter(d => d.year === selectedYear)
//     : musicData;

//   const totalPlays = filteredData.reduce((sum, item) => sum + item.plays, 0);
//   const uniqueCategories = new Set(filteredData.map(d => d.category)).size;
//   const uniqueMonths = new Set(filteredData.map(d => d.month)).size;
//   const avgPerMonth = uniqueMonths > 0 ? (totalPlays / uniqueMonths).toFixed(1) : 0;

//   // Pivot data สำหรับ Trend Line
//   const pivotData = Object.values(
//     filteredData.reduce((acc: Record<string, any>, item) => {
//       if (!acc[item.month]) acc[item.month] = { month: item.month };
//       acc[item.month][item.category] = (acc[item.month][item.category] || 0) + item.plays;
//       return acc;
//     }, {})
//   );

//   // กด category เพื่อโหลด Top 3 เพลง
//   const handleCategoryClick = async (name: string) => {
//     setSelectedCategory(name === "All" ? null : name);

//     if (name === "All") {
//       // โหลด Top 3 ของทุกประเภท
//       const allTracks: TrackData[] = [];
//       for (const cat of Object.keys(categoryService)) {
//         try {
//           const res = await categoryService[cat]();
//           const formattedTracks: TrackData[] = res.map((item: any) => ({
//             sound_name: item.sound_name,
//             plays: item.play_count ?? item.plays ?? 0,
//             category: cat,
//           }));
//           formattedTracks.sort((a, b) => b.plays - a.plays);
//           allTracks.push(...formattedTracks.slice(0, 3));
//         } catch (err) {
//           console.error(`Error fetching tracks for ${cat}:`, err);
//         }
//       }
//       setCategoryTracks(allTracks);
//     } else if (categoryService[name]) {
//       try {
//         const res = await categoryService[name]();
//         const formattedTracks: TrackData[] = res.map((item: any) => ({
//           sound_name: item.sound_name,
//           plays: item.play_count ?? item.plays ?? 0,
//         }));
//         formattedTracks.sort((a, b) => b.plays - a.plays);
//         setCategoryTracks(formattedTracks.slice(0, 3)); // Top 3
//       } catch (err) {
//         console.error("Error fetching category tracks:", err);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
//       {/* สรุปยอดรวม */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-6 text-center flex justify-around items-center gap-8 ">
//           <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
//             <ListMusic size={30} />
//           </div>
//           <div>
//             <p className="text-gray-600">รวมการเล่น</p>
//             <p className="text-2xl font-bold text-gray-600">{totalPlays} ครั้ง</p>
//           </div>
//         </div>
//         {/* <div className="bg-gradient-to-br from-[#c7eab7] to-[#d7f2ca] rounded-2xl p-6 text-center flex justify-around items-center gap-8 ">
//           <div className="bg-white text-[#a9cd99] p-4 rounded-full shadow-lg shadow-[#a9cd99]/20">
//             <BookOpenCheck size={30} />
//           </div>
//           <div>
//             <p className="text-gray-600">จำนวนประเภท</p>
//             <p className="text-2xl font-bold text-gray-600">{uniqueCategories} ประเภท</p>
//           </div>
//         </div> */}
//         <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-6 text-center flex justify-around items-center gap-8 ">
//           <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
//             <BookOpenCheck size={30} />
//           </div>
//           <div>
//             <p className="text-gray-600">เฉลี่ยต่อเดือน</p>
//             <p className="text-2xl font-bold text-gray-600">{avgPerMonth} ครั้ง</p>
//           </div>
//         </div>


//           <div className="bg-gradient-to-br from-[#c7eab7] to-[#d7f2ca] rounded-2xl p-6 text-center space-y-4">
//   <p className="text-gray-600 font-semibold">จำนวนครั้งแต่ละประเภท</p>
//   <div className="flex flex-col gap-2">
//     {Object.entries(
//       filteredData.reduce((acc: Record<string, number>, item) => {
//         acc[item.category] = (acc[item.category] || 0) + item.plays;
//         return acc;
//       }, {})
//     ).map(([category, plays]) => (
//       <div key={category} className="flex justify-between bg-white/50 rounded-lg px-4 py-2 shadow-sm">
//         <span className="font-medium">{category}</span>
//         <span className="font-bold">{plays} ครั้ง</span>
//       </div>
//     ))}
//   </div>
// </div>


//       </div>
      

      

//       {/* Top Categories */}
//       <div className="bg-blue-100 rounded-2xl shadow-md p-6">
//         <h2 className="font-semibold text-lg mb-2">Top Categories</h2>

//         {/* ปุ่มเลือกประเภท */}
//         <div className="flex flex-wrap gap-2 mb-4">
//           {["All", "สวดมนต์", "ฝึกหายใจ", "asmr", "สมาธิ"].map((name, idx) => (
//             <button
//               key={idx}
//               onClick={() => handleCategoryClick(name)}
//               className={`px-3 py-1 rounded-lg transition ${
//                 selectedCategory === name || (!selectedCategory && name === "All")
//                   ? "bg-blue-500 text-white"
//                   : "bg-blue-200 hover:bg-blue-300"
//               }`}
//             >
//               {name}
//             </button>
//           ))}
//         </div>

//         {/* แสดง Top Tracks */}
//         {categoryTracks.length > 0 && (
//           <div className="bg-orange-100 rounded-2xl shadow-md p-6 mt-4">
//             <h2 className="font-semibold text-lg mb-2 text-orange-800">
//               {selectedCategory === null ? "Top Tracks (รวมทุกประเภท)" : `Top 3 ${selectedCategory}`}
//             </h2>
//             <ol className="list-decimal ml-6 space-y-1 text-orange-900">
//               {categoryTracks.map((item, idx) => (
//                 <li key={idx} className="flex justify-between">
//                   <span>
//                     {item.sound_name} {item.category ? `(${item.category})` : ""}
//                   </span>
//                   <span className="font-bold">{item.plays} ครั้ง</span>
//                 </li>
//               ))}
//             </ol>
//           </div>
//         )}
//       </div>

//       {/* Trend Stacked Bar (รวมทุก category) */}
// <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
//   <h2 className="font-semibold text-lg mb-4">Trend (แยกตาม Category)</h2>
//   <div className="h-64">
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={pivotData}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="month" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         {Object.keys(categoryColors).map((cat, idx) => (
//           <Bar
//             key={idx}
//             dataKey={cat}
//             stackId="a"
//             fill={categoryColors[cat] || "#000000"}
//           />
//         ))}
//       </BarChart>
//     </ResponsiveContainer>
//   </div>
// </div>

//     </div>
//   );
// };

// export default DashboardContents;




import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  getSoundFourType,
  getDailyBreathingUsage,
  getDailyASMRUsage,
  getDailyMeditationUsage,
  getDailyChantingUsage,
} from "../../../services/https/dashboardcontents";
import { DatePicker, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { BookOpenCheck, ListMusic } from "lucide-react";
dayjs.locale("th");
import thTH from "antd/locale/th_TH";

interface MusicData {
  month: string; // ชื่อเดือนภาษาไทย
  monthIndex: number; // 0-11
  category: string;
  plays: number;
  year: number;
}

interface TrackData {
  sound_name: string;
  plays: number;
  category?: string;
}

const DashboardContents: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 0-11
  const [categoryTracks, setCategoryTracks] = useState<TrackData[]>([]);

  const categoryColors: Record<string, string> = {
    "สมาธิ": "#7bed7f",   // เขียวมิ้นต์
    "สวดมนต์": "#AFD5F0", // ฟ้าอ่อน
    "ฝึกหายใจ": "#ffbc59", // ส้มพาสเทล
    "asmr": "#ee8fff",     // ม่วงชมพู
  };

  const categoryService: Record<string, () => Promise<any[]>> = {
    "สมาธิ": getDailyMeditationUsage,
    "สวดมนต์": getDailyChantingUsage,
    "ฝึกหายใจ": getDailyBreathingUsage,
    "asmr": getDailyASMRUsage,
  };

  // Fetch summary data
  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const res = await getSoundFourType();
        const formattedData: MusicData[] = res.reduce((acc: MusicData[], item: any) => {
          const monthIndex = item.month - 1; // เก็บเป็น 0-11
          const monthStr = new Date(item.year, monthIndex).toLocaleDateString("th-TH", {
              month: "short",
              year: "numeric",
          }).replace(/^(\d+)/, (_, y) => String(Number(y) - 543)); // แปลงปี พ.ศ. -> ค.ศ.

          const existing = acc.find(d => d.month === monthStr && d.category === item.category);
          if (existing) existing.plays += item.play_count;
          else acc.push({
            month: monthStr,
            monthIndex,
            category: item.category,
            plays: item.play_count,
            year: item.year
          });
          return acc;
        }, []);
        setMusicData(formattedData);

        if (formattedData.length > 0) {
          const latestYear = Math.max(...formattedData.map(d => d.year));
          setSelectedYear(latestYear);
        }
      } catch (err) {
        console.error("Error fetching music data:", err);
      }
    };
    fetchMusicData();
  }, []);

  // Filter ตามปีและเดือน
  const filteredData = musicData.filter(d => {
    const yearMatch = selectedYear ? d.year === selectedYear : true;
    const monthMatch = selectedMonth !== null ? d.monthIndex === selectedMonth : true;
    return yearMatch && monthMatch;
  });

  const totalPlays = filteredData.reduce((sum, item) => sum + item.plays, 0);
  const uniqueMonths = new Set(filteredData.map(d => d.month)).size;
  const avgPerMonth = uniqueMonths > 0 ? (totalPlays / uniqueMonths).toFixed(1) : 0;

  // Pivot data สำหรับ stacked bar chart
  const pivotData = Object.values(
    filteredData.reduce((acc: Record<string, any>, item) => {
      if (!acc[item.month]) acc[item.month] = { month: item.month };
      acc[item.month][item.category] = (acc[item.month][item.category] || 0) + item.plays;
      return acc;
    }, {})
  );

  // กด category เพื่อโหลด Top 3 เพลง
  const handleCategoryClick = async (name: string) => {
  setSelectedCategory(name === "All" ? null : name);

  const combineTracks = (tracks: TrackData[]) => {
    const grouped: Record<string, TrackData> = {};
    tracks.forEach(track => {
      if (grouped[track.sound_name]) {
        grouped[track.sound_name].plays += track.plays;
      } else {
        grouped[track.sound_name] = { ...track };
      }
    });
    return Object.values(grouped);
  };

  if (name === "All") {
    const allTracks: TrackData[] = [];
    for (const cat of Object.keys(categoryService)) {
      try {
        const res = await categoryService[cat]();
        const formattedTracks: TrackData[] = res.map((item: any) => ({
          sound_name: item.sound_name,
          plays: item.play_count ?? item.plays ?? 0,
          category: cat,
        }));
        allTracks.push(...formattedTracks);
      } catch (err) {
        console.error(`Error fetching tracks for ${cat}:`, err);
      }
    }
    const combined = combineTracks(allTracks);
    combined.sort((a, b) => b.plays - a.plays);
    setCategoryTracks(combined.slice(0, 3));
  } else if (categoryService[name]) {
    try {
      const res = await categoryService[name]();
      const formattedTracks: TrackData[] = res.map((item: any) => ({
        sound_name: item.sound_name,
        plays: item.play_count ?? item.plays ?? 0,
      }));
      const combined = combineTracks(formattedTracks);
      combined.sort((a, b) => b.plays - a.plays);
      setCategoryTracks(combined.slice(0, 3));
    } catch (err) {
      console.error("Error fetching category tracks:", err);
    }
  }
};


  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-6 text-center flex justify-around items-center gap-8 ">
          <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
            <ListMusic size={30} />
          </div>
          <div>
            <p className="text-gray-600">รวมการเล่น</p>
            <p className="text-2xl font-bold text-gray-600">{totalPlays} ครั้ง</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f2f8] rounded-2xl p-6 text-center flex justify-around items-center gap-8 ">
          <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
            <BookOpenCheck size={30} />
          </div>
          <div>
            <p className="text-gray-600">เฉลี่ยต่อเดือน</p>
            <p className="text-2xl font-bold text-gray-600">{avgPerMonth} ครั้ง</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#c7eab7] to-[#d7f2ca] rounded-2xl p-6 text-center space-y-4">
          <p className="text-gray-600 font-semibold">จำนวนครั้งแต่ละประเภท</p>
          <div className="flex flex-col gap-2">
            {Object.entries(
              filteredData.reduce((acc: Record<string, number>, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.plays;
                return acc;
              }, {})
            ).map(([category, plays]) => (
              <div key={category} className="flex justify-between bg-white/50 rounded-lg px-4 py-2 shadow-sm">
                <span className="font-medium">{category}</span>
                <span className="font-bold">{plays} ครั้ง</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-blue-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-2">Top Categories</h2>

        {/* ปุ่มเลือกประเภท */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", "สวดมนต์", "ฝึกหายใจ", "asmr", "สมาธิ"].map((name, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(name)}
              className={`px-3 py-1 rounded-lg transition ${
                selectedCategory === name || (!selectedCategory && name === "All")
                  ? "bg-blue-500 text-white"
                  : "bg-blue-200 hover:bg-blue-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* แสดง Top Tracks */}
        {categoryTracks.length > 0 && (
          <div className="bg-blue-50  rounded-2xl shadow-md p-6 mt-4">
            <h2 className="font-semibold text-lg mb-2 text-grey-800">
              {selectedCategory === null ? "Top Tracks (รวมทุกประเภท)" : `Top 3 ${selectedCategory}`}
            </h2>
            <ol className="list-decimal ml-6 space-y-1 text-grey-900">
              {categoryTracks.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {item.sound_name} {item.category ? `(${item.category})` : ""}
                  </span>
                  <span className="font-bold">{item.plays} ครั้ง</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Trend Stacked Bar พร้อมเลือกปี/เดือน */}
      <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Trend (แยกตาม Category)</h2>
          <ConfigProvider locale={thTH}>
            <div className="flex gap-2">
              <DatePicker
                picker="month"
                value={selectedMonth !== null ? dayjs().month(selectedMonth) : dayjs()} // เดือนปัจจุบันถ้าไม่เลือก
                onChange={(date: Dayjs | null) => setSelectedMonth(date ? date.month() : null)}
                placeholder="เลือกเดือน"
                className="rounded-lg"
                format="MMMM YYYY"
              />
            </div>
          </ConfigProvider>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pivotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(categoryColors).map((cat, idx) => (
                <Bar
                  key={idx}
                  dataKey={cat}
                  stackId="a"
                  fill={categoryColors[cat] || "#000000"}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardContents;
