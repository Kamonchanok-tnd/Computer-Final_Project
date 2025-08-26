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
  getDailyASMRUsage,
  DailyVideoUsage,
} from "../../../../services/https/dashboardcontents";

interface ASMRCardProps {
  onViewMore?: () => void;
}

const ASMRCard: React.FC<ASMRCardProps> = ({ onViewMore }) => {
  const [data, setData] = useState<DailyVideoUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchASMRData = async () => {
      try {
        const res = await getDailyASMRUsage();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล ASMR ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchASMRData();
  }, []);

  const totalViews = data.reduce((sum, d) => sum + d.view_count, 0);

  return (
    <div className="rounded-2xl p-4 shadow-md bg-pink-100 relative">
      <h2 className="font-semibold mb-2 flex items-center justify-between text-pink-900">
        ASMR
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-1 rounded-full hover:bg-pink-200 transition"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info className="w-5 h-5 text-pink-700" />
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
                  formatter={(v: any) => [`${v} ครั้ง`, "ASMR"]}
                />
                <Line
                  type="monotone"
                  dataKey="view_count"
                  stroke="#f7bcd9ff" // ชมพูเพสเทลสดใส
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#bd6792ff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2 text-pink-900">
            รวม {totalViews} ครั้ง
          </p>
        </>
      )}
    </div>
  );
};

export default ASMRCard;
