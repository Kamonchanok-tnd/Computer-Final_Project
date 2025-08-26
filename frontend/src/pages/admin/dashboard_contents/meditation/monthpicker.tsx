import React from "react";

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

const MonthPickerMed: React.FC<MonthPickerProps> = ({ value, onChange, label = "เลือกเดือน" }) => {
  // แปลง Date → "YYYY-MM"
  const formatValue = (date?: Date) => {
    if (!date) return ""; // ถ้า date เป็น undefined
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  // handle เมื่อ user เลือกเดือนใหม่
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [year, month] = val.split("-").map(Number);
    onChange(new Date(year, month - 1, 1));
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type="month"
        value={formatValue(value)}
        onChange={handleChange}
        className="px-3 py-2 rounded-lg border !bg-white border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-white-400"
      />
    </div>
  );
};

export default MonthPickerMed;  
