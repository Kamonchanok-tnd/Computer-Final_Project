// // ChantingCard.tsx
// import React, { useEffect, useState } from "react";
// import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts";
// import { EllipsisOutlined } from "@ant-design/icons"; // ใช้ Antd Ellipsis
// import { getSoundChanting } from "../../../../services/https/dashboardcontents";

// interface ChantingData {
//   day: string;
//   chants: number;
// }

// interface ChantingCardProps {
//   title?: string; // ชื่อการ์ด
//   className?: string; // สีหรือ style เพิ่มเติม
//   onViewMore?: () => void; // callback เมื่อกดดูข้อมูลเพิ่มเติม
// }

// const ChantingCard: React.FC<ChantingCardProps> = ({
//   title = "สวดมนต์",
//   className = "bg-green-200", // เขียวพาสเทลอ่อน
//   onViewMore,
// }) => {
//   const [data, setData] = useState<ChantingData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchChantingData = async () => {
//       try {
//         const response = await getSoundChanting();
//         const formattedData = response.map((item: any) => ({
//           day: new Date(item.date).toLocaleDateString("th-TH", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           }),
//           chants: item.play_count,
//         }));
//         setData(formattedData);
//       } catch (err) {
//         setError("ไม่สามารถโหลดข้อมูลสวดมนต์ได้");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChantingData();
//   }, []);

//   const totalChants = data.reduce((sum, item) => sum + item.chants, 0);

//   return (
//     <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
//       <h2 className="font-semibold mb-2 flex items-center justify-between">
//         {title}
//         {onViewMore && (
//           <button
//             onClick={onViewMore}
//             className="p-2 rounded-full bg-white/50 hover:bg-green-300 transition flex justify-center items-center"
//             title="ดูข้อมูลเพิ่มเติม"
//           >
//             <EllipsisOutlined className="text-white text-lg" />
//           </button>
//         )}
//       </h2>

//       {loading ? (
//         <p>กำลังโหลดข้อมูล...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : (
//         <>
//           <div className="h-48">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={data}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="day" />
//                 <Tooltip />
//                 <Bar dataKey="chants" fill="#4CAF50" radius={[10, 10, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//           <p className="text-lg font-bold mt-2">รวม {totalChants} ครั้ง</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default ChantingCard;
