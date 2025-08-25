// DashboardMirror.tsx
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { getDailyMirrorUsage, DailyMirrorUsage  } from "../../../../services/https/dashboardcontents";
const DashboardMirror: React.FC = () => {
  const [mirrorData, setMirrorData] = useState<DailyMirrorUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDailyMirrorUsage();
        setMirrorData(res);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลระบายความรู้สึกได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalDays = mirrorData.length;

  const uniqueTitles = new Set(mirrorData.map((item) => item.title)).size;

  // Top Titles
  const titleCount: Record<string, number> = {};
  mirrorData.forEach((item) => {
    titleCount[item.title] = (titleCount[item.title] || 0) + item.count;
  });
  const topTitles = Object.entries(titleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">รวมจำนวนวันระบาย</p>
          <p className="text-2xl font-bold">{totalDays} วัน</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">จำนวนหัวข้อ</p>
          <p className="text-2xl font-bold">{uniqueTitles} หัวข้อ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">เฉลี่ยต่อวัน</p>
          <p className="text-2xl font-bold">{totalDays > 0 ? (totalDays / totalDays).toFixed(1) : 0} ครั้ง</p>
        </div>
      </div>

      {/* Top Titles */}
      <div className="bg-purple-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-2">Top Titles</h2>
        <ol className="list-decimal ml-6 space-y-1">
          {topTitles.map(([title, count], idx) => (
            <li key={idx} className="flex justify-between">
              <span>{title}</span>
              <span className="font-bold">{count} ครั้ง</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Trend Line */}
      <div className="bg-purple-200 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4">Trend Line (จำนวนวันระบายต่อวัน)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mirrorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
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
                formatter={(value: any) => [`${value} ครั้ง`, "ระบาย"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#9C27B0"
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

export default DashboardMirror;
