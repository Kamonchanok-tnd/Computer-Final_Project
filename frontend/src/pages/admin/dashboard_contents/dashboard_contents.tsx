import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  getSoundFourType,
  getDailyBreathingUsage,
  getDailyASMRUsage,
  getDailyMeditationUsage,
  getDailyChantingUsage,
} from "../../../services/https/dashboardcontents";
import { DatePicker, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { BookOpenCheck, ListMusic } from "lucide-react";
import thTH from "antd/locale/th_TH";
dayjs.locale("th");

interface MusicData {
  month: string; // ชื่อเดือนภาษาไทย
  monthIndex: number; // 0-11
  category: string;
  plays: number;
  year: number;
}

interface TrackData {
  sound_name: string;
  plays: number;
  category?: string;
}

const DashboardContents: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [categoryTracks, setCategoryTracks] = useState<TrackData[]>([]);

  const categoryColors: Record<string, string> = {
    "สมาธิ": "#7bed7f",
    "สวดมนต์": "#AFD5F0",
    "ฝึกหายใจ": "#ffbc59",
    "asmr": "#ee8fff",
  };

  const categoryService: Record<string, () => Promise<any[]>> = {
    "สมาธิ": getDailyMeditationUsage,
    "สวดมนต์": getDailyChantingUsage,
    "ฝึกหายใจ": getDailyBreathingUsage,
    "asmr": getDailyASMRUsage,
  };

  // Fetch summary data
  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const res = await getSoundFourType();
        const formattedData: MusicData[] = res.reduce((acc: MusicData[], item: any) => {
          const monthIndex = item.month - 1; // 0-11
          const monthStr = dayjs(new Date(item.year, monthIndex)).locale("th").format("MMM");

          const existing = acc.find(d => d.month === monthStr && d.category === item.category);
          if (existing) existing.plays += item.play_count;
          else acc.push({
            month: monthStr,
            monthIndex,
            category: item.category,
            plays: item.play_count,
            year: item.year
          });
          return acc;
        }, []);
        setMusicData(formattedData);

        if (formattedData.length > 0) {
          const latestYear = Math.max(...formattedData.map(d => d.year));
          setSelectedYear(latestYear);
        }
      } catch (err) {
        console.error("Error fetching music data:", err);
      }
    };
    fetchMusicData();
  }, []);

  // หลังจาก useEffect สำหรับ fetchMusicData
