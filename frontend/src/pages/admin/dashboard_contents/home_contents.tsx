import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import admin from "../../../assets/creative.png";
import {
  getTopContentComparison,
  TopContent,
} from "../../../services/https/dashboardcontents";

// Components
import MusicCard from "./meditation/meditationgard";

import WordHealingCard from "./word-healing/wordgard";
import MirrorCard from "./mirror/mirrorgard";

import ChatTrendCardRecharts from "./chat/ChatTrendCardRecharts";
import QuestionnaireTrendChart from "./questionaire/QuestionnaireTrendChart";


// DashboardCard component
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

const HomeContents: React.FC = () => {
  const navigate = useNavigate();

  // State Top Content Comparison
  const [topContentData, setTopContentData] = useState<TopContent[]>([]);
  const [loadingTopContent, setLoadingTopContent] = useState(true);
  const [topContentError, setTopContentError] = useState<string | null>(null);
 
  function getRolePath( subPath: string) {
    const role = localStorage.getItem("role");
    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
    navigate(`/${rolePrefix}/${subPath}`)
   
  }

  // Fetch Top Content Comparison
  useEffect(() => {
    const fetchTopContent = async () => {
      setLoadingTopContent(true);
      try {
        const data = await getTopContentComparison();
        const usersByCategory = data.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.unique_users;
          return acc;
        }, {});

        setTopContentData(
          Object.entries(usersByCategory).map(([category, users]) => ({
            name: category,
            category,
            unique_users: users,
          }))
        );
      } catch (err) {
        console.error(err);
        setTopContentError("ไม่สามารถโหลดข้อมูล Top Content ได้");
      } finally {
        setLoadingTopContent(false);
      }
    };
    fetchTopContent();
  }, []);

  // Mapping category เป็นชื่อภาษาไทย + สี Tailwind
  const categoryLabels: Record<
    string,
    { label: string; colorBg: string; colorText: string }
  > = {
    Meditation: { label: "สมาธิ", colorBg: "bg-blue-50", colorText: "text-blue-700" },
    Breathing: { label: "ฝึกหายใจ", colorBg: "bg-orange-50", colorText: "text-orange-700" },
    ASMR: { label: "ASMR", colorBg: "bg-indigo-50", colorText: "text-indigo-700" },
    Chanting: { label: "สวดมนต์", colorBg: "bg-purple-50", colorText: "text-purple-700" },
    Mirror: { label: "ระบายความรู้สึก", colorBg: "bg-pink-50", colorText: "text-pink-700" },
    WordHealing: { label: "Word Healing", colorBg: "bg-green-50", colorText: "text-green-700" },
    Chat: { label: "แชท", colorBg: "bg-teal-50", colorText: "text-teal-700" },
    Questionnaire: { label: "แบบสอบถาม", colorBg: "bg-yellow-50", colorText: "text-yellow-700" },
  };

  // Data สำหรับ Recharts
  const chartData = topContentData.map((item) => {
    const mapping = categoryLabels[item.category] || { label: item.category, colorText: "text-gray-700" };
    return {
      category: mapping.label,
      users: item.unique_users,
      color: mapping.colorText,
    };
  });

  // Summary Data
  const summaryData = topContentData.map((item) => {
    const mapping = categoryLabels[item.category] || { label: item.category, colorBg: "bg-gray-50", colorText: "text-gray-700" };
    return {
      title: mapping.label,
      value: item.unique_users,
      colorBg: mapping.colorBg,
      colorText: mapping.colorText,
    };
  });

  // เพิ่มผู้ใช้ทั้งหมด
  summaryData.push({
    title: "ผู้ใช้ทั้งหมด",
    value: topContentData.reduce((sum, item) => sum + item.unique_users, 0),
    colorBg: "bg-red-50",
    colorText: "text-red-700",
  });

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
      <header className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <img src={admin} alt="Admin" className="w-15 h-15" />
          <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ </h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Top Content Comparison */}
          <DashboardCard title="ผู้ใช้ตามหมวดหมู่" className="col-span-1 md:col-span-2">
            {loadingTopContent ? (
              <p>กำลังโหลดข้อมูล...</p>
            ) : topContentError ? (
              <p className="text-red-500">{topContentError}</p>
            ) : (
              <div className="w-full h-95">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value} ผู้ใช้`, "จำนวน"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardCard>

          {/* Right: Summary Card */}
          <DashboardCard title="Summary" className="col-span-1 flex flex-col gap-2">
            {summaryData.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg flex justify-between items-center px-4 py-2 ${item.colorBg} ${item.colorText}`}
              >
                <span>{item.title}</span>
                <span className="font-semibold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </DashboardCard>
        </section>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-2">
            <ChatTrendCardRecharts
           
              onViewMore={() =>  getRolePath("dashboard/contents/chat")}
            />
          </div>
          <div className="col-span-2">
            <QuestionnaireTrendChart
              onViewMore={() => getRolePath("dashboard/contents/questionnaire")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MusicCard onViewMore={() => getRolePath("dashboard/contents/sound")} />
          <WordHealingCard onViewMore={() => getRolePath("wordhealing-details")} />
          <MirrorCard/>
        </div>
      </main>
    </div>
  );
};

export default HomeContents;
