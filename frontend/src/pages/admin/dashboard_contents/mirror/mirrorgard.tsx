import React, { useEffect, useState } from "react";
import { getMonthlyMirrorUsage, MonthlyMirrorUsage } from "../../../../services/https/dashboardcontents";
import { Select, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface MirrorCardProps {
  title?: string;
  className?: string;
}

type RangeType = "today" | "week" | "month" | "year" | "custom";

const MirrorCard: React.FC<MirrorCardProps> = ({ title = "ระบายความรู้สึก", className = "bg-white" }) => {
  const [data, setData] = useState<MonthlyMirrorUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeType>("today");
  const [count, setCount] = useState(0);
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    const fetchMirrorData = async () => {
      setLoading(true);
      try {
        const res = await getMonthlyMirrorUsage();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลระบายความรู้สึกได้");
      } finally {
        setLoading(false);
      }
    };
    fetchMirrorData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const today = new Date();
    let total = 0;

    switch (range) {
      case "today":
        total = data
          .filter(
            (item) =>
              item.year === today.getFullYear() &&
              item.month === today.getMonth() + 1 &&
              item.day === today.getDate()
          )
          .reduce((sum, i) => sum + i.count, 0);
        break;

      case "week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        total = data
          .filter((item) => {
            if (!item.day) return false;
            const d = new Date(item.year, item.month - 1, item.day);
            return d >= startOfWeek && d <= endOfWeek;
          })
          .reduce((sum, i) => sum + i.count, 0);
        break;

      case "month":
        total = data
          .filter(
            (item) =>
              item.year === today.getFullYear() &&
              item.month === today.getMonth() + 1
          )
          .reduce((sum, i) => sum + i.count, 0);
        break;

      case "year":
        total = data
          .filter((item) => item.year === today.getFullYear())
          .reduce((sum, i) => sum + i.count, 0);
        break;

      case "custom":
        if (customRange) {
          const [start, end] = customRange;
          total = data
            .filter((item) => {
              if (!item.day) return false;
              const d = dayjs(new Date(item.year, item.month - 1, item.day));
              return d.isAfter(start.subtract(1, "day")) && d.isBefore(end.add(1, "day"));
            })
            .reduce((sum, i) => sum + i.count, 0);
        }
        break;
    }

    setCount(total);
  }, [range, data, customRange]);

  return (
    <div className={`rounded-2xl p-6 shadow-md flex flex-col h-90 ${className}`}>
      {/* ส่วนหัว */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <Select
          value={range}
          onChange={(val: RangeType) => setRange(val)}
          style={{ width: 140 }}
          options={[
            { value: "today", label: "วันนี้" },
            { value: "week", label: "รายสัปดาห์" },
            { value: "month", label: "รายเดือน" },
            { value: "year", label: "รายปี" },
            { value: "custom", label: "กำหนดเอง" },
          ]}
        />
      </div>

      {/* RangePicker แสดงด้านบนถ้าเลือก custom */}
            {range === "custom" && (
              <div className="mb-4 text-center">
                <RangePicker
                  value={customRange as [Dayjs, Dayjs] | null}
                  onChange={(values) => setCustomRange(values as [Dayjs, Dayjs] | null)}
                  format="DD/MM/YYYY"
                />
              </div>
            )}



      {/* เนื้อหา */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            

            {/* จำนวนผู้ใช้ */}
            <div className="text-center mt-4">
              <div className="relative flex justify-center items-center mb-2">
                {/* วงกลมพื้นหลัง */}
                <div className="absolute w-32 h-32 rounded-full bg-purple-200 opacity-30" />
                {/* ตัวเลขผู้ใช้ */}
                <p className="text-4xl font-bold text-purple-700 relative z-10">{count}</p>
              </div>
             
            </div>
            
          </>
        )}
        
      </div>

       <p className="text-center text-gray-900 font-bold text-lg">
  จํานวนผู้ใช้
</p>

    </div>
  );
};

export default MirrorCard;
