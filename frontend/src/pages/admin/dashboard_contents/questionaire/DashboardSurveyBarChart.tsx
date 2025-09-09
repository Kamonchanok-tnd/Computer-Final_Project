import React, { ReactNode, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell, ResponsiveContainer } from "recharts";
import { getSurveyVisualization, SurveyVisualizationData } from "../../../../services/https/dashboardcontents";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE", "#FF6F61", "#6A5ACD", "#20B2AA"];

const DashboardSurveyBarChart = () => {
  const [withResults, setWithResults] = useState(true);
  const [chartData, setChartData] = useState<SurveyVisualizationData[]>([]);
  const [stackedData, setStackedData] = useState<any[]>([]);
  const [resultLevels, setResultLevels] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Hook สำหรับติดตามขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

  // ฟังก์ชันสำหรับคำนวณค่าต่างๆ ตามขนาดหน้าจอ
  const getResponsiveValues = () => {
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth < 1024;
    
    return {
      fontSize: isMobile ? 10 : 12,
      barSize: isMobile ? 35 : isTablet ? 45 : 55,
      maxLength: isMobile ? 8 : isTablet ? 12 : 15,
      yAxisWidth: isMobile ? 25 : 45,
      labelFontSize: isMobile ? 9 : 11,
      tooltipFontSize: isMobile ? '11px' : '13px',
      tooltipPadding: isMobile ? '6px' : '10px',
      bottomMargin: isMobile ? 80 : 60
    };
  };

  const responsive = getResponsiveValues();

  return (
    <div className="rounded-2xl bg-white p-3 sm:p-4 lg:p-6 flex flex-col gap-4">
      {/* Header with Toggle Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold">ผลลัพธ์และยอดการทำแบบสอบถาม</h2>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setWithResults(true)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              withResults ? "bg-background-button text-blue-word" : "bg-transparent border border-gray-300"
            }`}
          >
            แสดงผลลัพธ์
          </button>
          <button
            onClick={() => setWithResults(false)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              !withResults ? "bg-background-button text-blue-word" : "bg-transparent border border-gray-300"
            }`}
          >
            แสดงยอด
          </button>
        </div>
      </div>

      {/* Chart and Legend Container */}
      <div className="flex flex-col lg:flex-row w-full gap-4">
        {/* Chart Container */}
        <div className="flex-1 min-h-0">
          <div className="h-[350px] sm:h-[400px] lg:h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={withResults ? stackedData : chartData}
                margin={{ 
                  top: 20, 
                  right: 15, 
                  bottom: responsive.bottomMargin,
                  left: 5
                }}
              >
                <XAxis
                  dataKey="name_questionnaire"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(name) => {
                    return name.length > responsive.maxLength ? name.slice(0, responsive.maxLength) + "..." : name;
                  }}
                  style={{ fontSize: responsive.fontSize }}
                  height={responsive.bottomMargin}
                  tick={{ fontSize: responsive.fontSize }}
                />
                <YAxis 
                  style={{ fontSize: responsive.fontSize }}
                  width={responsive.yAxisWidth}
                  tick={{ fontSize: responsive.fontSize }}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: responsive.tooltipFontSize,
                    padding: responsive.tooltipPadding,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                />

                {withResults
                  ? resultLevels.map((level, i) => (
                      <Bar
                        key={level}
                        dataKey={level}
                        stackId="a"
                        fill={COLORS[i % COLORS.length]}
                        barSize={responsive.barSize}
                      >
                        <LabelList
                          dataKey={`${level}_percent`}
                          position="center"
                          formatter={(val: ReactNode) => {
                            if (typeof val === "string" && parseFloat(val) > 5) {
                              return `${val}%`;
                            }
                            return "";
                          }}
                          style={{ 
                            fill: "#fff", 
                            fontSize: responsive.labelFontSize, 
                            fontWeight: "bold" 
                          }}
                        />
                      </Bar>
                    ))
                  : <Bar 
                      dataKey="total_taken" 
                      barSize={responsive.barSize}
                    >
                      {Array.from({ length: chartData.length }).map((_, index) => (
                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                }
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend - Responsive Layout */}
        {withResults && (
          <div className="lg:ml-4 flex flex-col gap-2 justify-start lg:justify-center w-full lg:w-auto p-3 lg:p-4 bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">ผลลัพธ์แต่ละสี</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-2">
              {resultLevels.map((level, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" 
                    style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                  />
                  <span className="text-xs sm:text-sm truncate" title={level}>{level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!withResults && (
          <div className="lg:ml-4 flex flex-col gap-2 justify-start lg:justify-center w-full lg:w-auto p-3 lg:p-4 bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none max-h-80 lg:max-h-none overflow-y-auto lg:overflow-visible">
            <h4 className="font-semibold mb-2 text-sm sm:text-base sticky top-0 bg-gray-50 lg:bg-transparent pb-1 z-10">
              ยอดนิยมแต่ละแบบ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1 lg:gap-2">
              {chartData.map((data, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" 
                    style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                  />
                  <span className="text-xs sm:text-sm truncate" title={data.name_questionnaire}>
                    {data.name_questionnaire}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSurveyBarChart;