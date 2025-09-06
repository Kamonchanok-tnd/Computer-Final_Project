// // WordHealingCard.tsx
// import React, { useEffect, useState } from "react";
// import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
// import { getMonthlyWordHealingViews, MonthlyViewsByTitle } from "../../../../services/https/dashboardcontents";
// import MonthPickerMed from "../meditation/monthpicker";
// import { EllipsisOutlined } from "@ant-design/icons";

// interface WordHealingCardProps {
//   title?: string;
//   className?: string;
//   onViewMore?: () => void;
// }


// const COLORS = ["#FFC107", "#FFB300", "#FFCA28", "#FFD54F", "#FFE082", "#FFD740"];

// const WordHealingCard: React.FC<WordHealingCardProps> = ({
//   title = "Word Healing Content",
//   className = "bg-yellow-200",
//   onViewMore,
// }) => {
//   const [data, setData] = useState<MonthlyViewsByTitle[]>([]);
//   const [filteredData, setFilteredData] = useState<MonthlyViewsByTitle[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

//   // ดึงข้อมูลจาก API และสร้าง month, year, monthLabel
//   useEffect(() => {
//     const fetchMonthlyData = async () => {
//       setLoading(true);
//       try {
//         const res = await getMonthlyWordHealingViews();
//         console.log("ข้อมูลของ Word Healing", res);

//         const formatted = res
//   .map((item) => {
//     if (!item.date) return null; // ถ้า date ไม่มี ให้ข้าม
//     const dateObj = new Date(item.date); // แปลง ISO string เป็น Date
//     return {
//       ...item,
//       month: dateObj.getMonth() + 1, // 1-12
//       year: dateObj.getFullYear(),
//       monthLabel: dateObj.toLocaleString("th-TH", { month: "short", year: "numeric" }),
//     };
//   })
//   .filter((item): item is MonthlyViewsByTitle & { month: number; year: number; monthLabel: string } => item !== null);

//         setData(formatted);
//       } catch (err) {
//         console.error(err);
//         setError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMonthlyData();
//   }, []);

//   // Filter data ตามเดือนที่เลือก
//   useEffect(() => {
//     const month = selectedMonth.getMonth() + 1;
//     const year = selectedMonth.getFullYear();

//     if (data.length === 0) {
//       setFilteredData([]);
//       return;
//     }

//     const filtered = data.filter(
//       (item) => item.month === month && item.year === year
//     );
//     setFilteredData(filtered);
//   }, [selectedMonth, data]);

//   const totalViews = filteredData.reduce((sum, item) => sum + item.total_views, 0);

//   return (
//     <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
//       <h2 className="font-semibold mb-2 flex items-center justify-between">
//         {title}
//         {onViewMore && (
//           <button
//             onClick={onViewMore}
//             className="p-2 rounded-full bg-white/50 hover:bg-yellow-300 transition flex justify-center items-center"
//             title="ดูข้อมูลเพิ่มเติม"
//           >
//             <EllipsisOutlined className="text-white text-lg" />
//           </button>
//         )}
//       </h2>

//       {/* Month Picker */}
//       <div className="mb-3">
//         <MonthPickerMed value={selectedMonth} onChange={setSelectedMonth} />
//       </div>

//       {loading ? (
//         <p>กำลังโหลดข้อมูล...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : filteredData.length === 0 ? (
//         <p>ไม่มีข้อมูลในเดือนนี้</p>
//       ) : (
//         <>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//   data={filteredData}
//   dataKey="total_views"
//   nameKey="title"
//   cx="50%"
//   cy="50%"
//   outerRadius={100}
//   label={false} // แสดงเฉพาะชื่อเรื่อง
//   labelLine={false} // ปิดเส้น
// >
//   {filteredData.map((entry, index) => (
//     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//   ))}
// </Pie>


// <Tooltip
//   formatter={(value: number, name: string, entry) => {
//     const payload = entry?.payload as MonthlyViewsByTitle; // cast ให้ชัดเจน
//     return [`${value} ครั้ง`, payload?.title || name];
//   }}
// />


//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

        
//           {/* <p className="text-md font-medium mt-2 text-center">
//             เดือน: {selectedMonth.toLocaleString("th-TH", { month: "long", year: "numeric" })}
//           </p> */}

//           <p className="text-lg font-bold mt-2">รวม {totalViews} ครั้ง</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default WordHealingCard;




// WordHealingCard.tsx
import React, { useEffect, useState } from "react";
import { getMonthlyWordHealingViews, MonthlyViewsByTitle } from "../../../../services/https/dashboardcontents";
import MonthPickerMed from "../meditation/monthpicker";
import { EllipsisOutlined } from "@ant-design/icons";

interface WordHealingCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

// สีพาสเทล (พื้นหลัง)
const COLORS = ["#ffedd8ff", "#f9fad7ff", "#e1f8dcff", "#dff9fbff", "#d8e7fdff", "#e5e1f8ff", "#fce3fcff"];

// สีตัวอักษรที่เข้ากับพื้นหลัง (โทนเข้มกว่า)
const TEXT_COLORS = ["#FF7043", "#FBC02D", "#388E3C", "#0288D1", "#1976D2", "#7B1FA2", "#C2185B"];

const WordHealingCard: React.FC<WordHealingCardProps> = ({
  title = "Word Healing Content",
  className = "bg-white",
  onViewMore,
}) => {
  const [data, setData] = useState<MonthlyViewsByTitle[]>([]);
  const [filteredData, setFilteredData] = useState<MonthlyViewsByTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const res = await getMonthlyWordHealingViews();
        const formatted = res
          .map((item) => {
            if (!item.date) return null;
            const dateObj = new Date(item.date);
            return {
              ...item,
              month: dateObj.getMonth() + 1,
              year: dateObj.getFullYear(),
              monthLabel: dateObj.toLocaleString("th-TH", { month: "short", year: "numeric" }),
            };
          })
          .filter(
            (item): item is MonthlyViewsByTitle & { month: number; year: number; monthLabel: string } => item !== null
          );
        setData(formatted);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyData();
  }, []);

  // Filter data ตามเดือนที่เลือก
  useEffect(() => {
    const month = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();
    const filtered = data.filter((item) => item.month === month && item.year === year);
    setFilteredData(filtered);
  }, [selectedMonth, data]);

  const totalViews = filteredData.reduce((sum, item) => sum + item.total_views, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title}
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-2 rounded-full bg-white/50 hover:bg-yellow-300 transition flex justify-center items-center"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <EllipsisOutlined className="text-gray-600 text-lg" />
          </button>
        )}
      </h2>

      {/* Month Picker */}
      <div className="mb-3">
        <MonthPickerMed value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredData.length === 0 ? (
        <p>ไม่มีข้อมูลในเดือนนี้</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {filteredData.map((item, index) => {
              const bgColor = COLORS[index % COLORS.length];
              const textColor = TEXT_COLORS[index % TEXT_COLORS.length];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg shadow-sm"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="font-bold">{item.total_views} ครั้ง</span>
                </div>
              );
            })}
          </div>

          <p className="text-lg font-bold mt-4 text-center text-gray-700">รวม {totalViews} ครั้ง</p>
        </>
      )}
    </div>
  );
};

export default WordHealingCard;
