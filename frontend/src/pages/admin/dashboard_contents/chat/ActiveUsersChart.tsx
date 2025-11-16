import React, { useEffect, useState } from "react";
import {  Select, Spin } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { getActiveUsers } from "../../../../services/https/Chat";

const { Option } = Select;

interface ActiveUser {
  period: string; // จาก API
  count: number;  // จาก API
}

const ActiveUsersChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getActiveUsers(granularity);

      const raw: ActiveUser[] =
        Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];

      const transformed = raw.map((item: ActiveUser) => {
        const date = new Date(item.period);
        let label = "";

        if (granularity === "day") {
          // วัน-เดือน แบบชื่อเดือนย่อ (เช่น 02 ก.ย.)
          label = date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short"
          });
        }else if (granularity === "week") {
          // สัปดาห์ที่ xx/ปี
          const oneJan = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            (((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
          );
          label = `สัปดาห์ที่ ${weekNumber}/${date.getFullYear() + 543}`;
        } else if (granularity === "month") {
          // เดือน ชื่อเต็ม/ปี
          label = date.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
        }

        return {
          ...item,
          label,
          visits: item.count
        };
      });

      setData(transformed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [granularity]);

  // นำไปใส่ใน component ActiveUsersChart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow">
        <p className="font-medium">
          {granularity === "day" ? `วันที่: ${label}` :
           granularity === "week" ? `สัปดาห์: ${label}` :
           `เดือน: ${label}`}
        </p>
        <p className="text-button-blue">
          ผู้ใช้งาน: {payload[0].value} คน
        </p>
      </div>
    );
  }
  return null;
};

  return (
    <div  className="rounded-2xl mb-4 bg-white p-4">
       <div className="flex justify-center items-center h-12 font-bold">
             <h1>แนวโน้มผู้ใช้งานระบบ</h1>
        </div>
      <div className="flex justify-end mb-2">
        <Select
          value={granularity}
          onChange={val => setGranularity(val as any)}
          style={{ width: 150 }}
          className="custom-select"
        >
          <Option value="day">รายวัน</Option>
          <Option value="week">รายสัปดาห์</Option>
          <Option value="month">รายเดือน</Option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="visits"
                stroke="#5DE2FF"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ActiveUsersChart;
