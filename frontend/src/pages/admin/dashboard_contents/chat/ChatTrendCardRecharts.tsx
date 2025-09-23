import React, { useEffect, useState } from "react";
import {  Spin } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { GetChatUsage } from "../../../../services/https/Chat";
import "./custom-selector.css";

interface HourlyUsage {
  hour: number;
  messages: number;
  label: string;
}

interface ChatTrendMessagesFilterProps {
  title?: string;
  className?: string;
  onViewMore?: () => void;
}

const ChatTrendMessagesFilter: React.FC<ChatTrendMessagesFilterProps> = ({
  title = "แนวโน้มข้อความวันนี้ (รายชั่วโมง)",
  className = "bg-white",
  onViewMore,
}) => {
  const [data, setData] = useState<HourlyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลรายชั่วโมงวันนี้จาก backend
        const res = await GetChatUsage("today", "user");
   

        if (!res || res.length === 0) {
          setData([]);
          return;
        }

        // แปลงข้อมูลเป็น HourlyUsage
        const hours: HourlyUsage[] = res
          .map((item: { date: string; message_count: number }) => {
            const dateObj = new Date(item.date); // backend ต้องส่งเวลา +07:00
            return {
              hour: dateObj.getHours(),
              messages: item.message_count,
              label: `${dateObj.getHours().toString().padStart(2, "0")}:00`,
            };
          })
          .sort((a: HourlyUsage, b: HourlyUsage) => a.hour - b.hour);

        setData(hours);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล Trend ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={`rounded-2xl p-4 shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="p-2 rounded-full hover:bg-background-button hover:text-blue-word transition flex justify-center items-center"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <EllipsisOutlined className="text-white text-lg" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="กำลังโหลดข้อมูล..." />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 text-center h-64 flex justify-center items-center">
          ไม่มีข้อมูลในวันนี้
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value} ข้อความ`, "จำนวนข้อความ"]}
                labelFormatter={(label) => `เวลา: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#5DE2FF"
                name="จำนวนข้อความ"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChatTrendMessagesFilter;
