import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { Getstatus } from "../../../../services/https/Chat";

interface SessionStatus {
  is_close: boolean;
  count: number;
}

const COLORS = ["#5DE2FF", "#686868"]; // สีสำหรับ Open / Closed

const DashboardSessionsStatus: React.FC = () => {
  const [data, setData] = useState<SessionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await Getstatus(); 
        setData(res);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = data.map((item) => ({
    name: item.is_close ? "ปิดใช้งาน" : "กำลังใช้งาน",
    value: item.count,
  }));

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded shadow border border-gray-200">
          <p className="font-medium">{data.name}</p>
          <p>จำนวน: {data.value} ห้อง</p>
          
        </div>
      );
    }
    return null;
  };
  

  return (
    <div  className="rounded-2xl bg-white h-full space-y-4">
        <div className="flex justify-center items-center h-12 font-bold">
             <h1>สถานะห้องแชท</h1>
        </div>
       
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="กำลังโหลดข้อมูล..." />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : pieData.length === 0 ? (
        <p className="text-gray-500 text-center h-64 flex items-center justify-center">
          ไม่มีข้อมูล
        </p>
      ) : (
        <div className="h-64 ">
          <ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={pieData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label={({ name, value }) => {
        if (!value) return `${name}: 0%`;
        const total = pieData.reduce((sum, entry) => sum + entry.value, 0);
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `${name}: ${percent}%`;
      }}
    >
      {pieData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip content={<CustomPieTooltip />} />
    <Legend verticalAlign="top" />
  </PieChart>
</ResponsiveContainer>

        </div>
      )}
    </div>
  );
};

export default DashboardSessionsStatus;
