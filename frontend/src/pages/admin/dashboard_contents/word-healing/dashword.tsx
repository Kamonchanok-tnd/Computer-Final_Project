// DashboardWordHealing.tsx (รายเดือน)
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Info } from "lucide-react";
import { getMonthlyWordHealingViews,MonthlyViewsByTitle} from "../../../../services/https/dashboardcontents";

const COLORS = ["#FFC107", "#FFB300", "#FFCA28", "#FFD54F", "#FFE082", "#FFD740"];

const DashboardWordHealing: React.FC = () => {
  const [data, setData] = useState<MonthlyViewsByTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const res = await getMonthlyWordHealingViews();
        // สร้าง monthLabel เช่น "ส.ค. 2025"
        const formatted = res.map((item) => ({
          ...item,
          monthLabel: new Date(item.year, item.month - 1).toLocaleString("th-TH", {
            month: "short",
            year: "numeric",
          }),
        }));
        setData(formatted);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล Word Healing ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyData();
  }, []);

  const totalViews = data.reduce((sum, item) => sum + item.total_views, 0);

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      <div className="bg-yellow-200 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4">การอ่านต่อเดือน</h2>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total_views"
                    nameKey="monthLabel"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.monthLabel} (${entry.total_views})`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} ครั้ง`, "Views"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-lg font-bold mt-2">รวม {totalViews} ครั้ง</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardWordHealing;
