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
import {
  getWordHealingViews,
  ViewsByTitle,
} from "../../../../services/https/dashboardcontents";
import {
  BookOpenCheck,
  Calculator,
  LibraryBig,
} from "lucide-react";

dayjs.locale("th");

const DashboardWordHealingViews: React.FC = () => {
  const [data, setData] = useState<ViewsByTitle[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [period, _setPeriod] = useState<"daily" | "weekly" | "yearly">("daily");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getWordHealingViews(period);

        const formatted = res.map((item) => {
          let label = "";
          if (period === "daily") {
            label = dayjs(item.date).format("D MMM");
          } else if (period === "weekly") {
              label = `สัปดาห์ที่ ${dayjs(item.date).week()}`;
          } else if (period === "yearly") {
            label = dayjs(item.date).format("YYYY");
          }
          return { ...item, label };
        });

        setData(formatted);

        if (formatted.length > 0) {
          setSelectedDate(dayjs(formatted[formatted.length - 1].date));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [period]);

  // กรองตามวันที่เลือก
  const filteredData = selectedDate
    ? data.filter((item) =>
        period === "daily"
          ? dayjs(item.date).isSame(selectedDate, "month")
          : period === "weekly"
          ? dayjs(item.date).isSame(selectedDate, "year")
          : true
      )
    : data;

  const totalViews = filteredData.reduce(
    (sum, item) => sum + item.total_views,
    0
  );

  // ดึงชื่อบทความทั้งหมด
  const allArticleTitles = Array.from(
    new Set(filteredData.map((item) => item.title))
  );

  // สร้าง chartData สำหรับหลายบทความ
  const chartDataMulti = filteredData.reduce((acc: any[], item) => {
    let dataIndex = acc.findIndex((d) => d.label === item.label);
    if (dataIndex === -1) {
      acc.push({ label: item.label });
      dataIndex = acc.length - 1;
    }
    acc[dataIndex][item.title] = item.total_views;
    return acc;
  }, []);

  // สีสำหรับเส้นกราฟ
  const colors = [
    "#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6",
    "#EC4899", "#F97316", "#6366F1", "#14B8A6", "#A78BFA"
  ];

  return (
    <ConfigProvider locale={thTH}>
      <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
        {/* summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#f9acd8] to-[#FEEBF6] rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-white text-[#FFCEEA] p-4 rounded-full shadow-lg shadow-[#f9acd8]/20">
              <LibraryBig size={30} />
            </div>
            <div>
              <p className="text-gray-600">จำนวนบทความ</p>
              <p className="text-2xl font-bold text-gray-600">
                {filteredData.length} บทความ
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
              <BookOpenCheck size={30} />
            </div>
            <div>
              <p className="text-gray-600">รวมการอ่าน</p>
              <p className="text-2xl font-bold text-gray-600">
                {totalViews} ครั้ง
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#fbdd6d] to-[#ffea9f] rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-white text-[#FFC900] p-4 rounded-full shadow-lg shadow-[#FFC900]/20">
              <Calculator size={30} />
            </div>
            <div>
              <p className="text-gray-600">เฉลี่ยต่อบทความ</p>
              <p className="text-2xl font-bold text-gray-600">
                {filteredData.length > 0
                  ? (totalViews / filteredData.length).toFixed(1)
                  : 0}{" "}
                ครั้ง
              </p>
            </div>
          </div>
        </div>
        {/* Top 3 Articles */}
<div className="bg-yellow-100 rounded-2xl shadow-md p-6">
  <h2 className="font-semibold text-lg mb-2 text-yellow-800">
    Top 3 Articles
  </h2>
  <ol className="list-decimal ml-6 space-y-1 text-yellow-900">
    {Object.values(
      filteredData.reduce((acc, item) => {
        if (!acc[item.title]) {
          acc[item.title] = { ...item };
        } else {
          acc[item.title].total_views += item.total_views;
        }
        return acc;
      }, {} as Record<string, ViewsByTitle>)
    )
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, 3)
      .map((item, idx) => (
        <li key={idx} className="flex justify-between">
          <span>{item.title}</span>
          <span className="font-bold">{item.total_views} ครั้ง</span>
        </li>
      ))}
  </ol>
</div>


        {/* Trend Line */}
        <div className="bg-yellow-50 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-yellow-800">
              Trend Line (การอ่าน)
            </h2>
            <div className="flex gap-2">
              {/* <Select
                value={period}
                onChange={(val) =>
                  setPeriod(val as "daily" | "weekly" | "yearly")
                }
                options={[
                  { value: "daily", label: "รายวัน" },
                  { value: "weekly", label: "รายสัปดาห์" },
                  { value: "yearly", label: "รายปี" },
                ]}
              /> */}
              <DatePicker
                picker={period === "daily" ? "month" : "year"}
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                format={period === "daily" ? "MMMM YYYY" : "YYYY"}
                allowClear={false}
              />
            </div>
          </div>

          

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataMulti}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFECB3" />
                <XAxis dataKey="label" />
                <Tooltip
                  formatter={(value, name: any) => [`${value} ครั้ง`, name]}
                />
                {allArticleTitles.map((title, idx) => (
                  <Line
                    key={title}
                    type="monotone"
                    dataKey={title}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DashboardWordHealingViews;
