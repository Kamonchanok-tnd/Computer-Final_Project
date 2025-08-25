import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Info } from "lucide-react";
import {
  getDailyBreathingUsage,
  DailyVideoUsage,
} from "../../../../services/https/dashboardcontents";

interface BreathingCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const BreathingCard: React.FC<BreathingCardProps> = ({
  title = "Breathing Exercise",
  className = "bg-orange-100",
  onViewMore,
}) => {
  const [data, setData] = useState<DailyVideoUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      console.log("Fetching Breathing data..."); // เริ่มดึงข้อมูล
      const res = await getDailyBreathingUsage();
      console.log("Raw response from service:", res); // ดูว่า service return อะไร
      setData(res);

      const totalViewsCheck = res.reduce((sum, d) => sum + d.view_count, 0);
      console.log("Total views calculated:", totalViewsCheck); // เช็คจำนวนรวม
    } catch (err) {
      console.error("Error fetching Breathing data:", err);
      setError("ไม่สามารถโหลดข้อมูลการฝึกหายใจได้");
    } finally {
      setLoading(false);
      console.log("Finished fetching Breathing data"); // โหลดเสร็จ
    }
  };
  fetchData();
}, []);


  const totalViews = data.reduce((sum, d) => sum + d.view_count, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between text-orange-900">
        {title}
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-1 rounded-full hover:bg-orange-200 transition"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info className="w-5 h-5 text-orange-700" />
          </button>
        )}
      </h2>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  }
                  formatter={(value: any) => [`${value} ครั้ง`, "การฝึกหายใจ"]}
                />
                <Line
                  type="monotone"
                  dataKey="view_count"
                  stroke="#fb923c" // ส้มอ่อนสดใส
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#fb923c" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2 text-orange-900">
            รวม {totalViews} ครั้ง
          </p>
        </>
      )}
    </div>
  );
};

export default BreathingCard;
