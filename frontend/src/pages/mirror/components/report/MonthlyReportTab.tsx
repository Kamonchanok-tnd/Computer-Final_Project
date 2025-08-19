import { useState } from "react";
import MonthlyReportGrid from "./MonthlyReportGrid";
import MonthlyReportChart from "./MonthlyReportChart";
import type { IMonthlySummary } from "../../../../interfaces/IMonthlySummary";

type Props = { rows: IMonthlySummary[]; loading: boolean };

const tabItems = [
  { key: "grid", label: "ภาพรวมทั้งเดือน" },
  { key: "chart", label: "แบบเปอร์เซ็นต์" },
];

export default function MonthlyReportTab({ rows, loading }: Props) {
  const [activeTab, setActiveTab] = useState("grid");

  return (
    <section className="mt-3 sm:mt-4 h-full min-h-0 flex flex-col">
      {/* หัวแท็บ (ไม่สกรอลล์) */}
      <div className="flex justify-center gap-8 sm:gap-12 mb-3 shrink-0">
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-1.5 transition-all duration-200 ${
                isActive ? "text-slate-900 font-medium" : "text-slate-400 hover:text-sky-600"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-full h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* เนื้อหาแท็บ (เป็นโซนที่สกรอลล์ได้) */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "grid" ? (
          <MonthlyReportGrid rows={rows} loading={loading} />
        ) : (
          <MonthlyReportChart rows={rows} loading={loading} />
        )}
      </div>
    </section>
  );
}
