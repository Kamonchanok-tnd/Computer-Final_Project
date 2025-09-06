import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getDailyChantingUsage } from "../../../../services/https/dashboardcontents";
import { DatePicker, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface ChantingData {
  date: string; // raw date
  day: string; // formatted date
  chants: number;
  sound_name: string;
}

const DashboardChanting: React.FC = () => {
  const [chantingData, setChantingData] = useState<ChantingData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    const fetchChantingData = async () => {
      try {
        const res = await getDailyChantingUsage();

        const formattedData: ChantingData[] = Array.isArray(res)
          ? res.map((item) => ({
              date: item.date,
              day: new Date(item.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              chants: item.play_count,
              sound_name: (item as any).sound_name || "ไม่ทราบชื่อเพลง",
            }))
          : [];

        setChantingData(formattedData);

        // ตั้งค่าเดือนล่าสุดเป็น default
        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1].date;
          setSelectedMonth(dayjs(latest));
        }
      } catch (err) {
        console.error("Error fetching chanting data:", err);
      }
    };

    fetchChantingData();
  }, []);

  // Filter chantingData ตามเดือนที่เลือก
  const filteredData = chantingData.filter((item) => {
    if (!selectedMonth) return true;
    const d = dayjs(item.date);
    return d.year() === selectedMonth.year() && d.month() === selectedMonth.month();
  });

  // รวมจำนวนครั้งทั้งหมดในเดือนที่เลือก
  const totalChants = filteredData.reduce((sum, item) => sum + item.chants, 0);

  // จำนวน chant ไม่ซ้ำในเดือนที่เลือก
  const uniqueChants = new Set(filteredData.map((item) => item.sound_name)).size;

  // ค่าเฉลี่ยต่อวันในเดือนที่เลือก
  const uniqueDays = new Set(filteredData.map((item) => item.day)).size;
  const avgPerDay = uniqueDays > 0 ? (totalChants / uniqueDays).toFixed(1) : 0;

  // Top Tracks ในเดือนที่เลือก
  const trackCount: Record<string, number> = {};
  filteredData.forEach((item) => {
    trackCount[item.sound_name] = (trackCount[item.sound_name] || 0) + item.chants;
  });
  const topTracks = Object.entries(trackCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // สร้าง chartData สำหรับกราฟ
  const dailyTotals = filteredData.reduce((acc: Record<string, number>, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.chants;
    return acc;
  }, {});
  const chartData = Object.entries(dailyTotals).map(([date, chants]) => ({ date, chants }));

  return (
    <ConfigProvider locale={thTH}>
      <div className="min-h-screen bg-[#E0F2FE] text-[#1E3A8A] p-6 space-y-6">
        {/* สรุปยอดรวม */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-blue-200">
            <p className="text-gray-600">รวมการสวด</p>
            <p className="text-2xl font-bold">{totalChants} ครั้ง</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-blue-200">
            <p className="text-gray-600">จำนวน chant</p>
            <p className="text-2xl font-bold">{uniqueChants} เพลง</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-blue-200">
            <p className="text-gray-600">เฉลี่ยต่อวัน</p>
            <p className="text-2xl font-bold">{avgPerDay} ครั้ง</p>
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-blue-100 rounded-2xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-2 text-blue-700">Top Tracks</h2>
          <ol className="list-decimal ml-6 space-y-1 text-blue-800">
            {topTracks.map(([name, count], idx) => (
              <li key={idx} className="flex justify-between">
                <span>{name}</span>
                <span className="font-bold">{count} ครั้ง</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trend Line */}
        <div className="bg-blue-50 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-blue-700">
              Trend Line (การสวดต่อวัน)
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
                <CartesianGrid strokeDasharray="3 3" stroke="#BFDBFE" />
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
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#3B82F6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DashboardChanting;
