// MirrorCard.tsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import { Info } from "lucide-react";
import { getDailyMirrorUsage , DailyMirrorUsage } from "../../../../services/https/dashboardcontents";
interface MirrorCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const MirrorCard: React.FC<MirrorCardProps> = ({
  title = "ระบายความรู้สึก",
  className = "bg-purple-200",
  onViewMore,
}) => {
  const [data, setData] = useState<DailyMirrorUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMirrorData = async () => {
      try {
        const res = await getDailyMirrorUsage();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลระบายความรู้สึกได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMirrorData();
  }, []);

  const totalDays = data.length;

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title}
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-1 rounded-full hover:bg-purple-300 transition"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info className="w-5 h-5 text-purple-700" />
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
                <XAxis dataKey="day" />
                <Tooltip
                  formatter={(value: any) => [`${value} ครั้ง`, "ระบาย"]}
                  labelFormatter={(label) => {
                    const item = data.find((d) => d.day === label);
                    return item ? `${label} - ${item.title}` : label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#9C27B0"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2">รวม {totalDays} วัน</p>
        </>
      )}
    </div>
  );
};

export default MirrorCard;
