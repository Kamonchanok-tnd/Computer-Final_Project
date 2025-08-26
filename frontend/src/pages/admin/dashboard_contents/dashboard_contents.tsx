import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getSoundFourType } from "../../../services/https/dashboardcontents";
import HomeContents from "./home_contents";

interface MusicData {
  month: string; // formatted as "Aug 2025"
  category: string; // สมาธิ, สวดมนต์, ฝึกหายใจ, asmr
  plays: number;
}

const DashboardContents: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // mapping category -> route
  const categoryRoutes: Record<string, string> = {
    "สมาธิ": "/admin/meditation-details",
    "สวดมนต์": "/admin/chanting-details",
    "ฝึกหายใจ": "/admin/breathing-details",
    "asmr": "/admin/asmr-details",
  };

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const res = await getSoundFourType();
        console.log("Raw data from API (four-type):", res);

        // รวมข้อมูลตามเดือนและประเภท
        const formattedData: MusicData[] = res.reduce((acc: MusicData[], item: any) => {
          const monthStr = new Date(item.year, item.month - 1).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
          });

          const existing = acc.find(d => d.month === monthStr && d.category === item.category);
          if (existing) {
            existing.plays += item.play_count;
          } else {
            acc.push({ month: monthStr, category: item.category, plays: item.play_count });
          }
          return acc;
        }, []);

        setMusicData(formattedData);
      } catch (err) {
        console.error("Error fetching music data:", err);
      }
    };

    fetchMusicData();
  }, []);

  // รวมจำนวนครั้งทั้งหมด
  const totalPlays = musicData.reduce((sum, item) => sum + item.plays, 0);

  // จำนวนประเภทไม่ซ้ำ
  const uniqueCategories = new Set(musicData.map((item) => item.category)).size;

  // ค่าเฉลี่ยต่อเดือน
  const uniqueMonths = new Set(musicData.map((item) => item.month)).size;
  const avgPerMonth = uniqueMonths > 0 ? (totalPlays / uniqueMonths).toFixed(1) : 0;

  // Top Tracks by category
  const trackCount: Record<string, number> = {};
  musicData.forEach((item) => {
    trackCount[item.category] = (trackCount[item.category] || 0) + item.plays;
  });
  const topTracks = Object.entries(trackCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // handle click
  const handleCategoryClick = (name: string) => {
    setSelectedCategory(selectedCategory === name ? null : name);
    const route = categoryRoutes[name];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">รวมการเล่น</p>
          <p className="text-2xl font-bold">{totalPlays} ครั้ง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">จำนวนประเภท</p>
          <p className="text-2xl font-bold">{uniqueCategories} ประเภท</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">เฉลี่ยต่อเดือน</p>
          <p className="text-2xl font-bold">{avgPerMonth} ครั้ง</p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-blue-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-2">Top Categories</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {topTracks.map(([name], idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(name)}
              className={`px-3 py-1 rounded-lg transition ${
                selectedCategory === name
                  ? "bg-blue-500 text-white"
                  : "bg-blue-200 hover:bg-blue-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <ol className="list-decimal ml-6 space-y-1">
          {topTracks.map(([name, count], idx) => (
            <li key={idx} className="flex justify-between">
              <span>{name}</span>
              <span className="font-bold">{count} ครั้ง</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Trend Line per month */}
      <div className="bg-green-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4">Trend Line (การเล่นต่อเดือน)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={musicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <Tooltip formatter={(value: any) => [`${value} ครั้ง`, "เล่น"]} />
              <Line
                type="monotone"
                dataKey="plays"
                stroke="#4CAF50"
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

export default DashboardContents;
