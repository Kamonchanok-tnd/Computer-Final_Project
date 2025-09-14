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

  const COLORS = ["#7CEDC6", "#FFBB28", "#FF6F61", "#6A5ACD", "#00C49F", "#FF8042"]; // เพิ่มสีหลายแบบ

  async function GetData(id: number) {
    try {
      setLoading(true);
      const res = await GetCountTaken(id);
      setData(res);
      console.log("Getdata : ", res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    GetData(uid);
  }, [uid]);

  if (loading) return <p>Loading chart...</p>;
  if (!data.length) return <p>No assessment data found.</p>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const color = payload[0].fill;
      const count = payload[0].value;
      return (
        <div
          className="bg-white p-2 rounded shadow-lg border border-gray-200"
          style={{ minWidth: 150 }}
        >
          <p className="font-semibold" style={{ color }}>
            {label}
          </p>
          <p>จำนวนครั้ง: {count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl mb-4 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">จำนวนครั้งที่ทำแบบสอบถาม</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="questionnaire_name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count_taken">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarTransaction;
