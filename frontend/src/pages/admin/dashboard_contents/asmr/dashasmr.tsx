import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getDailyASMRUsage,
  DailyVideoUsage,
} from "../../../../services/https/dashboardcontents";

const DashboardASMR: React.FC = () => {
  const [asmrData, setAsmrData] = useState<DailyVideoUsage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDailyASMRUsage();
        setAsmrData(res);
      } catch (err) {
        console.error("Error fetching ASMR data:", err);
      }
    };
    fetchData();
  }, []);

  // รวมยอดวิวทั้งหมด
  const totalViews = asmrData.reduce((sum, item) => sum + item.view_count, 0);

  // จำนวนวัน
  const uniqueDays = new Set(asmrData.map((item) => item.date)).size;

  // ค่าเฉลี่ยต่อวัน
  const avgPerDay =
    uniqueDays > 0 ? (totalViews / uniqueDays).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">รวมการดู</p>
          <p className="text-2xl font-bold">{totalViews} ครั้ง</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-600">เฉลี่ยต่อวัน</p>
          <p className="text-2xl font-bold">{avgPerDay} ครั้ง</p>
        </div>
      </div>

      {/* Trend Line */}
      <div className="bg-blue-100 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4">Trend Line (ASMR ต่อวัน)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={asmrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                  })
                }
              />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
                formatter={(value: any) => [`${value} ครั้ง`, "views"]}
              />
              <Line
                type="monotone"
                dataKey="view_count"
                stroke="#2196F3"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardASMR;
