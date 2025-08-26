// MusicCard.tsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts";
import { Info } from "lucide-react"; // ใช้ไอคอน Info

interface MusicCardProps {
  title?: string; // ชื่อการ์ด
  data: { day: string; plays: number }[];
  loading: boolean;
  error: string | null;
  className?: string; // สีหรือ style เพิ่มเติม
  onViewMore?: () => void; // callback เมื่อกดดูข้อมูลเพิ่มเติม
}

const MusicCard: React.FC<MusicCardProps> = ({
  title = "คอนเทนต์สมาธิ",
  data,
  loading,
  error,
  className = "bg-blue-200",
  onViewMore,
}) => {
  const totalPlays = data.reduce((sum, item) => sum + item.plays, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title}
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-1 rounded-full hover:bg-blue-300 transition"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info className="w-5 h-5 text-blue-700" />
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
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <Tooltip />
                <Bar dataKey="plays" fill="#2196F3" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-lg font-bold mt-2">{totalPlays} เพลง</p>
        </>
      )}
    </div>
  );
};

export default MusicCard;
