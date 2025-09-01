import { useEffect, useMemo, useState } from "react";

type Props = {
  value: Date;                          // เดือน/ปีที่เลือกอยู่
  onChange: (d: Date) => void;          // ถูกเรียกเมื่อเลือกเดือนใหม่
  label?: string;                       // ถ้าอยาก override label กลางปุ่ม
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

  const display = useMemo(() => {
    if (label && label.trim()) return label;
    return new Intl.DateTimeFormat("th-TH-u-nu-latn", {
      month: "long",
      year: "numeric",
      calendar: "gregory",
    }).format(value);
  }, [value, label]);

  return (
    // ★ ให้คอมโพเนนต์ดูแล layout เอง: เต็มแถว และเป็น anchor ของป๊อปอัป
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-11 px-3 rounded-xl bg-white/95 ring-1 ring-slate-200 shadow-sm
                   flex items-center gap-2"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span aria-hidden className="grid place-items-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v2m8-2v2M4 7h16M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
          </svg>
        </span>
        <span className="min-w-0 w-full text-base sm:text-lg leading-none px-1 py-0.5 text-center font-ibmthai font-light">
          {display}
        </span>
      </button>

      {open && (
        <>
          {/* backdrop ปิดเมื่อคลิกนอก */}
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="ปิดตัวเลือกเดือน"
          />
          {/* ป๊อปอัป: ยึดกับคอมโพเนนต์ (ตำแหน่งแม่น ไม่ดันเลย์เอาต์) */}
          <div
            role="dialog"
            aria-label="เลือกเดือน"
            className="absolute z-30 top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2
                       w-[280px] sm:w-[320px] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3"
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
                const isActive = panelYear === value.getFullYear() && idx === value.getMonth();
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { onChange(new Date(panelYear, idx, 1)); setOpen(false); }}
                    className={[
                      "h-9 rounded-md text-sm ring-1 ring-slate-200 hover:bg-slate-50",
                      isActive ? "bg-sky-600 text-white ring-sky-600 hover:bg-sky-600" : "bg-white",
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
                  onChange(new Date(d.getFullYear(), d.getMonth(), 1));
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
