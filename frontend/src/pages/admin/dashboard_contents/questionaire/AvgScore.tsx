import { ReactNode, useEffect, useState, useMemo } from "react";
import { Select, Spin, InputNumber } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { AverageScoreData, getAverageScore } from "../../../../services/https/dashboardcontents";
import { getAllQuestionnaires } from "../../../../services/https/questionnaire";
import NoData from "../../../secondary function/Playlist/Component/noSoundplaylist";

const { Option } = Select;

const AverageScoreCard = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<AverageScoreData | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [gender, setGender] = useState<string | null>(null);
  const [ageMin, setAgeMin] = useState<number | null>(null);
  const [ageMax, setAgeMax] = useState<number | null>(null);

  // โหลดรายการแบบสอบถาม
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const res = await getAllQuestionnaires();
        setQuestionnaires(res);
        if (res.length > 0) setSelectedId(res[0]?.id ?? null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestionnaires();
  }, []);

  // โหลดคะแนนเฉลี่ย พร้อม Filter
  useEffect(() => {
    if (selectedId === null) return;

    const loadAverageScore = async (id: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (gender) params.append("gender", gender);
        if (ageMin !== null) params.append("age_min", ageMin.toString());
        if (ageMax !== null) params.append("age_max", ageMax.toString());

        const res = await getAverageScore(id, params.toString());
        setData(res);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAverageScore(selectedId);
  }, [selectedId, gender, ageMin, ageMax]);

  // แปลงข้อมูลสำหรับกราฟ และ memoize
  const chartData = useMemo(() => {
    if (!data?.trend || data.trend.length === 0) return [];
    return data.trend.map(t => ({
      date: new Date(t.date).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
      }),
      fullDate: t.date,
      avg: Number(t.avgScore.toFixed(1)),
    }));
  }, [data?.trend]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">
            {new Date(data.fullDate).toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-blue-600 font-semibold">คะแนนเฉลี่ย: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl w-full shadow-sm">
      {/* Header + Select + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">คะแนนเฉลี่ยแบบสอบถาม</h2>

        <div className="flex flex-wrap gap-3 items-center">
          {/* แบบสอบถาม */}
          <Select
            className="custom-select"
            value={selectedId}
            onChange={(value) => setSelectedId(value)}
            style={{ width: 200 }}
            placeholder="เลือกแบบสอบถาม"
          >
            {questionnaires.map((q) => (
              <Option key={q.id} value={q.id}>
                {q.nameQuestionnaire}
              </Option>
            ))}
          </Select>

          {/* เพศ */}
          <Select
            className="custom-select"
            value={gender ?? undefined}
            onChange={(value) => setGender(value)}
            placeholder="เลือกเพศ"
            style={{ width: 120 }}
            allowClear
          >
             <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="LGBTQ+">LGBTQ+</option>
                <option value="ไม่ระบุ">ไม่ระบุ</option>
          </Select>

          {/* ช่วงอายุ */}
          <InputNumber
             placeholder="อายุต่ำสุด"
            value={ageMin ?? undefined}
            onChange={(value) => setAgeMin(value ?? null)}
            min={0}
            style={{ width: 120 }}
          />
          <InputNumber
            placeholder="อายุสูงสุด"
            value={ageMax ?? undefined}
            onChange={(value) => setAgeMax(value ?? null)}
            min={0}
            style={{ width: 120 }}
          />
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
            <Spin tip="กำลังโหลด..." size="large" />
          </div>
        )}

        {data ? (
          <div className="space-y-6">
            {/* สถิติหลัก */}
            <div className="text-center space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">คะแนนเฉลี่ย</p>
                <p className="text-4xl font-bold text-blue-600">{data.averageScore.toFixed(1)}</p>
                <p className="text-gray-500 text-sm mt-1">จาก {data.maxScore} คะแนน</p>
              </div>

              {/* สถิติเพิ่มเติม */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">ผู้ทำแบบสอบถาม</p>
                  <p className="text-lg font-semibold text-gray-700">{data.totalTaken}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">คะแนนสูงสุด</p>
                  <p className="text-lg font-semibold text-green-600">{data.maxScore}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">คะแนนต่ำสุด</p>
                  <p className="text-lg font-semibold text-orange-600">{data.minScore}</p>
                </div>
              </div>
            </div>

            {/* กราฟแนวโน้ม */}
            {chartData.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  แนวโน้มคะแนนเฉลี่ย 
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                      />
                      <YAxis
                        domain={["dataMin - 0.5", "dataMax + 0.5"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        stroke="#5DE2FF"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          stroke: "#5DE2FF",
                          strokeWidth: 2,
                          fill: "white",
                          filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))",
                        }}
                        activeDot={{ r: 7, stroke: "#5DE2FF", strokeWidth: 2, fill: "#5DE2FF" }}
                      >
                        <LabelList
                          dataKey="avg"
                          position="top"
                          offset={10}
                          formatter={(label: ReactNode) =>
                            typeof label === "number" ? label.toFixed(1) : label
                          }
                          style={{ fontSize: "12px", fontWeight: 600, fill: "#374151" }}
                        />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 w-full h-64">
               <NoData message="ไม่พบข้อมูล" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
          
            <p className="text-gray-500">กำลังโหลดข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageScoreCard;