useEffect(() => {
  // โหลด Top Tracks ของสวดมนต์ทันที
  handleCategoryClick("สวดมนต์");
}, []);


  // Filter data ตามปี
  const filteredData = musicData.filter(d => selectedYear ? d.year === selectedYear : true);

  const totalPlays = filteredData.reduce((sum, item) => sum + item.plays, 0);
  const uniqueMonths = new Set(filteredData.map(d => d.month)).size;
  const avgPerMonth = uniqueMonths > 0 ? (totalPlays / uniqueMonths).toFixed(1) : 0;

  // Pivot data สำหรับ stacked bar chart (12 เดือนเต็ม)
  const monthsFull = Array.from({ length: 12 }, (_, i) => i); // 0-11
  const pivotData = Object.values(
    filteredData.reduce((acc: Record<string, any>, item) => {
      if (!acc[item.monthIndex]) acc[item.monthIndex] = { monthIndex: item.monthIndex };
      acc[item.monthIndex][item.category] = (acc[item.monthIndex][item.category] || 0) + item.plays;
      return acc;
    }, {})
  );

  const pivotDataFull = monthsFull.map((monthIndex) => {
    const monthData = pivotData.find(d => d.monthIndex === monthIndex);
    const monthStr = dayjs().month(monthIndex).locale("th").format("MMM"); // ม.ค., ก.พ., ...
    
    return {
      month: monthStr,
      ...Object.fromEntries(Object.keys(categoryColors).map(cat => [
        cat,
        monthData ? monthData[cat] || 0 : 0
      ])),
      monthIndex
    };
  });

  // กด category เพื่อโหลด Top 3 เพลง
  const handleCategoryClick = async (name: string) => {
    setSelectedCategory(name === "All" ? null : name);

    const combineTracks = (tracks: TrackData[]) => {
      const grouped: Record<string, TrackData> = {};
      tracks.forEach(track => {
        if (grouped[track.sound_name]) {
          grouped[track.sound_name].plays += track.plays;
        } else {
          grouped[track.sound_name] = { ...track };
        }
      });
      return Object.values(grouped);
    };

    if (name === "All") {
      const allTracks: TrackData[] = [];
      for (const cat of Object.keys(categoryService)) {
        try {
          const res = await categoryService[cat]();
          const formattedTracks: TrackData[] = res.map((item: any) => ({
            sound_name: item.sound_name,
            plays: item.play_count ?? item.plays ?? 0,
            category: cat,
          }));
          allTracks.push(...formattedTracks);
        } catch (err) {
          console.error(`Error fetching tracks for ${cat}:`, err);
        }
      }
      const combined = combineTracks(allTracks);
      combined.sort((a, b) => b.plays - a.plays);
      setCategoryTracks(combined.slice(0, 3));
    } else if (categoryService[name]) {
      try {
        const res = await categoryService[name]();
        const formattedTracks: TrackData[] = res.map((item: any) => ({
          sound_name: item.sound_name,
          plays: item.play_count ?? item.plays ?? 0,
        }));
        const combined = combineTracks(formattedTracks);
        combined.sort((a, b) => b.plays - a.plays);
        setCategoryTracks(combined.slice(0, 3));
      } catch (err) {
        console.error("Error fetching category tracks:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3D2C2C] p-6 space-y-6">
      {/* สรุปยอดรวม */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#98e0f4] to-[#d3f0f8] rounded-2xl p-6 text-center flex justify-around items-center gap-8 ">
          <div className="bg-white text-[#39a6c3] p-4 rounded-full shadow-lg shadow-[#39a6c3]/20">
            <ListMusic size={30} />
          </div>
          <div>
            <p className="text-gray-600">รวมการเล่น</p>
            <p className="text-2xl font-bold text-gray-600">{totalPlays} ครั้ง</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f9c2e0] to-[#fcd9f1] rounded-2xl p-6 text-center flex justify-around items-center gap-8">
  <div className="bg-white text-[#e57bbf] p-4 rounded-full shadow-lg shadow-[#e57bbf]/20">
    <BookOpenCheck size={30} />
  </div>
  <div>
    <p className="text-gray-600">เฉลี่ยต่อเดือน</p>
    <p className="text-2xl font-bold text-gray-600">{avgPerMonth} ครั้ง</p>
  </div>
</div>

      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-[2fr_1fr] gap-4">
  
        <div className="bg-blue-100 rounded-2xl shadow-md p-6 ">
          <h2 className="font-semibold text-lg mb-2">Top Categories</h2>

          {/* ปุ่มเลือกประเภท */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["สวดมนต์", "ฝึกหายใจ", "asmr", "สมาธิ"].map((name, idx) => (
              <button
                key={idx}
                onClick={() => handleCategoryClick(name)}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedCategory === name || (!selectedCategory && name === "All")
                    ? "bg-blue-500 text-white"
                    : "bg-blue-200 hover:bg-blue-300"
                }`}
              >
                {name}
              </button>
            ))}
          </div>


          {/* แสดง Top Tracks */}
          {categoryTracks.length > 0 && (
            <div className="bg-blue-50 rounded-2xl shadow-md p-6 mt-4">
              <h2 className="font-semibold text-lg mb-2 text-grey-800">
                {selectedCategory === null ? "Top Tracks (รวมทุกประเภท)" : `Top 3 ${selectedCategory}`}
              </h2>
              <ol className="list-decimal ml-6 space-y-1 text-grey-900">
                {categoryTracks.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      {item.sound_name} {item.category ? `(${item.category})` : ""}
                    </span>
                    <span className="font-bold">{item.plays} ครั้ง</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

          <div className="bg-gradient-to-br from-[#c7eab7] to-[#d7f2ca] rounded-2xl p-6 text-center space-y-4">
          <p className="text-gray-600 font-semibold">จำนวนครั้งแต่ละประเภท</p>
          <div className="flex flex-col gap-2">
            {Object.entries(
              filteredData.reduce((acc: Record<string, number>, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.plays;
                return acc;
              }, {})
            ).map(([category, plays]) => (
              <div
                key={category}
                className="flex justify-between bg-white/50 rounded-lg px-4 py-2 shadow-sm"
              >
                <span className="font-medium">{category}</span>
                <span className="font-bold">{plays} ครั้ง</span>
              </div>
            ))}
          </div>
        </div>



      </div>

      {/* Trend Stacked Bar พร้อมเลือกปี */}
      <div className="bg-yellow-100 rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Trend (แยกตาม Category)</h2>
          <ConfigProvider locale={thTH}>
            <div className="flex gap-2">
              <DatePicker
                picker="year"
                value={selectedYear ? dayjs().year(selectedYear) : dayjs()}
                onChange={(date: Dayjs | null) => setSelectedYear(date ? date.year() : null)}
                placeholder="เลือกปี"
                className="rounded-lg"
                format="YYYY"
              />
            </div>
          </ConfigProvider>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pivotDataFull}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(categoryColors).map((cat, idx) => (
                <Bar
                  key={idx}
                  dataKey={cat}
                  stackId="a"
                  fill={categoryColors[cat] || "#000000"}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardContents;
