 import React, { useEffect, useState } from "react";
 import {
   BarChart,
   Bar,
   LineChart,
   Line,
   XAxis,
   Tooltip,
   ResponsiveContainer,
   CartesianGrid,
 } from "recharts";
 import {
   getDailySoundUsage,
   DailySoundUsage,
 } from "../../../../services/https/dashboardcontents";
 
 interface MusicData {
   date: string; // raw date
   day: string; // formatted date
   plays: number;
   sound_name: string;
 }
 
 const DashboardMeditation: React.FC = () => {
   const [musicData, setMusicData] = useState<MusicData[]>([]);
 
   useEffect(() => {
     const fetchMusicData = async () => {
       try {
         const res = await getDailySoundUsage();
         console.log("Raw data from API:", res);
 
         const formattedData: MusicData[] = Array.isArray(res)
           ? res.map((item) => ({
               date: item.date, // raw ISO string
               day: new Date(item.date).toLocaleDateString("th-TH", {
                 year: "numeric",
                 month: "short",
                 day: "numeric",
               }),
               plays: item.play_count,
               sound_name: (item as any).sound_name || "ไม่ทราบชื่อเพลง",
             }))
           : [];
 
         console.log("Formatted data for chart:", formattedData);
         setMusicData(formattedData);
       } catch (err) {
         console.error("Error fetching music data:", err);
       }
     };
 
     fetchMusicData();
   }, []);
 
   // รวมจำนวนครั้งทั้งหมด
   const totalPlays = musicData.reduce((sum, item) => sum + item.plays, 0);
 
   // จำนวนเพลงไม่ซ้ำ
   const uniqueSongs = new Set(musicData.map((item) => item.sound_name)).size;
 
   // ค่าเฉลี่ยต่อวัน
   const uniqueDays = new Set(musicData.map((item) => item.day)).size;
   const avgPerDay = uniqueDays > 0 ? (totalPlays / uniqueDays).toFixed(1) : 0;
 
   // Top Tracks
   const trackCount: Record<string, number> = {};
   musicData.forEach((item) => {
     trackCount[item.sound_name] = (trackCount[item.sound_name] || 0) + item.plays;
   });
   const topTracks = Object.entries(trackCount)
     .sort((a, b) => b[1] - a[1])
     .slice(0, 5);
 
   return (
     <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
       {/* สรุปยอดรวม */}
       <div className="grid grid-cols-3 gap-4">
         <div className="bg-white rounded-2xl shadow-md p-6 text-center">
           <p className="text-gray-600">รวมการเล่น</p>
           <p className="text-2xl font-bold">{totalPlays} ครั้ง</p>
         </div>
         <div className="bg-white rounded-2xl shadow-md p-6 text-center">
           <p className="text-gray-600">จำนวนเพลง</p>
           <p className="text-2xl font-bold">{uniqueSongs} เพลง</p>
         </div>
         <div className="bg-white rounded-2xl shadow-md p-6 text-center">
           <p className="text-gray-600">เฉลี่ยต่อวัน</p>
           <p className="text-2xl font-bold">{avgPerDay} ครั้ง</p>
         </div>
       </div>
 
       {/* Top Tracks */}
       <div className="bg-blue-100 rounded-2xl shadow-md p-6">
         <h2 className="font-semibold text-lg mb-2">Top Tracks</h2>
         <ol className="list-decimal ml-6 space-y-1">
           {topTracks.map(([name, count], idx) => (
             <li key={idx} className="flex justify-between">
               <span>{name}</span>
               <span className="font-bold">{count} ครั้ง</span>
             </li>
           ))}
         </ol>
       </div>
 
       {/* Trend Line */}
       <div className="bg-green-100 rounded-2xl shadow-md p-6">
         <h2 className="font-semibold text-lg mb-4">Trend Line (การเล่นต่อวัน)</h2>
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={musicData}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis
                 dataKey="date"
                 tickFormatter={(value) =>
                   new Date(value).toLocaleDateString("th-TH", {
                     day: "numeric",
                     month: "short",
                   })
                 }
               />
               <Tooltip
                 labelFormatter={(value) =>
                   new Date(value).toLocaleDateString("th-TH", {
                     year: "numeric",
                     month: "short",
                     day: "numeric",
                   })
                 }
                 formatter={(value: any) => [`${value} ครั้ง`, "plays"]}
               />
               <Line
                 type="monotone"
                 dataKey="plays"
                 stroke="#4CAF50"
                 strokeWidth={3}
                 dot={{ r: 5 }}
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
       </div>
     </div>
   );
 };
 
 export default DashboardMeditation;
 