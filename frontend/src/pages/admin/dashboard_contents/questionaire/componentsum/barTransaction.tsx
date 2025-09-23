import { useEffect, useState } from "react";
import { GetCountTaken } from "../../../../../services/https/dashboardcontents";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BarTransactionProps {
  uid: number;
}

interface UserAssessmentSummary {
  questionnaire_name: string;
  count_taken: number;
}

function BarTransaction({ uid }: BarTransactionProps) {
  const [data, setData] = useState<UserAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#7CEDC6", "#FFBB28", "#FF6F61", "#6A5ACD", "#00C49F", "#FF8042"];

  async function GetData(id: number) {
    try {
      setLoading(true);
      const res = await GetCountTaken(id);
      setData(res);
        
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    GetData(uid);
  }, [uid]);

  // Function to truncate long questionnaire names for mobile
  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  // Custom tick component for responsive text
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const maxLength = window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 15 : 20;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="#666"
          className="text-xs sm:text-sm"
        >
          {truncateName(payload.value, maxLength)}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl mb-4 bg-white p-4 sm:p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-64 sm:h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-2xl mb-4 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4">
          จำนวนครั้งที่ทำแบบสอบถาม
        </h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-sm sm:text-base">ไม่พบข้อมูลแบบสอบถาม</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const color = payload[0].fill;
      const count = payload[0].value;
      return (
        <div
          className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs"
          style={{ minWidth: 150 }}
        >
          <p className="font-semibold text-sm sm:text-base mb-1" style={{ color }}>
            {label}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            จำนวนครั้ง: <span className="font-semibold">{count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Responsive chart height
  const getChartHeight = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 250; // mobile
      if (window.innerWidth < 1024) return 300; // tablet
      return 350; // desktop
    }
    return 300; // default
  };

  // Responsive margin
  const getMargin = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) {
        return { top: 10, right: 10, left: 10, bottom: 40 }; // mobile
      }
      if (window.innerWidth < 1024) {
        return { top: 15, right: 20, left: 15, bottom: 45 }; // tablet
      }
    }
    return { top: 20, right: 30, left: 20, bottom: 50 }; // desktop
  };

  return (
    <div className="rounded-2xl mb-4 sm:mb-6 bg-white p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
        จำนวนครั้งที่ทำแบบสอบถาม
      </h3>
      
      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={getChartHeight()}>
          <BarChart 
            data={data} 
            margin={getMargin()}
            barCategoryGap="15%"
          >
            <XAxis 
              dataKey="questionnaire_name" 
              tick={<CustomXAxisTick />}
              interval={0}
              height={60}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              width={40}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(124, 237, 198, 0.1)' }}
            />
            <Bar 
              dataKey="count_taken" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {data.map((_entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend for mobile when names are truncated */}
      <div className="mt-4 sm:hidden">
        <div className="text-xs text-gray-600 space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="truncate">{item.questionnaire_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BarTransaction;