// src/pages/admin/dashboard_contents/word-healing/dashword.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DatePicker, ConfigProvider, Segmented } from "antd";
import thTH from "antd/locale/th_TH";

import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import weekOfYear from "dayjs/plugin/weekOfYear"; // <-- needed for .week()

import {
  getWordHealingViews,
  ViewsByTitle,
} from "../../../../services/https/dashboardcontents";

import { BookOpenCheck, Calculator, LibraryBig } from "lucide-react";

// ---- dayjs setup ----
dayjs.extend(weekOfYear);
dayjs.locale("th");

type Period = "daily" | "weekly" | "yearly";

const DashboardWordHealingViews: React.FC = () => {
  const [data, setData] = useState<ViewsByTitle[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [period, setPeriod] = useState<Period>("daily");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getWordHealingViews(period);

        const formatted: Array<ViewsByTitle & { label: string }> = res.map(
          (item) => {
            let label = "";
            if (period === "daily") {
              label = dayjs(item.date).format("D MMM");
            } else if (period === "weekly") {
              const w = dayjs(item.date).week();
              const y = dayjs(item.date).year();
              label = `สัปดาห์ที่ ${w} (${y})`;
            } else {
              label = dayjs(item.date).format("YYYY");
            }
            return { ...item, label };
          }
        );

        setData(formatted);

        if (formatted.length > 0) {
          setSelectedDate(dayjs(formatted[formatted.length - 1].date));
        } else {
          setSelectedDate(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [period]);

  // filter by the chosen month/year
  const filteredData = useMemo(() => {
    if (!selectedDate) return data;

    if (period === "daily") {
      return data.filter((item) => dayjs(item.date).isSame(selectedDate, "month"));
    }
    if (period === "weekly") {
      return data.filter((item) => dayjs(item.date).isSame(selectedDate, "year"));
    }
    // yearly: show everything (or same decade/year-range if you prefer)
    return data;
  }, [data, selectedDate, period]);

  const totalViews = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.total_views, 0),
    [filteredData]
  );

  const allArticleTitles = useMemo(
    () => Array.from(new Set(filteredData.map((item) => item.title))),
    [filteredData]
  );

  // aggregate per label for multi-series line
  type ChartDataItem = {
    label: string;
    [title: string]: string | number;
  };

  const chartDataMulti = useMemo(() => {
    const acc: ChartDataItem[] = [];
    for (const item of filteredData) {
      const idx = acc.findIndex((d) => d.label === (item as ViewsByTitle & { label: string }).label);
      if (idx === -1) {
        acc.push({ label: (item as ViewsByTitle & { label: string }).label, [item.title]: item.total_views });
      } else {
        acc[idx][item.title] = (acc[idx][item.title] as number | undefined ?? 0) + item.total_views;
      }
    }
    return acc;
  }, [filteredData]);

  const colors = [
    "#F59E0B",
    "#3B82F6",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#F97316",
    "#6366F1",
    "#14B8A6",
    "#A78BFA",
  ];

  // build “Top 3” safely
  const top3 = useMemo(() => {
    const byTitle = filteredData.reduce<Record<string, ViewsByTitle>>((acc, it) => {
      if (!acc[it.title]) acc[it.title] = { ...it };
      else acc[it.title].total_views += it.total_views;
      return acc;
    }, {});
    return Object.values(byTitle).sort((a, b) => b.total_views - a.total_views).slice(0, 3);
  }, [filteredData]);

  return (
    <ConfigProvider locale={thTH}>
      <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
        {/* summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#f9acd8] to-[#FEEBF6] rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-white text-[#FFCEEA] p-4 rounded-full shadow-lg shadow-[#f9acd8]/20">
              <LibraryBig size={30} />
            </div>
            <div>
              <p className="text-gray-600">จำนวนรายการ (ตามช่วง)</p>
              <p className="text-2xl font-bold text-gray-600">{filteredData.length} รายการ</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
              <BookOpenCheck size={30} />
            </div>
            <div>
              <p className="text-gray-600">รวมการอ่าน</p>
              <p className="text-2xl font-bold text-gray-600">{totalViews.toLocaleString()} ครั้ง</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#fbdd6d] to-[#ffea9f] rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-white text-[#FFC900] p-4 rounded-full shadow-lg shadow-[#FFC900]/20">
              <Calculator size={30} />
            </div>
            <div>
              <p className="text-gray-600">เฉลี่ยต่อรายการ</p>
              <p className="text-2xl font-bold text-gray-600">
                {filteredData.length > 0 ? (totalViews / filteredData.length).toFixed(1) : "0"} ครั้ง
              </p>
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Segmented
            value={period}
            onChange={(val) => setPeriod(val as Period)}
            options={[
              { label: "รายวัน", value: "daily" },
              { label: "รายสัปดาห์", value: "weekly" },
              { label: "รายปี", value: "yearly" },
            ]}
          />
          <DatePicker
            picker={period === "daily" ? "month" : "year"}
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            format={period === "daily" ? "MMMM YYYY" : "YYYY"}
            allowClear={false}
          />
        </div>

        {/* Top 3 Articles */}
        <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-2 text-yellow-800">Top 3 Articles</h2>
          <ol className="list-decimal ml-6 space-y-1 text-yellow-900">
            {top3.map((item, idx) => (
              <li key={`${item.title}-${idx}`} className="flex justify-between">
                <span>{item.title}</span>
                <span className="font-bold">{item.total_views.toLocaleString()} ครั้ง</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trend Line */}
        <div className="bg-yellow-50 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-yellow-800">Trend Line (การอ่าน)</h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataMulti}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFECB3" />
                <XAxis dataKey="label" />
                <Tooltip formatter={(value: number | string, name: string) => [`${value} ครั้ง`, name]} />
                {allArticleTitles.map((title, idx) => (
                  <Line
                    key={title}
                    type="monotone"
                    dataKey={title}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
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
