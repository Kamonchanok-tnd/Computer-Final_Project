// DashboardContents.tsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

import { getDailySoundUsage, DailySoundUsage } from "../../../services/https/dashboardcontents";
import { getSoundChanting } from "../../../services/https/dashboardcontents";

// Components
import MusicCard from "./meditation/meditationgard";
import ChantingCard from "./chanting/chantinggard";

// DashboardCard component (inline)
const DashboardCard: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({
  title,
  className,
  children,
}) => (
  <div className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>
    <h2 className="font-semibold mb-2">{title}</h2>
    {children}
  </div>
);

const DashboardContents: React.FC = () => {
  const navigate = useNavigate();

  // ตัวอย่าง Freud Score และ Meditation Donut
  const lineData = [
    { time: "1d", value: 90 },
    { time: "1m", value: 70 },
    { time: "1y", value: 95 },
    { time: "5y", value: 65 },
    { time: "All", value: 80 },
  ];

  const donutData = [
    { name: "Core", value: 40, fill: "#8BC34A" },
    { name: "REM", value: 30, fill: "#FF9800" },
    { name: "Post-REM", value: 50, fill: "#5D4037" },
  ];

  // State Music
  const [musicData, setMusicData] = useState<{ day: string; plays: number }[]>([]);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [musicError, setMusicError] = useState<string | null>(null);

  // State Chanting
  const [chantingData, setChantingData] = useState<{ day: string; chants: number }[]>([]);
  const [loadingChanting, setLoadingChanting] = useState(true);
  const [chantingError, setChantingError] = useState<string | null>(null);

  // Fetch Music Data
  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const data: DailySoundUsage[] = await getDailySoundUsage();
        const formattedData = data.map((item) => ({
          day: new Date(item.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          plays: item.play_count,
        }));
        setMusicData(formattedData);
      } catch (err) {
        setMusicError("ไม่สามารถโหลดข้อมูลได้");
        console.error(err);
      } finally {
        setLoadingMusic(false);
      }
    };
    fetchMusicData();
  }, []);

  // Fetch Chanting Data
  useEffect(() => {
    const fetchChantingData = async () => {
      try {
        const data = await getSoundChanting();
        const formatted = data.map((item) => ({
          day: new Date(item.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          chants: item.play_count,
        }));
        setChantingData(formatted);
      } catch (err) {
        setChantingError("ไม่สามารถโหลดข้อมูลสวดมนต์ได้");
        console.error(err);
      } finally {
        setLoadingChanting(false);
      }
    };
    fetchChantingData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 md:gap-0">
        <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ 👋</h1>
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none w-full md:w-64"
        />
      </header>

      <main className="p-6 space-y-6">
        {/* Top Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Freud Score */}
          <DashboardCard title="Freud Score" className="col-span-1 md:col-span-2">
            <div className="flex justify-end mb-2">
              <button className="text-sm bg-gray-100 px-3 py-1 rounded-lg">All Time</button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8BC34A" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">97.2%</p>
          </DashboardCard>

          {/* สมาธิและฝึกหายใจ */}
          <DashboardCard title="สมาธิและฝึกหายใจ">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="30%" outerRadius="100%" barSize={15} data={donutData}>
                  <RadialBar minAngle={15} background clockwise dataKey="value" />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">Level 2</p>
          </DashboardCard>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Music Card */}
  <MusicCard
    data={musicData}
    loading={loadingMusic}
    error={musicError}
    onViewMore={() => navigate("/admin/meditation-details")}
  />

  {/* Chanting Card */}
  <ChantingCard
    data={chantingData}
    loading={loadingChanting}
    error={chantingError}
    onViewMore={() => navigate("/admin/chanting-details")}
  />

  {/* Card ว่าง เพื่อให้ครบ 3 คอลัมน์ */}
  <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-center text-gray-400">
    ยังไม่มีข้อมูล
  </div>
</div>

      </main>
    </div>
  );
};

export default DashboardContents;
