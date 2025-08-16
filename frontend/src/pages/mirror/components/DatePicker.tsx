import { useEffect, useMemo, useState } from "react";

type Props = {
  value: string;               // YYYY-MM-DD
  onChange: (v: string) => void;
  loading?: boolean;
  saving?: boolean;
};

/* ===== Helpers ===== */
const WEEKDAYS_TH: string[] = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const TH_MONTHS: string[] = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
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

export default function DatePicker({ value, onChange, loading, saving }: Props) {
  const current = parseISODate(value);
  const [open, setOpen] = useState(false);
  const [panelYear, setPanelYear] = useState<number>(current.getFullYear());
  const [panelMonth, setPanelMonth] = useState<number>(current.getMonth());

  // ปรับปีในแผงให้ตามค่า value ปัจจุบัน
  useEffect(() => {
    setPanelYear(current.getFullYear());
    setPanelMonth(current.getMonth());
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ปิดด้วย Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
    const d = new Date(panelYear, panelMonth + 1, 1);
    setPanelYear(d.getFullYear());
    setPanelMonth(d.getMonth());
  };

  return (
    <div className="mt-2 relative">
      <label className="sr-only" htmlFor="date-btn">เลือกวันที่</label>

      {/* ปุ่มหลัก (หน้าตาเหมือน input เดิม) */}
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
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="เลือกวันที่"
            className="absolute z-30 mt-2 w-[320px] sm:w-[360px] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 left-1/2 -translate-x-1/2"
          >
            {/* ส่วนหัว: เดือน-ปี + ปุ่มเลื่อนเดือน */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
                onClick={goPrevMonth}
                aria-label="เดือนก่อนหน้า"
              >
                ‹
              </button>
              <div className="font-ibmthai font-medium">
                {TH_MONTHS[panelMonth]} {panelYear}
              </div>
              <button
                type="button"
                className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
                onClick={goNextMonth}
                aria-label="เดือนถัดไป"
              >
                ›
              </button>
            </div>

            {/* หัวตารางวันในสัปดาห์ */}
            <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
              {WEEKDAYS_TH.map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* ตารางวันที่ */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map(({ date, inMonth }) => {
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, current);

                const baseClass =
                  "h-9 rounded-md text-sm flex items-center justify-center select-none";
                const stateClass = isSelected
                  ? "bg-sky-600 text-white"
                  : isToday
                  ? "ring-1 ring-sky-400"
                  : inMonth
                  ? "hover:bg-slate-50 ring-1 ring-slate-200"
                  : "text-slate-400 hover:bg-slate-50 ring-1 ring-slate-100";

                return (
                  <button
                    type="button"
                    key={date.toISOString()}
                    onClick={() => {
                      onChange(toISODate(date));
                      setOpen(false);
                    }}
                    className={`${baseClass} ${stateClass}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

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
                }}
              >
                วันนี้
              </button>
              <button
                type="button"
                className="hover:underline"
                onClick={() => setOpen(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
