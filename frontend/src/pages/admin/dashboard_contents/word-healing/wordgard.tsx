// WordHealingCard.tsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getMonthlyWordHealingViews, MonthlyViewsByTitle } from "../../../../services/https/dashboardcontents";
import MonthPickerMed from "../meditation/monthpicker";
import { EllipsisOutlined } from "@ant-design/icons";

interface WordHealingCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}


const COLORS = ["#FFC107", "#FFB300", "#FFCA28", "#FFD54F", "#FFE082", "#FFD740"];

const WordHealingCard: React.FC<WordHealingCardProps> = ({
  title = "Word Healing Content",
  className = "bg-yellow-200",
  onViewMore,
}) => {
  const [data, setData] = useState<MonthlyViewsByTitle[]>([]);
  const [filteredData, setFilteredData] = useState<MonthlyViewsByTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // ดึงข้อมูลจาก API และสร้าง month, year, monthLabel
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const res = await getMonthlyWordHealingViews();
        console.log("ข้อมูลของ Word Healing", res);

        const formatted = res
  .map((item) => {
    if (!item.date) return null; // ถ้า date ไม่มี ให้ข้าม
    const dateObj = new Date(item.date); // แปลง ISO string เป็น Date
    return {
      ...item,
      month: dateObj.getMonth() + 1, // 1-12
      year: dateObj.getFullYear(),
      monthLabel: dateObj.toLocaleString("th-TH", { month: "short", year: "numeric" }),
    };
  })
  .filter((item): item is MonthlyViewsByTitle & { month: number; year: number; monthLabel: string } => item !== null);

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

    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    const filtered = data.filter(
      (item) => item.month === month && item.year === year
    );
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
            <EllipsisOutlined className="text-white text-lg" />
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
  data={filteredData}
  dataKey="total_views"
  nameKey="title"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label={false} // แสดงเฉพาะชื่อเรื่อง
  labelLine={false} // ปิดเส้น
>
  {filteredData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>


<Tooltip
  formatter={(value: number, name: string, entry) => {
    const payload = entry?.payload as MonthlyViewsByTitle; // cast ให้ชัดเจน
    return [`${value} ครั้ง`, payload?.title || name];
  }}
/>


                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        
          {/* <p className="text-md font-medium mt-2 text-center">
            เดือน: {selectedMonth.toLocaleString("th-TH", { month: "long", year: "numeric" })}
          </p> */}

          <p className="text-lg font-bold mt-2">รวม {totalViews} ครั้ง</p>
        </>
      )}
    </div>
  );
};

export default WordHealingCard;
