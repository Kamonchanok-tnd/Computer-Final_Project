// src/pages/mirror/components/MirrorFrame.tsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  frameSrc?: string;
};

export default function MirrorFrame({
  value,
  onChange,
  placeholder = "นิยามสั้น ๆ สำหรับวันนี้",
  frameSrc = "/images/mirror-frame.svg",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);   // safe area (ตัดเป็นวงรี)
  const editorRef = useRef<HTMLDivElement>(null); // contentEditable
  const lastOkRef = useRef<string>("");           // เก็บค่าที่ “รับได้” ล่าสุด
  const [focused, setFocused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  // ปรับได้ตามดีไซน์
  const SAFE = { top: "19.5%", left: "15.5%", w: "69%", h: "56%" } as const;
  const ELLIPSE = "ellipse(50% 44% at 50% 48%)";
  const PAD_X = 0.08; // ซ้าย/ขวา 8%
  const PAD_Y = 0.08; // บน/ล่าง 8%

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  const applyCentering = useCallback((): void => {
    const box = wrapRef.current;
    const ed = editorRef.current;
    if (!box || !ed) return;

    const cs = getComputedStyle(ed);
    const fs = parseFloat(cs.fontSize) || 16;
    let lh = parseFloat(cs.lineHeight);
    if (Number.isNaN(lh)) lh = fs * 1.5;

    const baseTop = box.clientHeight * PAD_Y;
    const baseBot = box.clientHeight * PAD_Y;

    ed.style.paddingTop = `${baseTop}px`;
    ed.style.paddingBottom = `${baseBot}px`;

    const contentH = Math.max(lh + baseTop + baseBot, ed.scrollHeight);
    const boxH = box.clientHeight;

    if (contentH <= boxH) {
      const dyn = Math.max((boxH - contentH) / 2, 0);
      ed.style.paddingTop = `${baseTop + dyn}px`; // กึ่งกลางจริง
    } else {
      // เกินพื้นที่ก็ตรึงไว้ที่ขอบปลอดภัย (ขั้นตอนเด้งจะย้อนข้อความให้เอง)
      ed.style.paddingTop = `${baseTop}px`;
      ed.style.paddingBottom = `${baseBot}px`;
    }
  }, []);

  // sync external value -> editor + lastOk
  useEffect(() => {
    const e = editorRef.current;
    if (!e) return;
    if ((e.textContent ?? "") !== value) e.textContent = value || "";
    lastOkRef.current = value || "";
    requestAnimationFrame(() => applyCentering());
  }, [value, applyCentering]);

  useLayoutEffect(() => {
    applyCentering();
    const ro = new ResizeObserver(() => applyCentering());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [applyCentering]);

  // ตรวจว่าปัจจุบันเกินพื้นที่หรือไม่ (หลังเบราเซอร์ใส่ตัวอักษรแล้ว)
  const isOverflowNow = useCallback((): boolean => {
    const box = wrapRef.current;
    const ed = editorRef.current;
    if (!box || !ed) return false;

    const cs = getComputedStyle(ed);
    const fs = parseFloat(cs.fontSize) || 16;
    let lh = parseFloat(cs.lineHeight);
    if (Number.isNaN(lh)) lh = fs * 1.5;

    const baseTop = box.clientHeight * PAD_Y;
    const baseBot = box.clientHeight * PAD_Y;

    // ให้สถานะสไตล์อยู่ในโหมด “จัดกลาง” สำหรับการวัด
    const prevTop = ed.style.paddingTop;
    const prevBot = ed.style.paddingBottom;
    ed.style.paddingTop = `${baseTop}px`;
    ed.style.paddingBottom = `${baseBot}px`;

    const contentH = Math.max(lh + baseTop + baseBot, ed.scrollHeight);
    const overflow = contentH > box.clientHeight + 1;

    // คืนค่าที่ตั้งไว้
    ed.style.paddingTop = prevTop;
    ed.style.paddingBottom = prevBot;

    return overflow;
  }, []);

  // ใส่หลังเครื่องใส่ตัวอักษรแล้ว: ถ้าเกิน → ย้อนกลับ + toast
  const handleInput = useCallback(
    (ev: React.FormEvent<HTMLDivElement>): void => {
      const ed = editorRef.current;
      if (!ed) return;

      const current = (ev.currentTarget.textContent ?? "").replace(/\u00A0/g, " ");

      if (isOverflowNow()) {
        // ย้อนกลับข้อความล่าสุดที่รับได้
        ed.textContent = lastOkRef.current;

        // เอา caret ไปท้ายข้อความ
        const sel = document.getSelection();
        if (sel) sel.collapse(ed.firstChild ?? ed, (ed.textContent ?? "").length);

        showToast("ข้อความยาวเกินพื้นที่กระจก");
        applyCentering();
        return; // อย่า onChange
      }

      // รับได้ → เก็บเป็นค่าล่าสุด + แจ้ง parent
      lastOkRef.current = current;
      onChange(current);
      applyCentering();
    },
    [applyCentering, isOverflowNow, onChange, showToast]
  );

  return (
  <section className="mt-6 w-full"> 

      <div
  className={[
    "relative mx-auto",
    // ปรับจาก 'ความสูงจอ' → แปลงเป็น 'ความกว้างสูงสุด' ด้วยสัดส่วน 3/5 (= 0.6)
    "w-[min(88vw,calc((100dvh-240px)*0.6))]",
    "sm:w-[min(80vw,calc((100dvh-270px)*0.6))]",
    "md:w-[min(72vw,calc((100dvh-380px)*0.6))]", // ← iPad Air portrait อยู่ช่วงนี้
    "lg:w-[min(64vw,calc((100dvh-420px)*0.6))]",
    "xl:w-[min(56vw,calc((100dvh-460px)*0.6))]",
  ].join(" ")}
>


        {/* FRAME */}
        <div
          className="relative z-10 aspect-[3/5] bg-no-repeat bg-center bg-contain
                     [filter:drop-shadow(0_12px_28px_rgba(20,60,120,.28))_drop-shadow(0_2px_3px_rgba(0,0,0,.18))]
                     rounded-[24px]"
          style={{ backgroundImage: `url('${frameSrc}')` }}
        >
          {/* Toast */}
          {toast && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[12%] z-20 select-none
                            bg-rose-50 text-rose-700 text-xs sm:text-sm px-3 py-1 rounded-full shadow">
              {toast}
            </div>
          )}

          {/* SAFE AREA ในวงรี */}
          <div
            ref={wrapRef}
            className="absolute"
            style={{ top: SAFE.top, left: SAFE.left, width: SAFE.w, height: SAFE.h }}
          >
            <div
              className="relative h-full w-full overflow-hidden flex items-start justify-center overscroll-none"
              style={{ clipPath: ELLIPSE, WebkitClipPath: ELLIPSE }}
            >
              {/* Placeholder */}
              {value.length === 0 && !focused && (
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center text-center
                              text-slate-500/80 italic text-base sm:text-lg md:text-xl"
                  style={{
                    paddingLeft: `${PAD_X * 100}%`,
                    paddingRight: `${PAD_X * 100}%`,
                  }}
                >
                  {placeholder}
                </div>
              )}

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                role="textbox"
                spellCheck={false}
                onInput={handleInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                 className="relative z-10 w-full max-w-full outline-none bg-transparent text-center leading-relaxed
             text-base sm:text-lg md:text-xl whitespace-pre-wrap break-words [text-wrap:pretty] caret-sky-500
             font-ibmthai font-light"
                style={{
                  paddingLeft: `${PAD_X * 100}%`,
                  paddingRight: `${PAD_X * 100}%`,
                }}
              />
            </div>
          </div>

          {/* SHADOW ใต้กรอบ */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] bottom-[4%] h-5
                       bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.38),transparent_62%)]
                       blur-[6px] opacity-60 rounded-full"
          />
        </div>
      </div>
    </section>
  );
}
