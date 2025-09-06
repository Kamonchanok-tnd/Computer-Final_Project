// MirrorCard.tsx
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Info } from "lucide-react";
import { getMonthlyMirrorUsage, MonthlyMirrorUsage } from "../../../../services/https/dashboardcontents";
import MonthPickerMed from "../meditation/monthpicker";
import { EllipsisOutlined } from "@ant-design/icons"; // ใช้ Antd Ellipsis

interface MirrorCardProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const COLORS = ["#9C27B0", "#BA68C8", "#E1BEE7", "#F3E5F5", "#CE93D8"];

const MirrorCard: React.FC<MirrorCardProps> = ({
  title = "ระบายความรู้สึก",
  className = "bg-white",
  onViewMore,
}) => {
  const [data, setData] = useState<MonthlyMirrorUsage[]>([]);
  const [filteredData, setFilteredData] = useState<MonthlyMirrorUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchMirrorData = async () => {
      setLoading(true);
      try {
        const res = await getMonthlyMirrorUsage();
        // สร้าง monthLabel สำหรับ PieChart
        const formatted = res.map((item) => ({
          ...item,
          monthLabel: new Date(item.year, item.month - 1).toLocaleString("th-TH", { month: "short", year: "numeric" }),
        }));
        setData(formatted);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลระบายความรู้สึกได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMirrorData();
  }, []);

  // filter data ตามเดือนที่เลือก
  useEffect(() => {
    const month = selectedMonth.getMonth() + 1;
    const year = selectedMonth.getFullYear();
    const filtered = data.filter((item) => item.month === month && item.year === year);
    setFilteredData(filtered);
  }, [selectedMonth, data]);

  const totalCounts = filteredData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className} relative`}>
      <h2 className="font-semibold mb-2 flex items-center justify-between">
        {title}
        {/* {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-2 rounded-full bg-white/50 hover:bg-purple-300 transition flex justify-center items-center"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <EllipsisOutlined className="text-white text-lg" />
          </button>
        )} */}
      </h2>

      {/* Month Picker */}
      <div className="mb-3">
        <MonthPickerMed value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredData.length === 0 ? (
        <p>ไม่มีข้อมูลในเดือนนี้</p>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  dataKey="count"
                  nameKey="monthLabel"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={false}
                  labelLine={false} // ปิดเส้น
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} ครั้ง`, "ระบาย"]} />
                <Legend
      verticalAlign="bottom"
      align="center"
      content={() => (
        <div className="flex justify-center items-center mt-2 space-x-2">
          {filteredData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="font-semibold text-gray-700">การระบายความรู้สึก</span>
            </div>
          ))}
        </div>
      )}
    />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* แสดงเดือนที่เลือก */}
          {/* <p className="text-md font-medium mt-2 text-center">
            เดือน: {selectedMonth.toLocaleString("th-TH", { month: "long", year: "numeric" })}
          </p> */}

          <p className="text-lg-center font-bold mt-2">รวม {totalCounts} ครั้ง</p>
        </>
      )}
    </div>
  );
};

export default MirrorCard;
