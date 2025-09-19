import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { getVisitFrequency, VisitFrequency } from "../../../services/https/activity";
import { DatePicker, Space, ConfigProvider, Card } from "antd";
import thTH from "antd/lib/locale/th_TH";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";

export default function VisitFrequencyPage() {
  const [visitData, setVisitData] = useState<VisitFrequency[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    getVisitFrequency().then((data) => {
      const formatted = data.map((item) => {
        const date = dayjs(item.date);
        return {
          ...item,
          day: `${date.date()} ${date.locale("th").format("MMM")} ${date.year()}`, // 13 ก.ย. 2025
        };
      });
      setVisitData(formatted);
    });
  }, []);

  // ฟิลเตอร์ข้อมูลตามเดือน+ปีที่เลือก
  const filteredData = visitData.filter((item) => {
    if (!selectedMonth) return true;
    const date = dayjs(item.date);
    return date.month() === selectedMonth.month() && date.year() === selectedMonth.year();
  });

  // แสดงเดือน+ปีที่เลือกแบบเต็ม (เช่น กันยายน 2025)
  const displayMonthYear = selectedMonth
    ? selectedMonth.locale("th").format("MMMM YYYY")
    : "ทั้งหมด";

  return (
    <div className="p-6">
      <Card className="bg-white rounded-xl shadow p-6">
        {/* Header + DatePicker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">
            ความถี่การเข้าชมเว็บไซต์ {selectedMonth && `- ${displayMonthYear}`}
          </h1>
          <ConfigProvider locale={thTH}>
            <Space>
              <DatePicker
                picker="month"
                placeholder="เลือกเดือน"
                format="MMMM YYYY"
                style={{ width: 150 }} // ขยายช่องให้เห็นเดือนเต็ม
                onChange={(value: Dayjs | null) => setSelectedMonth(value)}
              />
            </Space>
          </ConfigProvider>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <ReTooltip formatter={(value: any) => `${value} ครั้ง`} />
            <Legend />
            <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
