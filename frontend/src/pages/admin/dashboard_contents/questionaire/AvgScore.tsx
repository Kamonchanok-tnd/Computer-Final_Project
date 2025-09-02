import React, { ReactNode, useEffect, useState } from "react";
import { Select, Spin } from "antd";
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

const { Option } = Select;



const AverageScoreCard = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<AverageScoreData | null>(null);
  const [loading, setLoading] = useState(false);

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

  // โหลดคะแนนเฉลี่ย
  useEffect(() => {
    if (selectedId === null) return;

    const loadAverageScore = async (id: number) => {
      setLoading(true);
      try {
        const res = await getAverageScore(id);
        console.log(res);
        setData(res);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAverageScore(selectedId);
  }, [selectedId]);

  // ปรับปรุงการแปลงข้อมูลสำหรับกราฟ
  const chartData = data?.trend.map(t => ({
    date: new Date(t.date).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
    }),
    fullDate: t.date,
    avg: Number(t.avgScore.toFixed(1)),
  })) ?? [];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3  border-gray-200 rounded-lg ">
          <p className="text-gray-600 text-sm">
            {new Date(data.fullDate).toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-blue-600 font-semibold">
            คะแนนเฉลี่ย: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl  w-full">
      {/* Header + Select */}
      <div className="flex  justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">คะแนนเฉลี่ยแบบสอบถาม</h2>
        <Select
         className="custom-select"
          value={selectedId}
          onChange={(value) => setSelectedId(value)}
          style={{ width: "100%", maxWidth: 300 }}
          placeholder="เลือกแบบสอบถาม"
        >
          {questionnaires.map((q) => (
            <Option key={q.id} value={q.id}>
              {q.nameQuestionnaire}
            </Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin tip="กำลังโหลด..." size="large" />
        </div>
      ) : data ? (
        <div className="space-y-6 ">
          {/* สถิติหลัก */}
          <div className="text-center space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
              <p className="text-gray-600 text-sm mb-1">คะแนนเฉลี่ย</p>
              <p className="text-4xl font-bold text-blue-600">
                {data.averageScore.toFixed(1)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                จาก {data.maxScore} คะแนน
              </p>
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
          {chartData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 text-center">
                แนวโน้มคะแนนเฉลี่ย (5 วันล่าสุด)
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ 
                        r: 5, 
                        stroke: "#3B82F6", 
                        strokeWidth: 2, 
                        fill: "white",
                        filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))"
                      }}
                      activeDot={{ 
                        r: 7, 
                        stroke: "#3B82F6", 
                        strokeWidth: 2, 
                        fill: "#3B82F6" 
                      }}
                    >
                      <LabelList
                        dataKey="avg"
                        position="top"
                        offset={10}
                        formatter={(label: ReactNode) => typeof label === 'number' ? label.toFixed(1) : label}
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          fill: "#374151"
                        }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">ไม่พบข้อมูลคะแนนเฉลี่ย</p>
        </div>
      )}
    </div>
  );
};

export default AverageScoreCard;