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
const COLORS = ["#FFD6A5", "#FDFFB6", "#CAFFBF", "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF"];

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
