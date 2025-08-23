// Dashboard.tsx
import React from "react";
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
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

const DashboardContents: React.FC = () => {
  // Mock Data
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

  const sleepData = [
    { name: "Mon", value: 7 },
    { name: "Tue", value: 8.5 },
    { name: "Wed", value: 6.5 },
    { name: "Thu", value: 9 },
    { name: "Fri", value: 8 },
    { name: "Sat", value: 7.5 },
    { name: "Sun", value: 8.2 },
  ];

  // New mock data
  const musicData = [
    { day: "Mon", plays: 5 },
    { day: "Tue", plays: 8 },
    { day: "Wed", plays: 6 },
    { day: "Thu", plays: 10 },
    { day: "Fri", plays: 12 },
    { day: "Sat", plays: 15 },
    { day: "Sun", plays: 9 },
  ];

  const userStats = [
    { day: "Mon", users: 200 },
    { day: "Tue", users: 350 },
    { day: "Wed", users: 300 },
    { day: "Thu", users: 400 },
    { day: "Fri", users: 380 },
    { day: "Sat", users: 500 },
    { day: "Sun", users: 450 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C]">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-semibold">ข้อมูลของคอนเทนต์ 👋</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none"
          />
        </div>
      </header>

      <main className="p-6">
        {/* Top Section */}
        <section className="grid grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-md col-span-2">
            <div className="flex justify-between">
              <h2 className="font-semibold">Freud Score</h2>
              <button className="text-sm bg-gray-100 px-3 py-1 rounded-lg">
                All Time
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8BC34A"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">97.2%</p>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center">
            <h2 className="font-semibold mb-2">สมาธิและฝึกหายใจ</h2>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                innerRadius="30%"
                outerRadius="100%"
                barSize={15}
                data={donutData}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-lg font-bold">Level 2</p>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-3 gap-6 mt-6">
          {/* Sleep Level */}
          <div className="bg-green-200 rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold">สวดมนต์</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="value" fill="#4CAF50" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">8.2h</p>
          </div>

          {/* Health Journal */}
          <div className="bg-orange-300 rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold">ข้อความให้กำลังใจ</h3>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-orange-200 rounded-full" />
              ))}
            </div>
            <p className="text-lg font-bold mt-2">16d</p>
          </div>

          {/* AI Chatbot */}
          <div className="bg-purple-300 rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold">แชทบอท</h3>
            <div className="flex flex-col gap-2 mt-2">
              <div className="h-4 bg-purple-200 rounded-full w-3/4"></div>
              <div className="h-4 bg-purple-200 rounded-full w-1/2"></div>
              <div className="h-4 bg-purple-200 rounded-full w-5/6"></div>
            </div>
            <p className="text-lg font-bold mt-2">187+</p>
          </div>

          {/* Promotion */}
          <div className="bg-[#4B2E2E] text-white rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold text-lg">ASMR</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>✔️ 200K LLMs</li>
              <li>✔️ Unlimited Chats</li>
            </ul>
            <div className="mt-4 flex justify-center">
              <span className="text-4xl">✨</span>
            </div>
          </div>

          {/* New Card 1: Music Plays */}
          <div className="bg-blue-200 rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold">เสียงธรรมะ</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={musicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#2196F3" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">24 เพลง</p>
          </div>

          {/* New Card 2: User Stats */}
          <div className="bg-yellow-200 rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold">สถิติผู้ใช้</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userStats}>
                  <XAxis dataKey="day" />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#FBC02D"
                    strokeWidth={3}
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">1.2K Users</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardContents;
