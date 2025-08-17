import { useEffect, useState } from "react";

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  label: string; // ป้ายภาษาไทยที่คำนวณจากหน้า
};

const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

export default function MonthPicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [panelYear, setPanelYear] = useState(value.getFullYear());
  useEffect(() => setPanelYear(value.getFullYear()), [value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mt-2 relative">
      <label className="sr-only" htmlFor="month-btn">เลือกเดือน</label>
      <button
        id="month-btn"
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
          {label}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="ปิดตัวเลือกเดือน"
          />
          <div
            role="dialog"
            aria-label="เลือกเดือน"
            className="absolute z-30 mt-2 w-[280px] sm:w-[320px] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center justify-between mb-2">
              <button type="button" className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setPanelYear(y => y - 1)} aria-label="ปีก่อนหน้า">«</button>
              <div className="font-ibmthai font-medium">{panelYear}</div>
              <button type="button" className="px-2 py-1 rounded-md ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setPanelYear(y => y + 1)} aria-label="ปีถัดไป">»</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TH_MONTHS.map((m, idx) => {
                const isActive = panelYear === value.getFullYear() && idx === value.getMonth();
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => { onChange(new Date(panelYear, idx, 1)); setOpen(false); }}
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
                  onChange(new Date(d.getFullYear(), d.getMonth(), 1));
                  setPanelYear(d.getFullYear());
                  setOpen(false);
                }}
              >
                เดือนนี้
              </button>
              <button type="button" className="hover:underline" onClick={() => setOpen(false)}>
                ปิด
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
