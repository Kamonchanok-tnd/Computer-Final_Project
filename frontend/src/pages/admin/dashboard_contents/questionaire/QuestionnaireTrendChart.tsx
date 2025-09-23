import React, { useEffect, useState } from "react";
import {  Spin, Select } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { AverageScoreData, getAverageScore } from "../../../../services/https/dashboardcontents";
import { getAllQuestionnaires } from "../../../../services/https/questionnaire";

const { Option } = Select;

interface TrendData {
  date: string;
  fullDate: string;
  avg: number;
}

interface QuestionnaireTrendChartProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const QuestionnaireTrendChart: React.FC<QuestionnaireTrendChartProps> = ({
  title = "แนวโน้มคะแนนเฉลี่ยแบบสอบถาม",
  className = "bg-white",
  onViewMore,
}) => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดรายการแบบสอบถาม
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const res = await getAllQuestionnaires();
        setQuestionnaires(res);
        if (res.length > 0) setSelectedId(res[0]?.id ?? null);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดรายการแบบสอบถามได้");
      }
    };
    fetchQuestionnaires();
  }, []);

  // โหลดข้อมูลแนวโน้ม
  useEffect(() => {
    if (selectedId === null) return;

    const loadTrendData = async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const res: AverageScoreData = await getAverageScore(id);
       

        if (!res || !res.trend || res.trend.length === 0) {
          setData([]);
          return;
        }

        // แปลงข้อมูลสำหรับกราฟ
        const chartData: TrendData[] = res.trend.map(t => ({
          date: new Date(t.date).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
          }),
          fullDate: t.date,
          avg: Number(t.avgScore.toFixed(1)),
        }));

        setData(chartData);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลแนวโน้มได้");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrendData(selectedId);
  }, [selectedId]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
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
    <div className={`rounded-2xl p-4 shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <div className="">
        <Select
        className="custom-select"
          value={selectedId}
          onChange={(value) => setSelectedId(value)}
          style={{ width: "100%" }}
          placeholder="เลือกแบบสอบถาม"
          loading={questionnaires.length === 0}
        >
          {questionnaires.map((q) => (
            <Option key={q.id} value={q.id}>
              {q.nameQuestionnaire}
            </Option>
          ))}
        </Select>
      </div>

        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-2 rounded-full  hover:bg-background-button hover:text-blue-word transition flex justify-center items-center"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <EllipsisOutlined className="text-lg" />
          </button>
        )}
      </div>

      {/* Select Questionnaire */}
      
      {/* Chart Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="กำลังโหลดข้อมูล..." />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-red-500">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">ไม่มีข้อมูลแนวโน้ม</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#5DE2FF"
                name="คะแนนเฉลี่ย"
                strokeWidth={3}
                dot={{ 
                  r: 5, 
                  stroke: "#5DE2FF", 
                  strokeWidth: 2, 
                  fill: "white"
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: "#5DE2FF", 
                  strokeWidth: 2, 
                  fill: "#5DE2FF" 
                }}
              >
                <LabelList
                  dataKey="avg"
                  position="top"
                  offset={10}
                  formatter={(val: any) => typeof val === 'number' ? val.toFixed(1) : val}
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
      )}
    </div>
  );
};

export default QuestionnaireTrendChart;