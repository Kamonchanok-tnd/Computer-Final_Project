import React, { useEffect, useState } from "react";
import { getWordHealingViews, ViewsByTitle } from "../../../../services/https/dashboardcontents";
import { EllipsisOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface WordHealingCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const COLORS = ["#ffedd8ff", "#f9fad7ff", "#e1f8dcff", "#dff9fbff", "#d8e7fdff", "#e5e1f8ff", "#fce3fcff"];
const TEXT_COLORS = ["#FF7043", "#FBC02D", "#388E3C", "#0288D1", "#1976D2", "#7B1FA2", "#C2185B"];

const WordHealingCard: React.FC<WordHealingCardProps> = ({
  title = "Word Healing Content",
  className = "bg-white",
  onViewMore,
}) => {
  const [data, setData] = useState<ViewsByTitle[]>([]);
  const [todayData, setTodayData] = useState<ViewsByTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดข้อมูลจาก API (daily)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getWordHealingViews("daily");

        const formatted = res.map((item) => {
          const d = dayjs(item.date);
          return { ...item, dateOnly: d.format("YYYY-MM-DD") };
        });

        setData(formatted);

        // filter เอาเฉพาะวันนี้
        const todayStr = dayjs().format("YYYY-MM-DD");
        const filtered = formatted.filter((item) => item.dateOnly === todayStr);
        setTodayData(filtered);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalViews = todayData.reduce((sum, item) => sum + item.total_views, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title} (วันนี้)
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

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : todayData.length === 0 ? (
        <p>วันนี้ยังไม่มีคนอ่าน</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {todayData.map((item, index) => {
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
