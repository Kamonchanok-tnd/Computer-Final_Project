// src/pages/admin/AdminDashboardContent.tsx
import { useEffect, useState } from "react";
import {
  getVisitFrequency,
  getRetentionRate,
  VisitFrequency,
  RetentionRate,
} from "../../../services/https/activity";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import admin from "../../../assets/analysis.png";

export default function AdminDashboardContent() {
  const [visitData, setVisitData] = useState<VisitFrequency[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const visits = await getVisitFrequency();
        const retention = await getRetentionRate();

        // แปลงวันที่เป็นรูปแบบไทยและเก็บใน key ใหม่ 'day'
        const formattedVisits = visits.map((item) => ({
          ...item,
          day: new Date(item.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));

        const formattedRetention = retention.map((item) => ({
          ...item,
          day: new Date(item.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));

        setVisitData(formattedVisits);
        setRetentionData(formattedRetention);
      } catch (error) {
        console.error("ไม่สามารถโหลดข้อมูลได้:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-700 flex items-center gap-2">
        <img src={admin} alt="Admin" className="w-13 h-13" />
        แดชบอร์ดเว็บไซต์
      </h2>
      {/* Visit Frequency */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">ความถี่การเข้าชมเว็บไซต์</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={visitData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" /> {/* ใช้ day แทน date */}
            <YAxis />
            <Tooltip formatter={(value: any) => `${value} ครั้ง`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#3b82f6"
              strokeWidth={2}
              name="จำนวนผู้เข้าชม"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Retention Rate */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">อัตราการกลับมาใช้ซ้ำ (%)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={retentionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" /> {/* ใช้ day แทน date */}
            <YAxis unit="%" />
            <Tooltip formatter={(value: any) => `${value}%`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="retentionRate"
              stroke="#10b981"
              strokeWidth={2}
              name="อัตราการกลับมาใช้ซ้ำ"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
