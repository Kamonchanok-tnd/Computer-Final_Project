// path: src/pages/mirror/components/report/MonthPicker.tsx
import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";

type Props = {
  value: Date;                   // เดือน/ปีที่เลือกอยู่
  onChange: (d: Date) => void;   // ถูกเรียกเมื่อเลือกเดือนใหม่
  label?: string;                // override label ตรงปุ่ม
};

const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

export default function MonthPicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [panelYear, setPanelYear] = useState(value.getFullYear());

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // เก็บตำแหน่ง + สถานะวัดตำแหน่งเสร็จ
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: -99999, top: -99999 });
  const [ready, setReady] = useState(false);

  useEffect(() => setPanelYear(value.getFullYear()), [value]);

  // ปิดด้วย Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // ปิดเมื่อคลิกนอก
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // คำนวณตำแหน่งแบบ layout-safe (ไม่มีเฟรมที่ 0,0)
  const placePanel = () => {
    if (!btnRef.current || !panelRef.current) return;
    const btn = btnRef.current.getBoundingClientRect();
    const panel = panelRef.current;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 8;

    // ทำให้ panel มีขนาดจริง (visibility:hidden ไม่กระทบการวัด)
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;

    // 1) เริ่มจากกึ่งกลางใต้ปุ่ม
    let left = btn.left + (btn.width - pw) / 2;
    let top  = btn.bottom + gap;

    // 2) ถ้าล้นขวา → สแน็ปชิดขวาปุ่ม
    if (left + pw > vw - gap) left = btn.right - pw;

    // 3) ถ้าล้นซ้าย → สแน็ปชิดซ้ายปุ่ม
    if (left < gap) left = btn.left;

    // 4) กันขอบจอขั้นสุดท้าย
    if (left + pw > vw - gap) left = vw - pw - gap;
    if (left < gap) left = gap;

    // 5) ถ้าล่างชนขอบ → เด้งขึ้นบน
    if (top + ph > vh - gap) top = btn.top - ph - gap;
    if (top < gap) top = gap;

    setPos({ left, top });
    setReady(true);
  };

  // ใช้ layout effect เพื่อคำนวณก่อน paint (กันแฟลชไปมุมซ้ายบน)
  useLayoutEffect(() => {
    if (!open) return;
    setReady(false);
    // รอให้ panel mount ก่อน 1 เฟรม แล้ววัด (ใน layout effect ถัดไปยังทันก่อน paint)
    requestAnimationFrame(() => placePanel());
    const onWin = () => placePanel();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, { passive: true });
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin);
    };
  }, [open, panelYear, value]);

  const display = useMemo(() => {
    if (label && label.trim()) return label;
    return new Intl.DateTimeFormat("th-TH-u-nu-latn", {
      month: "long",
      year: "numeric",
      calendar: "gregory",
    }).format(value);
  }, [value, label]);

  return (
    <div className="relative w-full">
      <button
        ref={btnRef}
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
          {/* backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="ปิดตัวเลือกเดือน"
          />

          {/* popover: fixed + clamp; มองไม่เห็นจนกว่าคำนวณเสร็จ */}
          <div
            ref={panelRef}
            role="dialog"
            aria-label="เลือกเดือน"
            className={`fixed z-30 w-[280px] sm:w-[320px] max-w-[min(22rem,calc(100vw-16px))]
                        rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 ${ready ? "" : "invisible"}`}
            style={{ left: pos.left, top: pos.top }}
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
