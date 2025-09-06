import React from "react";
import { DatePicker, ConfigProvider } from "antd";
import type { DatePickerProps } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th"; // locale ภาษาไทย
import thTH from "antd/locale/th_TH"; // locale ของ antd

dayjs.locale("th"); // ใช้ locale ไทย

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

const MonthPickerMed: React.FC<MonthPickerProps> = ({ value, onChange, label = "เลือกเดือน" }) => {
  const dayjsValue = value ? dayjs(value) : null;

  const handleChange: DatePickerProps["onChange"] = (date) => {
    if (!date) return;
    onChange(date.toDate());
  };

  return (
    <ConfigProvider locale={thTH}>
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium">{label}</label>}
        <DatePicker
          picker="month"
          value={dayjsValue}
          onChange={handleChange}
          className="w-full"
          format="MMMM YYYY" // แสดงเดือนแบบไทย เช่น "สิงหาคม 2025"
          placeholder="เลือกเดือน"
        />
      </div>
    </ConfigProvider>
  );
};

export default MonthPickerMed;
