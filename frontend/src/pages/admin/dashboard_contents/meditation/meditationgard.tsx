import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Info } from "lucide-react";
import { EllipsisOutlined } from "@ant-design/icons"; // ใช้ Antd Ellipsis
import { getSoundFourType, DailySoundUsage } from "../../../../services/https/dashboardcontents";
import MonthPickerMed from "./monthpicker";

interface MusicData {
  category: string; // สมาธิ, สวดมนต์, ฝึกหายใจ, asmr
  plays: number;
}

interface MusicCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const COLORS = ["#42A5F5", "#66BB6A", "#FFA726", "#AB47BC"];

const MusicCard: React.FC<MusicCardProps> = ({
  title = "คอนเทนต์เสียง",
  className = "bg-blue-200",
  onViewMore,
}) => {
  const [data, setData] = useState<MusicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchMusicData = async () => {
      setLoading(true);
      try {
        const response: DailySoundUsage[] = await getSoundFourType();
        console.log("Raw data from API (four-type):", response);

        // กรองข้อมูลตามปีและเดือนที่เลือก
        const filtered = response.filter((item) => {
          return (
            item.year === selectedMonth.getFullYear() &&
            item.month === selectedMonth.getMonth() + 1 // JS month 0-11, API 1-12
          );
        });

        // รวมจำนวนเล่นตามประเภท
        const formattedData = filtered.reduce((acc: MusicData[], item) => {
          const existing = acc.find((d) => d.category === item.category);
          if (existing) {
            existing.plays += item.play_count;
          } else {
            acc.push({ category: item.category, plays: item.play_count });
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
  }, [selectedMonth]);

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
      ) : data.length === 0 ? (
        <p>ไม่มีข้อมูลสำหรับเดือนนี้</p>
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
                  labelLine={false} // ปิดเส้น
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} ครั้ง`, "เล่น"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2 font-ibmthai">{totalPlays} ครั้ง</p>
        </>
      )}
    </div>
  );
};

export default MusicCard;
