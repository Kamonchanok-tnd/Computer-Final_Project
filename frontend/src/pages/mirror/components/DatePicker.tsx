import { useEffect, useMemo, useState } from "react";

type Props = {
  value: string;               // YYYY-MM-DD
  onChange: (v: string) => void;
  loading?: boolean;
  saving?: boolean;
  /** ปีต่ำสุดที่อนุญาตให้เลือก (ดีฟอลต์ 2000) */
  minYear?: number;
};

/* ===== Helpers ===== */
const WEEKDAYS_TH: string[] = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const TH_MONTHS: string[] = [
"ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
  "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."
];

function parseISODate(s: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function getMonthMatrix(year: number, month: number) {
  // month: 0-11, เริ่มสัปดาห์วันอาทิตย์, 6 แถว x 7 = 42 ช่อง
  const first = new Date(year, month, 1);
  const firstDow = first.getDay(); // 0=Sun
  const start = new Date(year, month, 1 - firstDow);
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

type ViewMode = "days" | "monthYear";

export default function DatePicker({
  value,
  onChange,
  loading,
  saving,
  minYear = 2000,
}: Props) {
  const current = parseISODate(value);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ViewMode>("days");

  const [panelYear, setPanelYear] = useState<number>(current.getFullYear());
  const [panelMonth, setPanelMonth] = useState<number>(current.getMonth());

  // sync แผงเดือน/ปีกับ value เมื่อค่าภายนอกเปลี่ยน
  useEffect(() => {
    const d = parseISODate(value);
    setPanelYear(d.getFullYear());
    setPanelMonth(d.getMonth());
  }, [value]);

  // ป้ายภาษาไทยบนปุ่ม
  const thLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH-u-nu-latn", {
        day: "numeric",
        month: "long",
        year: "numeric",
        calendar: "gregory",
      }).format(current),
    [current]
  );

  const cells = useMemo(() => getMonthMatrix(panelYear, panelMonth), [panelYear, panelMonth]);
  const today = startOfDay(new Date());
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  // ปุ่มเดือนถัดไป: อนุญาตจนถึงเดือนปัจจุบันเท่านั้น (กันอนาคต)
  const canGoNextMonth = useMemo(
    () => panelYear < todayYear || (panelYear === todayYear && panelMonth < todayMonth),
    [panelYear, panelMonth, todayYear, todayMonth]
  );

  // ปุ่มปีในแผง month/year: จำกัดช่วง [minYear .. todayYear]
  const canGoPrevYear = useMemo(() => panelYear > minYear, [panelYear, minYear]);
  const canGoNextYear = useMemo(() => panelYear < todayYear, [panelYear, todayYear]);

  // ปิดด้วย Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMode("days");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const goPrevMonth = () => {
    const d = new Date(panelYear, panelMonth - 1, 1);
    setPanelYear(d.getFullYear());
    setPanelMonth(d.getMonth());
  };
  const goNextMonth = () => {
    if (!canGoNextMonth) return;
    const d = new Date(panelYear, panelMonth + 1, 1);
    setPanelYear(d.getFullYear());
    setPanelMonth(d.getMonth());
  };

  // ===== month/year view handlers =====
  const goPrevYear = () => {
    if (!canGoPrevYear) return;
    setPanelYear(panelYear - 1);
  };
  const goNextYear = () => {
    if (!canGoNextYear) return;
    const ny = panelYear + 1;
    setPanelYear(ny);
    // ถ้าข้ามขึ้นมาปีปัจจุบัน แล้วเดือนในแผงอยู่อนาคต → clamp ลงมา
    if (ny === todayYear && panelMonth > todayMonth) {
      setPanelMonth(todayMonth);
    }
  };
  const pickMonth = (m: number) => {
    // กันอนาคต: ถ้าอยู่ปีปัจจุบัน ให้เลือกได้ถึงเดือนปัจจุบันเท่านั้น
    if (panelYear > todayYear) return;
    if (panelYear === todayYear && m > todayMonth) return;
    setPanelMonth(m);
    setMode("days");
  };

  return (
    <div className="mt-2 relative">
      <label className="sr-only" htmlFor="date-btn">เลือกวันที่</label>

      {/* ปุ่มหลัก */}
      <button
        id="date-btn"
        type="button"
        onClick={() => setOpen(v => !v)}
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

        {/* สถานะเล็ก ๆ ด้านขวา */}
        {loading ? (
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" aria-label="กำลังโหลด" />
        ) : saving ? (
          <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" aria-label="กำลังบันทึก" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="พร้อม" />
        )}
      </button>

      {/* ป๊อปอัปปฏิทิน */}
      {open && (
        <>
          {/* คลิกพื้นหลังเพื่อปิด */}
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            aria-label="ปิดตัวเลือกวันที่"
            onClick={() => { setOpen(false); setMode("days"); }}
          />
          <div
            role="dialog"
            aria-label="เลือกวันที่"
            className="absolute z-30 mt-2 w-[320px] sm:w-[360px] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 left-1/2 -translate-x-1/2"
          >
            {/* Header */}
            {mode === "days" ? (
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
                  onClick={goPrevMonth}
                  aria-label="เดือนก่อนหน้า"
                >
                  ‹
                </button>

                {/* ปุ่มเดือน-ปี: คลิกเพื่อสลับไปแผงเลือกเดือน/ปี */}
                <button
                  type="button"
                  className="font-ibmthai font-medium hover:underline"
                  onClick={() => setMode("monthYear")}
                  aria-label="เลือกเดือนและปี"
                  title="เลือกเดือนและปี"
                >
                  {TH_MONTHS[panelMonth]} {panelYear}
                </button>

                <button
                  type="button"
                  className={`px-2 py-1 rounded-md ring-1 ${
                    canGoNextMonth ? "ring-slate-200 hover:bg-slate-50" : "ring-slate-100 text-slate-300 cursor-not-allowed"
                  }`}
                  onClick={goNextMonth}
                  aria-label="เดือนถัดไป"
                  disabled={!canGoNextMonth}
                >
                  ›
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  className={`px-2 py-1 rounded-md ring-1 ${
                    canGoPrevYear ? "ring-slate-200 hover:bg-slate-50" : "ring-slate-100 text-slate-300 cursor-not-allowed"
                  }`}
                  onClick={goPrevYear}
                  aria-label="ปีก่อนหน้า"
                  disabled={!canGoPrevYear}
                  title="ปีก่อนหน้า"
                >
                  «
                </button>
                <div className="font-ibmthai font-medium">{panelYear}</div>
                <button
                  type="button"
                  className={`px-2 py-1 rounded-md ring-1 ${
                    canGoNextYear ? "ring-slate-200 hover:bg-slate-50" : "ring-slate-100 text-slate-300 cursor-not-allowed"
                  }`}
                  onClick={goNextYear}
                  aria-label="ปีถัดไป"
                  disabled={!canGoNextYear}
                  title="ปีถัดไป"
                >
                  »
                </button>
              </div>
            )}

            {/* Body */}
            {mode === "days" ? (
              <>
                {/* หัวตารางวันในสัปดาห์ */}
                <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
                  {WEEKDAYS_TH.map(d => <div key={d} className="py-1">{d}</div>)}
                </div>

                {/* ตารางวันที่ */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map(({ date, inMonth }) => {
                    const d0 = startOfDay(date);
                    const isFuture = d0.getTime() > today.getTime(); // อนาคต
                    const isToday = isSameDay(d0, today);
                    const isSelected = isSameDay(d0, current);

                    const baseClass = "h-9 rounded-md text-sm flex items-center justify-center select-none";
                    const stateClass = isSelected
                      ? "bg-sky-600 text-white"
                      : isToday
                      ? "ring-1 ring-sky-400"
                      : inMonth
                      ? "hover:bg-slate-50 ring-1 ring-slate-200"
                      : "text-slate-400 hover:bg-slate-50 ring-1 ring-slate-100";
                    const disabledClass = isFuture ? "opacity-40 cursor-not-allowed hover:bg-transparent" : "";

                    return (
                      <button
                        type="button"
                        key={date.toISOString()}
                        onClick={() => {
                          if (isFuture) return;
                          onChange(toISODate(d0));
                          setOpen(false);
                          setMode("days");
                        }}
                        className={`${baseClass} ${stateClass} ${disabledClass}`}
                        aria-disabled={isFuture}
                        disabled={isFuture}
                        tabIndex={isFuture ? -1 : 0}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              // แผงเลือกเดือน (12 ช่อง)
              <div className="grid grid-cols-3 gap-2 pt-1">
                {TH_MONTHS.map((name, m) => {
                  const disabled =
                    panelYear > todayYear ||
                    (panelYear === todayYear && m > todayMonth);
                  const isCurrent = panelYear === current.getFullYear() && m === current.getMonth();

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => pickMonth(m)}
                      disabled={disabled}
                      className={[
                        "h-10 rounded-md ring-1",
                        disabled
                          ? "ring-slate-100 text-slate-300 cursor-not-allowed"
                          : "ring-slate-200 hover:bg-slate-50",
                        isCurrent ? "bg-sky-600 text-white ring-sky-600" : "",
                      ].join(" ")}
                      title={`${name} ${panelYear}`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* แอ็คชันล่าง */}
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <button
                type="button"
                className="hover:underline"
                onClick={() => {
                  const d = new Date();
                  setPanelYear(d.getFullYear());
                  setPanelMonth(d.getMonth());
                  onChange(toISODate(d));
                  setOpen(false);
                  setMode("days");
                }}
              >
                วันนี้
              </button>
              <div className="flex items-center gap-3">
                {mode === "monthYear" && (
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setMode("days")}
                  >
                    กลับไปวัน
                  </button>
                )}
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => { setOpen(false); setMode("days"); }}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
