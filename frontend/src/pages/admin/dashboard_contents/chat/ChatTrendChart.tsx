import React, { useEffect, useState } from "react";
import { Spin, Select, DatePicker } from "antd";
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
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [granularity, setGranularity] = useState<"today" | "day" | "month" | "year" | "custom">("today");
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const filter: "user" = "user"; // เอาเฉพาะข้อความจาก user

  // Hook สำหรับติดตามขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

  // ฟังก์ชันสำหรับคำนวณค่าต่างๆ ตามขนาดหน้าจอ
  const getResponsiveValues = () => {
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth < 1024;
    
    return {
      fontSize: isMobile ? 10 : 12,
      chartHeight: isMobile ? 250 : isTablet ? 300 : 320,
      xAxisHeight: granularity === "today" ? (isMobile ? 50 : 60) : (isMobile ? 70 : 80),
      margins: {
        top: 10,
        right: isMobile ? 10 : 20,
        left: isMobile ? -10 : 0,
        bottom: isMobile ? 5 : 10
      },
      dotRadius: isMobile ? 3 : 4,
      activeDotRadius: isMobile ? 5 : 6,
      strokeWidth: isMobile ? 1.5 : 2
    };
  };

  const responsive = getResponsiveValues();

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
        <div className="bg-white p-2 sm:p-3 rounded shadow border text-xs sm:text-sm">
          <p className="font-medium">{granularity === "today" ? `เวลา: ${label}` : `วันที่: ${label}`}</p>
          <p className="text-button-blue">จำนวนข้อความ: {payload[0].value} ข้อความ</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-2xl p-3 sm:p-4 lg:p-6 ${className}`}>
      {/* Header with Controls - Responsive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
        <h2 className="font-semibold text-sm sm:text-base lg:text-lg">{title}</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
          <Select 
            value={granularity} 
            onChange={val => setGranularity(val)} 
            style={{ width: windowWidth < 640 ? '100%' : 120 }}
            className="custom-select"
            size={windowWidth < 640 ? 'small' : 'middle'}
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
              className="custom-range-picker w-full sm:w-auto"
              placeholder={["เริ่มวันที่", "สิ้นสุดวันที่"]}
              disabledDate={(current) => current && current.toDate() > new Date()}
              size={windowWidth < 640 ? 'small' : 'middle'}
            />
          )}
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <Spin tip="กำลังโหลดข้อมูล..." size={windowWidth < 640 ? 'default' : 'large'} />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm sm:text-base text-center py-8">{error}</p>
      ) : chartData.length === 0 ? (
        <p className="text-center text-gray-500 h-48 sm:h-64 flex items-center justify-center text-sm sm:text-base">
          ไม่มีข้อมูลในช่วงเวลานี้
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <div style={{ height: responsive.chartHeight, minWidth: windowWidth < 640 ? '100%' : 'auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={responsive.margins}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0" 
                  opacity={windowWidth < 640 ? 0.5 : 1}
                />
                <XAxis
                  dataKey="display_label"
                  tick={{ fontSize: responsive.fontSize }}
                  angle={granularity === "today" ? 0 : (windowWidth < 640 ? -60 : -45)}
                  textAnchor={granularity === "today" ? "middle" : "end"}
                  height={responsive.xAxisHeight}
                  interval={windowWidth < 640 && chartData.length > 10 ? 'preserveStartEnd' : 0}
                />
                <YAxis 
                  tick={{ fontSize: responsive.fontSize }}
                  width={windowWidth < 640 ? 35 : 50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="message_count"
                  stroke="#5DE2FF"
                  strokeWidth={responsive.strokeWidth}
                  dot={{ 
                    fill: "#5DE2FF", 
                    strokeWidth: responsive.strokeWidth, 
                    r: responsive.dotRadius 
                  }}
                  activeDot={{ 
                    r: responsive.activeDotRadius, 
                    fill: "#5DE2FF",
                    stroke: "#fff",
                    strokeWidth: 2
                  }}
                  name="จำนวนข้อความ"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTrendChart;