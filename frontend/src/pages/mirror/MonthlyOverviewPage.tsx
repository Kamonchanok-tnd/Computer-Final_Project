import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "./components/Header";
import SideOrnaments from "./components/SideOrnaments";
import MonthPicker from "./components/MonthPicker";
import MonthlyReport from "./components/MonthlyReport";
import { getMirrorSummary } from "../../services/https/mirror";
import type { IMonthlySummary } from "../../interfaces/IMonthlySummary";

/* === parse ?date=YYYY-MM (หรือ YYYY-MM-DD) เป็น Date ของวันที่ 1 ของเดือนนั้น === */
function parseInitialMonth(param: string | null): Date {
  if (param && /^\d{4}-\d{2}(-\d{2})?$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function MonthlyOverviewPage() {
  const [search, setSearch] = useSearchParams();
  const [base, setBase] = useState<Date>(() => parseInitialMonth(search.get("date")));
  const [rows, setRows] = useState<IMonthlySummary[]>([]);
  const [loading, setLoading] = useState(false);

  // sync URL ?date=YYYY-MM ทุกครั้งที่ base เปลี่ยน
  useEffect(() => {
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    setSearch(prev => {
      const next = new URLSearchParams(prev);
      next.set("date", `${y}-${m}`);
      return next;
    }, { replace: true });
  }, [base, setSearch]);

  // โหลดสรุปทั้งเดือนจาก backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const monthParam = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`;
      setLoading(true);
      try {
        const data = await getMirrorSummary(monthParam);
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [base]);

  return (
    <div className="mirror-root h-dvh overflow-y-auto [scrollbar-gutter:stable_both-edges] bg-gradient-to-b from-sky-200 to-white flex flex-col font-ibmthai">
      <SideOrnaments />

      {/* Header มือถือ */}
      <div className="md:hidden">
        <Header title="สรุปอารมณ์รายเดือน" showOverviewButton={false} />
      </div>

      {/* Header เดสก์ท็อป (กว้างเท่ากับ content) */}
      <div className="hidden md:block">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 pt-3 pb-3">
            <Header title="สรุปอารมณ์รายเดือน" showOverviewButton={false} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <div className="mx-auto w-full px-4 sm:px-6 md:px-8 h-full">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 h-full">
            <main className="w-full h-full py-0 pb-6 md:pb-10 flex flex-col">
              {/* ตัวเลือกเดือน */}
              <div className="mt-2">
                <MonthPicker value={base} onChange={setBase} label={""} />
              </div>

              {/* รายงานรายเดือน */}
              <MonthlyReport rows={rows ?? []} loading={loading} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
