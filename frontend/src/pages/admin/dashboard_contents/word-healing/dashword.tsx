// DashboardWordHealing.tsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { getDailyWordHealingViews } from "../../../../services/https/dashboardcontents";
interface WordHealingData {
  date: string; // raw date
  day: string;  // formatted date
  total_views: number;
  title: string;
}

const DashboardWordHealing: React.FC = () => {
  const [wordData, setWordData] = useState<WordHealingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDailyWordHealingViews();
        const formatted: WordHealingData[] = Array.isArray(res)
          ? res.map((item) => ({
              date: item.date,
              day: new Date(item.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              total_views: item.total_views,
              title: item.title,
            }))
          : [];
        setWordData(formatted);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalViews = wordData.reduce((sum, item) => sum + item.total_views, 0);

  const uniqueContents = new Set(wordData.map((item) => item.title)).size;

  const uniqueDays = new Set(wordData.map((item) => item.day)).size;
  const avgPerDay = uniqueDays > 0 ? (totalViews / uniqueDays).toFixed(1) : 0;

  // Top Contents
  const contentCount: Record<string, number> = {};
  wordData.forEach((item) => {
    contentCount[item.title] = (contentCount[item.title] || 0) + item.total_views;
  });
  const topContents = Object.entries(contentCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">รวมการอ่าน</p>
          <p className="text-2xl font-bold">{totalViews} ครั้ง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">จำนวนเนื้อหา</p>
          <p className="text-2xl font-bold">{uniqueContents} เรื่อง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">เฉลี่ยต่อวัน</p>
          <p className="text-2xl font-bold">{avgPerDay} ครั้ง</p>
        </div>
      </div>

      {/* Top Contents */}
      <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-2">Top Contents</h2>
        <ol className="list-decimal ml-6 space-y-1">
          {topContents.map(([title, count], idx) => (
            <li key={idx} className="flex justify-between">
              <span>{title}</span>
              <span className="font-bold">{count} ครั้ง</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Trend Line */}
      <div className="bg-yellow-200 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4">Trend Line (การอ่านต่อวัน)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wordData}>
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
                formatter={(value: any) => [`${value} ครั้ง`, "views"]}
              />
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
      </div>
    </div>
  );
};

export default DashboardWordHealing;
