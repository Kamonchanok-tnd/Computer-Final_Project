import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { EllipsisOutlined } from "@ant-design/icons";
import { getSoundFourType, DailySoundUsage } from "../../../../services/https/dashboardcontents";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface MusicData {
  category: string; // สมาธิ, สวดมนต์, ฝึกหายใจ, ASMR
  plays: number;
}

interface MusicCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

// 🎨 สีพาสเทลตาม category
const CATEGORY_COLORS: Record<string, string> = {
  "สมาธิ": "#7bed7f",    // เขียวมิ้นต์
  "สวดมนต์": "#AFD5F0",  // ฟ้าอ่อน
  "ฝึกหายใจ": "#ffbc59", // ส้มพาสเทล
  "ASMR": "#ee8fff",      // ม่วงชมพู
};

const MusicCard: React.FC<MusicCardProps> = ({
  title = "คอนเทนต์เสียง (วันนี้)",
  className = "bg-white",
  onViewMore,
}) => {
  const [data, setData] = useState<MusicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchMusicData = async () => {
    setLoading(true);
    try {
      const response: DailySoundUsage[] = await getSoundFourType();
      //console.log("Raw data from API (four-type daily):", response);

      const today = dayjs();
      const todayData = response.filter(
        (item) =>
          item.year === today.year() &&
          item.month === today.month() + 1 && // dayjs เดือนเริ่มจาก 0
          item.day === today.date()
      );

      // รวมจำนวนเล่นตามประเภท
      const formattedData = todayData.reduce((acc: MusicData[], item) => {
        const categoryName = item.category.toLowerCase() === "asmr" ? "ASMR" : item.category;
        const existing = acc.find((d) => d.category === categoryName);
        if (existing) {
          existing.plays += item.play_count;
        } else {
          acc.push({ category: categoryName, plays: item.play_count });
        }
        return acc;
      }, []);

      setData(formattedData);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchMusicData();
}, []);


  const totalPlays = data.reduce((sum, item) => sum + item.plays, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title}
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-2 rounded-full bg-white/50 hover:bg-blue-300 transition flex justify-center items-center"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <EllipsisOutlined className="text-gray-600 text-lg" />
          </button>
        )}
      </h2>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data.length === 0 ? (
        <p>วันนี้ยังไม่มีข้อมูล</p>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="plays"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={false}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || "#cccccc"}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} ครั้ง`, "เล่น"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2 text-center text-gray-700">
            รวม {totalPlays} ครั้ง
          </p>
        </>
      )}
    </div>
  );
};

export default MusicCard;
