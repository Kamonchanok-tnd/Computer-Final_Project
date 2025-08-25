// MusicCard.tsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts";
import { Info } from "lucide-react";
import { getDailySoundUsage } from "../../../../services/https/dashboardcontents"; // import service ของคุณ

interface MusicData {
  day: string;
  plays: number;
}

interface MusicCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const MusicCard: React.FC<MusicCardProps> = ({
  title = "คอนเทนต์สมาธิ",
  className = "bg-blue-200", // สีพื้นหลังฟ้าพาสเทลอ่อน
  onViewMore,
}) => {
  const [data, setData] = useState<MusicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const response = await getDailySoundUsage();
        const formattedData = response.map((item: any) => ({
          day: new Date(item.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          plays: item.play_count,
        }));
        setData(formattedData);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicData();
  }, []);

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
                <Bar dataKey="plays" fill="#64B5F6" radius={[10, 10, 0, 0]} />
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
