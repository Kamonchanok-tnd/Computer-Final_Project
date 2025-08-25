// WordHealingCard.tsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";
import { Info } from "lucide-react";

import { getDailyWordHealingViews } from "../../../../services/https/dashboardcontents";
interface WordHealingData {
  day: string;
  total_views: number;
}

interface WordHealingCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const WordHealingCard: React.FC<WordHealingCardProps> = ({
  title = "Word Healing Content",
  className = "bg-yellow-200",
  onViewMore,
}) => {
  const [data, setData] = useState<WordHealingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordHealingData = async () => {
      try {
        const response = await getDailyWordHealingViews();
        const formattedData = response.map((item: any) => ({
          day: new Date(item.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          total_views: item.total_views,
        }));
        setData(formattedData);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWordHealingData();
  }, []);

  // รวมจำนวนวิวต่อวัน
  const groupedData = data.reduce((acc: Record<string, number>, item) => {
    acc[item.day] = (acc[item.day] || 0) + item.total_views;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedData).map(([day, total_views]) => ({
    day,
    total_views,
  }));

  const totalViews = chartData.reduce((sum, item) => sum + item.total_views, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title}
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-1 rounded-full hover:bg-yellow-300 transition"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info className="w-5 h-5 text-yellow-700" />
          </button>
        )}
      </h2>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <Tooltip formatter={(value: any) => [`${value} ครั้ง`, "Views"]} />
                <Line
                  type="monotone"
                  dataKey="total_views"
                  stroke="#FFC107"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2">{totalViews} ครั้ง</p>
        </>
      )}
    </div>
  );
};

export default WordHealingCard;
