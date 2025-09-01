import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DatePicker, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { getMonthlyWordHealingViews, MonthlyViewsByTitle } from "../../../../services/https/dashboardcontents";

dayjs.locale("th");

const DashboardWordHealingMonthly: React.FC = () => {
  const [data, setData] = useState<MonthlyViewsByTitle[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMonthlyWordHealingViews();

        // แปลง date เป็น dayLabel
        const formatted = res.map((item) => ({
          ...item,
          dayLabel: item.date
            ? dayjs(item.date).format("D MMM") // เช่น "30 ส.ค."
            : "ไม่ระบุวัน",
        }));

        setData(formatted);

        if (formatted.length > 0) {
          // เลือกเดือนล่าสุดจาก date
          setSelectedMonth(dayjs(formatted[formatted.length - 1].date));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Filter ตามเดือนที่เลือก
  const filteredData = selectedMonth
    ? data.filter((item) => dayjs(item.date).isSame(selectedMonth, "month"))
    : data;

  // รวม views ของเดือนที่เลือก
  const totalViews = filteredData.reduce((sum, item) => sum + item.total_views, 0);

  // Top Articles เดือนที่เลือก
  const topArticles = [...filteredData]
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 5);

  // สร้าง chartData แสดง views ต่อวัน
  const dailyTotals = filteredData.reduce((acc: Record<string, number>, item) => {
    const day = dayjs(item.date).format("D MMM");
    acc[day] = (acc[day] || 0) + item.total_views;
    return acc;
  }, {});
  const chartData = Object.entries(dailyTotals).map(([day, total_views]) => ({ day, total_views }));

  return (
    <ConfigProvider locale={thTH}>
      <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
        {/* สรุปยอดรวม */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-yellow-200">
            <p className="text-gray-600">รวมการอ่าน</p>
            <p className="text-2xl font-bold text-yellow-700">{totalViews} ครั้ง</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-yellow-200">
            <p className="text-gray-600">จำนวนบทความ</p>
            <p className="text-2xl font-bold text-yellow-700">{filteredData.length} บทความ</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-yellow-200">
            <p className="text-gray-600">เฉลี่ยต่อบทความ</p>
            <p className="text-2xl font-bold text-yellow-700">
              {filteredData.length > 0 ? (totalViews / filteredData.length).toFixed(1) : 0} ครั้ง
            </p>
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-2 text-yellow-800">Top Articles</h2>
          <ol className="list-decimal ml-6 space-y-1 text-yellow-900">
            {topArticles.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.title}</span>
                <span className="font-bold">{item.total_views} ครั้ง</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trend Line (ต่อวัน) */}
        <div className="bg-yellow-50 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-yellow-800">
              Trend Line (การอ่านต่อวัน)
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
                <CartesianGrid strokeDasharray="3 3" stroke="#FFECB3" />
                <XAxis dataKey="day" />
                <Tooltip formatter={(value: any) => [`${value} ครั้ง`, "views"]} />
                <Line
                  type="monotone"
                  dataKey="total_views"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#F59E0B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DashboardWordHealingMonthly;
