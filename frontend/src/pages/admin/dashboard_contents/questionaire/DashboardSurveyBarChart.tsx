import React, { ReactNode, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell, ResponsiveContainer } from "recharts";
import { getSurveyVisualization, SurveyVisualizationData } from "../../../../services/https/dashboardcontents";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE", "#FF6F61", "#6A5ACD", "#20B2AA"];

const DashboardSurveyBarChart = () => {
  const [withResults, setWithResults] = useState(true);
  const [chartData, setChartData] = useState<SurveyVisualizationData[]>([]);
  const [stackedData, setStackedData] = useState<any[]>([]);
  const [resultLevels, setResultLevels] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getSurveyVisualization(withResults);
      console.log("data is : ",data);
      setChartData(data);

      if (withResults) {
        const levels = Array.from(new Set(data.map(d => d.result_level)));
        setResultLevels(levels);

        const grouped: any = {};
        data.forEach(d => {
          if (!grouped[d.name_questionnaire])
            grouped[d.name_questionnaire] = { name_questionnaire: d.name_questionnaire, total_taken: d.total_taken };
          grouped[d.name_questionnaire][d.result_level] = d.total_count;
        });

        const stackedWithPercent = Object.values(grouped).map((item: any) => {
          const total = levels.reduce((sum, level) => sum + (item[level] || 0), 0); 
          const percentItem: any = { ...item };
          levels.forEach(level => {
            if (percentItem[level]) {
              percentItem[level + "_percent"] = ((percentItem[level] / total) * 100).toFixed(1);
            }
          });
          return percentItem;
        });
        

        setStackedData(stackedWithPercent);
      }
    };

    loadData();
  }, [withResults]);

  return (
    <div className="rounded-2xl bg-white p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-xl font-bold">ผลลัพธ์และยอดการทำแบบสอบถาม</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setWithResults(true)}
            className={`px-4 py-2 rounded-lg ${withResults ? "bg-background-button text-blue-word" : "bg-transparent"}`}
          >
            แสดงผลลัพธ์
          </button>
          <button
            onClick={() => setWithResults(false)}
            className={`px-4 py-2 rounded-lg ${!withResults ? "bg-background-button text-blue-word" : "bg-transparent"}`}
          >
            แสดงยอด
          </button>
        </div>
      </div>

      <div className="flex w-full">
        {/* Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={withResults ? stackedData : chartData}
              margin={{ top: 20, right: 50, bottom: 80 }}
            >
              <XAxis
                dataKey="name_questionnaire"
                angle={-45}
                textAnchor="end"
                interval={0}
                tickFormatter={(name) => (name.length > 15 ? name.slice(0, 15) + "..." : name)}
                style={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />

              {withResults
                ? resultLevels.map((level, i) => (
                    <Bar
                      key={level}
                      dataKey={level}
                      stackId="a"
                      fill={COLORS[i % COLORS.length]}
                      barSize={60}
                    >
                      <LabelList
                        dataKey={`${level}_percent`}
                        position="center"
                        formatter={(val: ReactNode) => (typeof val === "string" ? `${val}%` : "")}
                        style={{ fill: "#fff", fontSize: 12, fontWeight: "bold" }}
                      />
                    </Bar>
                  ))
                : <Bar dataKey="total_taken" barSize={60}>
                    {Array.from({ length: chartData.length }).map((_, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
              }
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend ฝั่งขวา */}
        {withResults && (
          <div className="ml-4 flex flex-col gap-2 justify-center w-auto  p-2">
            <h4 className="font-semibold mb-2">ผลลัพธ์แต่ละสี</h4>
            {resultLevels.map((level, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm">{level}</span>
              </div>
            ))}
          </div>
        )}

        {!withResults && (
          <div className="ml-4 flex flex-col gap-2 justify-center w-auto  p-2">
            <h4 className="font-semibold mb-2">ยอดนิยมแต่ละแบบ</h4>
            {chartData.map((data, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm">{data.name_questionnaire}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSurveyBarChart;
