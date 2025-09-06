import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getDailyMeditationUsage,
} from "../../../../services/https/dashboardcontents";
import { DatePicker, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface MusicData {
  date: string; // raw date
  day: string; // formatted date
  plays: number;
  sound_name: string;
}

const DashboardMeditation: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const res = await getDailyMeditationUsage();

        const formattedData: MusicData[] = Array.isArray(res)
          ? res.map((item) => ({
              date: item.date,
              day: new Date(item.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              plays: item.play_count,
              sound_name: (item as any).sound_name || "ไม่ทราบชื่อเพลง",
            }))
          : [];

        setMusicData(formattedData);

        // default: เลือกเดือนล่าสุด
        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1].date;
          setSelectedMonth(dayjs(latest));
        }
      } catch (err) {
        console.error("Error fetching music data:", err);
      }
    };

    fetchMusicData();
  }, []);

  // -----------------------------
  // Filter ตามเดือนที่เลือก
  // -----------------------------
  const filteredData = musicData.filter((item) => {
  if (!selectedMonth) return true;
  const d = dayjs(item.date);
  return d.year() === selectedMonth.year() && d.month() === selectedMonth.month();
});

// รวมจำนวนครั้งทั้งหมดในเดือนที่เลือก
const totalPlays = filteredData.reduce((sum, item) => sum + item.plays, 0);

// จำนวนเพลงไม่ซ้ำในเดือนที่เลือก
const uniqueSongs = new Set(filteredData.map((item) => item.sound_name)).size;

// ค่าเฉลี่ยต่อวันในเดือนที่เลือก
const uniqueDays = new Set(filteredData.map((item) => item.day)).size;
const avgPerDay = uniqueDays > 0 ? (totalPlays / uniqueDays).toFixed(1) : 0;

// Top Tracks ในเดือนที่เลือก
const trackCount: Record<string, number> = {};
filteredData.forEach((item) => {
  trackCount[item.sound_name] = (trackCount[item.sound_name] || 0) + item.plays;
});
const topTracks = Object.entries(trackCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// สร้าง chartData สำหรับกราฟ
const dailyTotals = filteredData.reduce((acc: Record<string, number>, item) => {
  acc[item.date] = (acc[item.date] || 0) + item.plays;
  return acc;
}, {});
const chartData = Object.entries(dailyTotals).map(([date, plays]) => ({ date, plays }));


  return (
    <ConfigProvider locale={thTH}>
      <div className="min-h-screen bg-[#ECFDF5] text-[#14532D] p-6 space-y-6">
        {/* สรุปยอดรวม */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-green-200">
            <p className="text-gray-600">รวมการเล่น</p>
            <p className="text-2xl font-bold text-green-700">{totalPlays} ครั้ง</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-green-200">
            <p className="text-gray-600">จำนวนเพลง</p>
            <p className="text-2xl font-bold text-green-700">{uniqueSongs} เพลง</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-green-200">
            <p className="text-gray-600">เฉลี่ยต่อวัน</p>
            <p className="text-2xl font-bold text-green-700">{avgPerDay} ครั้ง</p>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-green-100 rounded-2xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-2 text-green-800">Top Tracks</h2>
          <ol className="list-decimal ml-6 space-y-1 text-green-900">
            {topTracks.map(([name, count], idx) => (
              <li key={idx} className="flex justify-between">
                <span>{name}</span>
                <span className="font-bold">{count} ครั้ง</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trend Line */}
        <div className="bg-green-50 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-green-800">
              Trend Line (การเล่นต่อวัน)
            </h2>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              format="MMMM YYYY" // แสดงเดือนภาษาไทย
              allowClear={false}
            />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#A7F3D0" />
  <XAxis
    dataKey="date"
    tickFormatter={(value) =>
      new Date(value).toLocaleDateString("th-TH", { day: "numeric", month: "short" })
    }
  />
  <Tooltip
    labelFormatter={(value) =>
      new Date(value).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
    }
    formatter={(value: any) => [`${value} ครั้ง`, "plays"]}
  />
  <Line
    type="monotone"
    dataKey="plays"
    stroke="#16A34A"
    strokeWidth={3}
    dot={{ r: 5, fill: "#16A34A" }}
  />
</LineChart>

            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DashboardMeditation;
