import { useEffect, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { getMirrorSummary } from "../../services/https/mirror";
import type { IMonthlySummary } from "../../interfaces/IMonthlySummary";
import Header from "./components/Header";
import "./components/styles/mirror.css";

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
  const [search, setSearch] = useSearchParams();

  // month base จาก query ?date=YYYY-MM (หรือ YYYY-MM-DD)
  const [base, setBase] = useState<Date>(() => parseInitialMonth(search.get("date")));
  const [rows, setRows] = useState<IMonthlySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ====== ป๊อปอัปเลือกเดือน (ภาษาไทย) ======
  const [openMonthPicker, setOpenMonthPicker] = useState(false);
  const [panelYear, setPanelYear] = useState(base.getFullYear());
  useEffect(() => setPanelYear(base.getFullYear()), [base]);

  useEffect(() => {
    if (!openMonthPicker) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMonthPicker(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMonthPicker]);

  const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

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

  const thLabel = new Intl.DateTimeFormat("th-TH-u-nu-latn", {
    month: "long",
    year: "numeric",
    calendar: "gregory",
  }).format(base);

  // --- style var แบบ type-safe (ไม่มี any) ---
  type CSSVariables = CSSProperties & { ["--rows"]: number };
  const gridRowsStyle: CSSVariables = { ["--rows"]: Math.max(rows.length, 1) };

  return (
    <div className="mirror-root h-dvh overflow-y-auto [scrollbar-gutter:stable_both-edges] bg-gradient-to-b from-sky-200 to-white flex flex-col">
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
            <main className="w-full h-full py-0 pb-6 md:pb-10 flex flex-col [padding-bottom:max(env(safe-area-inset-bottom),1rem)]">
              {/* ตัวเลือกเดือน (ป๊อปอัปภาษาไทย) */}
              <div className="mt-2 relative">
                <label className="sr-only" htmlFor="month-btn">เลือกเดือน</label>

                <button
                  id="month-btn"
                  type="button"
                  onClick={() => setOpenMonthPicker(v => !v)}
                  className="w-full flex items-center gap-2 rounded-xl h-11 px-3 bg-white/95 ring-1 ring-slate-200 shadow-sm"
                >
                  <span aria-hidden className="grid place-items-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v2m8-2v2M4 7h16M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
                    </svg>
                  </span>
                  <span className="min-w-0 w-full text-base sm:text-lg leading-none px-1 py-0.5 text-center font-ibmthai font-light">
                    {thLabel}
                  </span>
                </button>

                {openMonthPicker && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setOpenMonthPicker(false)}
                      aria-label="ปิดตัวเลือกเดือน"
                    />
                    <div
                      role="dialog"
                      aria-label="เลือกเดือน"
                      className="absolute z-30 mt-2 w-[280px] sm:w-[320px] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 left-1/2 -translate-x-1/2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
                          onClick={() => setPanelYear(y => y - 1)}
                          aria-label="ปีก่อนหน้า"
                        >«</button>
                        <div className="font-ibmthai font-medium">{panelYear}</div>
                        <button
                          type="button"
                          className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
                          onClick={() => setPanelYear(y => y + 1)}
                          aria-label="ปีถัดไป"
                        >»</button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {TH_MONTHS.map((m, idx) => {
                          const isActive = panelYear === base.getFullYear() && idx === base.getMonth();
                          return (
                            <button
                              type="button"
                              key={m}
                              onClick={() => {
                                setBase(new Date(panelYear, idx, 1));
                                setOpenMonthPicker(false);
                              }}
                              className={[
                                "h-9 rounded-md text-sm ring-1 ring-slate-200 hover:bg-slate-50",
                                isActive ? "bg-sky-600 text-white ring-sky-600 hover:bg-sky-600" : "bg-white"
                              ].join(" ")}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                        <button
                          type="button"
                          className="hover:underline"
                          onClick={() => {
                            const d = new Date();
                            setPanelYear(d.getFullYear());
                            setBase(new Date(d.getFullYear(), d.getMonth(), 1));
                            setOpenMonthPicker(false);
                          }}
                        >
                          เดือนนี้
                        </button>
                        <button type="button" className="hover:underline" onClick={() => setOpenMonthPicker(false)}>
                          ปิด
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* กล่องสรุป: แบ่งความสูงที่เหลือให้เท่ากันทุกกล่อง */}
              <div
                className="mt-6 flex-1 min-h-0 grid gap-4 md:gap-5 [grid-template-rows:repeat(var(--rows),minmax(0,1fr))]"
                style={gridRowsStyle}
              >
                {loading ? (
                  <div className="h-full grid place-items-center text-slate-500">กำลังโหลดข้อมูล…</div>
                ) : (
                  rows.map((row, idx) => {
                    const src = buildImageSrc(row.picture);
                    const count = row.count ?? 0;
                    return (
                      <section
                        key={`${row.eid ?? "x"}-${row.mood ?? "m"}-${idx}`}
                        className="h-full rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-4 sm:p-5 flex flex-col"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-ibmthai font-semibold text-slate-800">{row.mood || "อารมณ์"}</h3>
                          <span className="px-2.5 py-1 rounded-full text-xs sm:text-sm bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                            {count} ครั้ง
                          </span>
                        </div>

                        <div className="my-3 border-t border-slate-200/60" />

                        {count === 0 ? (
                          <div className="grid place-items-center text-slate-400 text-sm italic">— ไม่มีข้อมูลเดือนนี้ —</div>
                        ) : (
                          <div className="grid grid-cols-12 md:grid-cols-14 lg:grid-cols-16 gap-2 content-start">
                            {Array.from({ length: count }).map((_, i) => (
                              <img
                                key={`${row.eid ?? idx}-emo-${i}`}
                                src={src}
                                alt=""
                                className="h-6 w-6 sm:h-7 sm:w-7 object-contain select-none"
                                draggable={false}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    );
                  })
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
