// src/pages/mirror/MonthlyOverviewPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMirrorSummary } from "../../services/https/mirror";
import type { IMonthlySummary } from "../../interfaces/IMonthlySummary";

/* ===== URL builder สำหรับภาพอิโมจิ (เหมือนใน MoodSelector) ===== */
const apiUrl = import.meta.env.VITE_API_URL as string;

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;

function buildImageSrc(picture: string): string {
  if (!picture) return "";
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emoji\//i.test(picture)) return joinUrl(apiUrl, picture);
  return joinUrl(apiUrl, `images/emoji/${picture}`);
}

/* ===== helpers ===== */
function parseInitialMonth(param: string | null): Date {
  if (param && /^\d{4}-\d{2}(-\d{2})?$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function MonthlyOverviewPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  // month base จาก query ?date=YYYY-MM (หรือ YYYY-MM-DD)
  const [base, setBase] = useState<Date>(() => parseInitialMonth(search.get("date")));
  const [rows, setRows] = useState<IMonthlySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // sync URL ให้เป็น ?date=YYYY-MM ทุกครั้งที่ base เปลี่ยน
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
  <div className="min-h-dvh bg-gradient-to-b from-sky-200 to-white flex flex-col">
    {/* Top bar */}
    <header className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="h-9 w-9 rounded-full grid place-items-center hover:bg-black/5 active:scale-95"
        aria-label="ย้อนกลับ"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* หัวเรื่อง + ตัวเลือกเดือน อยู่ "แถวเดียวกัน" */}
      <div className="flex items-center gap-3 sm:gap-4">
        <h1 className="font-ibmthai text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap">
          สรุปอารมณ์รายเดือน
        </h1>
        <input
          type="month"
          value={`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`}
          onChange={(e) => {
            const [yy, mm] = e.currentTarget.value.split("-").map(Number);
            if (!Number.isNaN(yy) && !Number.isNaN(mm)) {
              setBase(new Date(yy, (mm ?? 1) - 1, 1));
            }
          }}
          className="h-9 rounded-lg ring-1 ring-black-200 px-3 text-sm shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-sky-300"
          aria-label="เลือกเดือนและปี"
        />
      </div>

      {/* spacer ให้สมดุลซ้าย/ขวา */}
      <div className="w-9" />
    </header>

    {/* Content */}
    <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 pb-6">
      {loading ? (
        <div className="h-full grid place-items-center text-slate-500">กำลังโหลดข้อมูล…</div>
      ) : (
        <div className="h-[calc(100dvh-112px)]">
          <div
            className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            style={{ gridAutoRows: "1fr" }}
          >
            {rows.map((row) => {
              const src = buildImageSrc(row.picture);
              const count = row.count ?? 0;

              return (
                <section
                  key={row.eid}
                  className="
                    h-full rounded-2xl
                    bg-white/70 backdrop-blur-md
                    ring-1 ring-white/60
                    shadow-[0_8px_20px_rgba(0,0,0,0.06)]
                    p-4 sm:p-5
                    flex flex-col
                  "
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-ibmthai font-semibold text-slate-800">
                      {row.mood || "อารมณ์"}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-xs sm:text-sm bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                      {count} ครั้ง
                    </span>
                  </div>

                  <div className="my-3 border-t border-slate-200/60" />

                  <div className="flex-1 min-h-0">
                    {count === 0 ? (
                      <div className="h-full grid place-items-center text-slate-400 text-sm italic">
                        — ไม่มีข้อมูลเดือนนี้ —
                      </div>
                    ) : (
                      <div className="grid grid-cols-12 md:grid-cols-14 lg:grid-cols-16 gap-2 content-start">
                        {Array.from({ length: count }).map((_, i) => (
                          <img
                            key={`${row.eid}-${i}`}
                            src={src}
                            alt=""
                            className="h-6 w-6 sm:h-7 sm:w-7 object-contain select-none"
                            draggable={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className="mt-3 h-3 rounded-full bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-15 blur-[4px]"
                    aria-hidden
                  />
                </section>
              );
            })}
          </div>
        </div>
      )}
    </main>
  </div>
);

}
