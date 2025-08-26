import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getSoundChanting } from "../../../../services/https/dashboardcontents";

interface ChantingData {
  date: string; // raw date
  day: string; // formatted date
  chants: number;
  sound_name: string;
}

const DashboardChanting: React.FC = () => {
  const [chantingData, setChantingData] = useState<ChantingData[]>([]);

  useEffect(() => {
    const fetchChantingData = async () => {
      try {
        const res = await getSoundChanting();
        console.log("Raw chanting data from API:", res);

        const formattedData: ChantingData[] = Array.isArray(res)
          ? res.map((item) => ({
              date: item.date, // raw ISO string
              day: new Date(item.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              chants: item.play_count,
              sound_name: (item as any).sound_name || "ไม่ทราบชื่อเพลง",
            }))
          : [];

        console.log("Formatted data for chart:", formattedData);
        setChantingData(formattedData);
      } catch (err) {
        console.error("Error fetching chanting data:", err);
      }
    };

    fetchChantingData();
  }, []);

  // รวมจำนวนครั้งทั้งหมด
  const totalChants = chantingData.reduce((sum, item) => sum + item.chants, 0);

  // จำนวน chant ไม่ซ้ำ
  const uniqueChants = new Set(chantingData.map((item) => item.sound_name)).size;

  // ค่าเฉลี่ยต่อวัน
  const uniqueDays = new Set(chantingData.map((item) => item.day)).size;
  const avgPerDay = uniqueDays > 0 ? (totalChants / uniqueDays).toFixed(1) : 0;

  // Top Tracks
  const trackCount: Record<string, number> = {};
  chantingData.forEach((item) => {
    trackCount[item.sound_name] = (trackCount[item.sound_name] || 0) + item.chants;
  });
  const topTracks = Object.entries(trackCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F3E8FF] text-[#4B0082] p-6 space-y-6">
      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-purple-300">
          <p className="text-gray-600">รวมการสวด</p>
          <p className="text-2xl font-bold">{totalChants} ครั้ง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-purple-300">
          <p className="text-gray-600">จำนวน chant</p>
          <p className="text-2xl font-bold">{uniqueChants} เพลง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-purple-300">
          <p className="text-gray-600">เฉลี่ยต่อวัน</p>
          <p className="text-2xl font-bold">{avgPerDay} ครั้ง</p>
        </div>
      </div>

      {/* Top Tracks */}
      <div className="bg-purple-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-2 text-purple-700">Top Tracks</h2>
        <ol className="list-decimal ml-6 space-y-1 text-purple-800">
          {topTracks.map(([name, count], idx) => (
            <li key={idx} className="flex justify-between">
              <span>{name}</span>
              <span className="font-bold">{count} ครั้ง</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Trend Line */}
      <div className="bg-purple-50 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4 text-purple-700">Trend Line (การสวดต่อวัน)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chantingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8B4FE" />
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
                formatter={(value: any) => [`${value} ครั้ง`, "chants"]}
              />
              <Line
                type="monotone"
                dataKey="chants"
                stroke="#7C3AED"
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

export default DashboardChanting;
