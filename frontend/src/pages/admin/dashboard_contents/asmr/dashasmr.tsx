import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getDailyASMRUsage } from "../../../../services/https/dashboardcontents";
import { DatePicker, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface ASMRData {
  date: string; // raw date
  day: string; // formatted date
  plays: number;
  sound_name: string;
}

const DashboardASMR: React.FC = () => {
  const [asmrData, setAsmrData] = useState<ASMRData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDailyASMRUsage();
        // console.log("Raw ASMR data from API:", res);

        const formattedData: ASMRData[] = Array.isArray(res)
          ? res.map((item: any) => ({
              date: item.date,
              day: new Date(item.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              plays: item.play_count ?? 0,
              sound_name: item.sound_name || "ไม่ทราบชื่อเสียง ASMR",
            }))
          : [];

        setAsmrData(formattedData);

        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1].date;
          setSelectedMonth(dayjs(latest));
        }
      } catch (err) {
        console.error("Error fetching ASMR data:", err);
      }
    };

    fetchData();
  }, []);

  // Filter ตามเดือนที่เลือก
  const filteredData = asmrData.filter((item) => {
    if (!selectedMonth) return true;
    const d = dayjs(item.date);
    return d.year() === selectedMonth.year() && d.month() === selectedMonth.month();
  });

  // รวมจำนวนครั้งทั้งหมด
  const totalPlays = filteredData.reduce((sum, item) => sum + (item.plays ?? 0), 0);

  // จำนวนเสียงไม่ซ้ำ
  const uniqueSounds = new Set(filteredData.map((item) => item.sound_name)).size;

  // ค่าเฉลี่ยต่อวัน
  const uniqueDays = new Set(filteredData.map((item) => item.day)).size;
  const avgPerDay = uniqueDays > 0 ? (totalPlays / uniqueDays).toFixed(1) : 0;

  // Top Tracks
  const trackCount: Record<string, number> = {};
  filteredData.forEach((item) => {
    const plays = item.plays ?? 0;
    trackCount[item.sound_name] = (trackCount[item.sound_name] || 0) + plays;
  });
  const topTracks = Object.entries(trackCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // กราฟรวมจำนวนต่อวัน
  const dailyTotals = filteredData.reduce((acc: Record<string, number>, item) => {
    const plays = item.plays ?? 0;
    acc[item.date] = (acc[item.date] || 0) + plays;
    return acc;
  }, {});
  const chartData = Object.entries(dailyTotals).map(([date, plays]) => ({ date, plays }));

  return (
    <ConfigProvider locale={thTH}>
      <div className="min-h-screen bg-[#FFF0F5] text-[#831843] p-6 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#FFE4E1] rounded-2xl shadow-md p-6 text-center border border-pink-200">
            <p className="text-gray-600">รวมการเล่น ASMR</p>
            <p className="text-2xl font-bold text-pink-700">{totalPlays} ครั้ง</p>
          </div>
          <div className="bg-[#FFE4E1] rounded-2xl shadow-md p-6 text-center border border-pink-200">
            <p className="text-gray-600">จำนวนเสียง</p>
            <p className="text-2xl font-bold text-pink-700">{uniqueSounds} เสียง</p>
          </div>
          <div className="bg-[#FFE4E1] rounded-2xl shadow-md p-6 text-center border border-pink-200">
            <p className="text-gray-600">เฉลี่ยต่อวัน</p>
            <p className="text-2xl font-bold text-pink-700">{avgPerDay} ครั้ง</p>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-[#FFE4E1] rounded-2xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-2 text-pink-800">Top ASMR</h2>
          <ol className="list-decimal ml-6 space-y-1 text-pink-900">
            {topTracks.map(([name, count], idx) => (
              <li key={idx} className="flex justify-between">
                <span>{name}</span>
                <span className="font-bold">{count} ครั้ง</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trend Line */}
        <div className="bg-[#FFE4E1] rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-pink-800">
              Trend Line (ASMR ต่อวัน)
            </h2>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              format="MMMM YYYY"
              allowClear={false}
            />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FADADD" />
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
                  formatter={(value: any) => [`${value} ครั้ง`, "plays"]}
                />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#EC4899"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#EC4899" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DashboardASMR;
