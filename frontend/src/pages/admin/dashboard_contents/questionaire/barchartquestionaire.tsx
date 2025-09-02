import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchQuestionnaireStats } from "../../../../services/https/dashboardcontents";

interface Stats {
  name_questionnaire: string;
  total_taken: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA46BE",
  "#FF6F61",
  "#6A5ACD",
  "#20B2AA",
];

const DashboardQuestionnaire = () => {
  const [data, setData] = useState<Stats[]>([]);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  const loadStats = async () => {
    const res = await fetchQuestionnaireStats();
    setData(res || []);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="rounded-2xl mb-4 bg-white p-4 border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">จำนวนการทำแบบสอบถาม</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 rounded ${chartType === "bar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`px-4 py-2 rounded ${chartType === "pie" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      <div className="flex gap-8 mt-4">
        {/* กราฟ */}
        <div>
          {chartType === "bar" ? (
            <BarChart
              width={700}
              height={400}
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <XAxis
  dataKey="name_questionnaire"
  angle={-30}
  textAnchor="end"
  interval={0}
  tick={{ fontSize: 12 }}
  tickFormatter={(name) => (name.length > 15 ? name.slice(0, 15) + "..." : name)}
/>

              <YAxis />
              <Tooltip />
              <Bar dataKey="total_taken" barSize={30}>
                {data.map((_, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart width={700} height={400}>
              <Pie
                data={data}
                dataKey="total_taken"
                nameKey="name_questionnaire"
                cx="40%"
                cy="50%"
                outerRadius={120}
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </div>

        {/* Legend กล่องสี */}
        <div className="flex flex-col gap-2 justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item.name_questionnaire}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardQuestionnaire;
