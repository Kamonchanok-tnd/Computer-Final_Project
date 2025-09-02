import React, { useEffect, useState } from "react";
import { Card, Spin, Select, DatePicker } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetChatUsage } from "../../../../services/https/Chat";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface DailyUsage {
  date: string;
  message_count: number;
  display_label: string;
  hour?: number;
}

const ChatTrendChart: React.FC<{ title?: string; className?: string }> = ({
  title = "แนวโน้มจำนวนข้อความจากผู้ใช้",
  className = "bg-white",
}) => {
  const [data, setData] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [granularity, setGranularity] = useState<"today" | "day" | "month" | "year" | "custom">("today");
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const filter: "user" = "user"; // เอาเฉพาะข้อความจาก user

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await GetChatUsage(granularity, filter, startDate, endDate);
      console.log("Response from GetChatUsage:", res);
      setData(res);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูล Trend ได้");
    } finally {
      setLoading(false);
    }
  };

  // fetch ทุกครั้งที่ granularity หรือ custom date เปลี่ยน
  useEffect(() => {
    if (granularity !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
    fetchData();
  }, [granularity, startDate, endDate]);

  // ----- Transform Data -----
  let chartData: DailyUsage[] = [];

  if (granularity === "today") {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hoursArray: DailyUsage[] = [];

    for (let h = 0; h < 24; h++) {
      const dateObj = new Date(todayStart.getTime() + h * 60 * 60 * 1000);
      hoursArray.push({
        date: dateObj.toISOString(),
        message_count: 0,
        display_label: `${h.toString().padStart(2, "0")}:00`,
        hour: h,
      });
    }

    data.forEach(item => {
      const dateObj = new Date(item.date); // ถ้า backend ส่ง UTC แล้ว +7 ได้
      const hour = dateObj.getHours();
      const existing = hoursArray.find(h => h.hour === hour);
      if (existing) existing.message_count = item.message_count;
    });

    chartData = hoursArray;
  } else {
    chartData = data.map(item => {
      const dateObj = new Date(item.date);
      let display_label = item.display_label;

      switch (granularity) {
        case "day":
          display_label = dateObj.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short"
          });
          break;
        case "custom":
          display_label = dateObj.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit" });
          break;
        case "month":
          display_label = dateObj.toLocaleDateString("th-TH", { month: "short" }); // ม.ค., ก.พ.
          break;
        case "year":
          display_label = dateObj.getFullYear().toString(); // 2025
          break;
      }

      return { ...item, date: dateObj.toISOString(), display_label };
    });

    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3  rounded shadow">
          <p className="font-medium">{granularity === "today" ? `เวลา: ${label}` : `วันที่: ${label}`}</p>
          <p className="text-button-blue">จำนวนข้อความ: {payload[0].value} ข้อความ</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-2xl p-4  ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">{title}</h2>
        <div className="flex gap-2 items-center">
          <Select value={granularity} onChange={val => setGranularity(val)} style={{ width: 150 }}
            className="custom-select"
            >
            <Option value="today">วันนี้</Option>
            <Option value="day">รายวัน</Option>
            <Option value="month">รายเดือน</Option>
            <Option value="year">รายปี</Option>
            <Option value="custom">กำหนดเอง</Option>
          </Select>

          {granularity === "custom" && (
            <RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setStartDate(dates[0].format("YYYY-MM-DD"));
                  setEndDate(dates[1].format("YYYY-MM-DD"));
                } else {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }
              }}
              className="custom-range-picker"
              placeholder={["เริ่มวันที่", "สิ้นสุดวันที่"]}
              disabledDate={(current) => current && current.toDate() > new Date()}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="กำลังโหลดข้อมูล..." />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : chartData.length === 0 ? (
        <p className="text-center text-gray-500 h-64 flex items-center justify-center">ไม่มีข้อมูลในช่วงเวลานี้</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="display_label"
                tick={{ fontSize: 12 }}
                angle={granularity === "today" ? 0 : -45}
                textAnchor={granularity === "today" ? "middle" : "end"}
                height={granularity === "today" ? 60 : 80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="message_count"
                stroke="#5DE2FF"
                strokeWidth={2}
                dot={{ fill: "#5DE2FF", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#5DE2FF" }}
                name="จำนวนข้อความ"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChatTrendChart;
