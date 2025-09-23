import { useMemo, useState } from "react";
import MonthlyReportGrid from "./MonthlyReportGrid";
import MonthlyReportChart from "./MonthlyReportChart";
import type { IMonthlySummary } from "../../../../interfaces/IMonthlySummary";
import MoodMascot, { type MascotMood } from "./MoodMascot";

type Props = { rows: IMonthlySummary[]; loading: boolean };

const tabItems = [
  { key: "grid", label: "ภาพรวมทั้งเดือน" },
  { key: "chart", label: "แบบเปอร์เซ็นต์" },
];

export default function MonthlyReportTab({ rows, loading }: Props) {
  const [activeTab, setActiveTab] = useState<"grid" | "chart">("grid");

  // หาอารมณ์ที่มีจำนวนมากที่สุดของเดือน (เอาไว้แสดงมาสคอต)
  const mascotMood: MascotMood = useMemo(() => {
    const top = [...(rows ?? [])]
      .filter((r) => (r.count ?? 0) > 0)
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];

    const name = (top?.mood ?? "").toLowerCase();
    if (name.includes("สุข")) return "happy";
    if (name.includes("โกรธ")) return "angry";
    if (name.includes("เศร้า")) return "sad";
    return "neutral";
  }, [rows]);

  return (
    <section className="mt-3 sm:mt-4 h-full min-h-0 flex flex-col">
      {/* หัวแท็บ */}
      <div className="flex justify-center gap-8 sm:gap-12 mb-3 shrink-0">
        {tabItems.map((tab) => {
          const isActive = activeTab === (tab.key as "grid" | "chart");
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "grid" | "chart")}
              className={`relative pb-1.5 transition-all duration-200 ${
                isActive
                  ? "text-slate-900 font-medium"
                  : "text-slate-400 hover:text-sky-600"
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

      {/* เนื้อหาแท็บ (สกรอลล์ได้) */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "grid" ? (
          <MonthlyReportGrid rows={rows} loading={loading} />
        ) : (
          <>
            {/* กล่องชาร์ต (การ์ด) */}
            <MonthlyReportChart rows={rows} loading={loading} />

            {/* มาสคอตอยู่นอกการ์ด ใต้ชาร์ต */}
            <div className="mt-3 sm:mt-4 pb-1 flex justify-center">
              <MoodMascot
                mood={mascotMood}
                size={120} // ปรับ 100–160 ตามต้องการ
                label={
                  mascotMood === "happy"
                    ? "เดือนนี้อารมณ์ดีนำหน้า เย้!"
                    : mascotMood === "angry"
                    ? "เดือนนี้หงุดหงิดบ่อยหน่อย"
                    : mascotMood === "sad"
                    ? "เดือนนี้ค่อนข้างหม่น ลองพักผ่อนหน่อยนะ"
                    : "อารมณ์ค่อนข้างนิ่ง ๆ ทั้งเดือน"
                }
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
