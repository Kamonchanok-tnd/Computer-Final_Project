// path: frontend/src/pages/mirror/components/OnboardingGuide.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  setMirrorOnboardingSeen,
  getMirrorOnboarding,
} from "../../../services/https/guilde/onboarding";

/** ถ้าระบบ auth ของโปรเจกต์คุณมี userId ที่อื่น ให้ปรับฟังก์ชันนี้ให้คืน userId ตามจริง */
function getUserId(): string | null {
  const anyW = window as unknown as { USER?: { id?: string } };
  if (anyW.USER?.id) return String(anyW.USER.id);
  const lsUID = localStorage.getItem("auth.uid");
  return lsUID || null;
}

type StepKey = "mirror-editor" | "mood-selector" | "overview-button";
const LS_KEY_BASE = "mirror.onboard.v1";
function makeLSKey(userId: string | null) {
  return userId ? `${LS_KEY_BASE}:${userId}` : `${LS_KEY_BASE}:anon`;
}

const STEPS: Array<{ key: StepKey; title: string; body: string }> = [
  {
    key: "mirror-editor",
    title: "บันทึกในกระจก",
    body: "วันนี้เป็นไงบ้าง... พิมพ์บันทึกสั้น ๆ ได้ที่นี่",
  },
  {
    key: "mood-selector",
    title: "เลือกอารมณ์",
    body: "แตะอิโมจิด้านล่างเพื่อเลือกอารมณ์สำหรับวันนี้",
  },
  {
    key: "overview-button",
    title: "ดูภาพรวม",
    body: "กดไอคอนกราฟมุมขวาบน เพื่อดูสรุปอารมณ์รายเดือน",
  },
];

/* ---------- helpers เลือก element เป้าหมาย ---------- */
function q<T extends Element>(sel: string): T | null {
  return document.querySelector<T>(sel);
}
function getOverviewButtons(): HTMLElement[] {
  const byId = Array.from(
    document.querySelectorAll<HTMLElement>("#overview-button-anchor")
  );
  const byAria = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button[aria-label="ดูสรุปอารมณ์รายเดือน"]'
    )
  );
  return Array.from(new Set<HTMLElement>([...byId, ...byAria]));
}
function isVisibleBox(el: Element | null): boolean {
  if (!el) return false;
  const r = (el as HTMLElement).getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const s = window.getComputedStyle(el as HTMLElement);
  return !(
    s.display === "none" ||
    s.visibility === "hidden" ||
    Number(s.opacity) === 0
  );
}
function pickVisibleOverviewButton(): HTMLElement | null {
  const cands = getOverviewButtons();
  return cands.find(isVisibleBox) ?? cands[0] ?? null;
}
function getOverviewIconWithin(btn: HTMLElement | null): SVGElement | null {
  if (!btn) return null;
  return (
    btn.querySelector<SVGElement>("#overview-icon") ||
    btn.querySelector<SVGElement>("svg") ||
    null
  );
}
function getOverviewTargetRect(): DOMRect | null {
  const btn = pickVisibleOverviewButton();
  if (!btn) return null;
  const icon = getOverviewIconWithin(btn);
  const r = (icon ?? btn).getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? r : null;
}
function getAnchorEl(step: StepKey): HTMLElement | null {
  return step === "overview-button"
    ? pickVisibleOverviewButton()
    : q<HTMLElement>(`[data-onboard="${step}"]`);
}
function validRect(r: DOMRect | null): r is DOMRect {
  return !!r && r.width > 0 && r.height > 0;
}
async function waitForAnchor(
  step: StepKey,
  timeout = 5000
): Promise<HTMLElement | null> {
  const deadline = performance.now() + timeout;
  return new Promise((resolve) => {
    const tick = () => {
      const el = getAnchorEl(step);
      if (el) {
        const r =
          step === "overview-button"
            ? getOverviewTargetRect()
            : el.getBoundingClientRect();
        if (validRect(r)) return resolve(el);
      }
      if (performance.now() > deadline) return resolve(null);
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/* ---------- hook: อ่านตำแหน่ง/ขนาดของ element เป้าหมาย ---------- */
function useTargetRect(step?: StepKey) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const elRef = useRef<HTMLElement | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    let ro: ResizeObserver | null = null;
    let raf = 0;
    const myGen = ++genRef.current;

    setRect(null);

    const update = () => {
      if (genRef.current !== myGen) return;
      if (!elRef.current) return;
      const r =
        step === "overview-button"
          ? getOverviewTargetRect()
          : elRef.current.getBoundingClientRect();
      setRect(validRect(r) ? r : null);
    };
    const loop = () => {
      update();
      raf = requestAnimationFrame(loop);
    };

    const attach = async () => {
      if (!step) return;
      const el = await waitForAnchor(step);
      if (genRef.current !== myGen) return;
      elRef.current = el;
      if (!el) {
        setRect(null);
        return;
      }

      if (step === "overview-button")
        el.scrollIntoView({ block: "nearest", inline: "nearest" });

      raf = requestAnimationFrame(loop);

      ro = new ResizeObserver(update);
      const observed =
        step === "overview-button" ? pickVisibleOverviewButton() ?? el : el;
      if (observed) ro.observe(observed);

      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
    };

    attach();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step]);

  return rect;
}

/* ---------- main component ---------- */
export default function OnboardingGuide() {
  const userId = getUserId();
  const LS_KEY = makeLSKey(userId);

  const forceStart = useMemo(
    () => new URLSearchParams(location.search).get("tour") === "1",
    []
  );
  // -2 = กำลังเช็คสิทธิ์, -1 = ไม่ต้องแสดง, >=0 = index ของสเต็ป
  const [idx, setIdx] = useState<number>(-2);

  // ตัดสินใจว่าจะเริ่มไกด์ไหม (server-first, localStorage fallback)
  useEffect(() => {
    let canceled = false;
    async function decide() {
      if (forceStart) {
        if (!canceled) setIdx(0);
        return;
      }

      try {
        const { seen } = await getMirrorOnboarding();
        if (!canceled) setIdx(seen ? -1 : 0);
      } catch {
        // fallback localStorage ถ้า API ล้ม
        const seenLS = localStorage.getItem(LS_KEY) === "1";
        if (!canceled) setIdx(seenLS ? -1 : 0);
      }
    }
    decide();
    return () => {
      canceled = true;
    };
  }, [LS_KEY, forceStart]);

  const step = idx >= 0 ? STEPS[idx] : undefined;
  const rect = useTargetRect(step?.key);

  const MOOD_PAD = {
    sidePad: 6,
    extraLeft: 8,
    extraRight: 12,
    extraTop: 24,
    extraBottom: 30,
  } as const;

  // tooltip
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    position: "fixed",
    zIndex: 60,
  });

  // ทำให้ placeTooltip มีเสถียรภาพและใส่ deps ถูกต้อง (แก้ ESLint)
  const placeTooltip = useCallback(() => {
    if (!rect || !tooltipRef.current || !step) return;

    const pad = 10;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const tw = tooltipRef.current.offsetWidth;
    const th = tooltipRef.current.offsetHeight;
    const clamp = (n: number, min: number, max: number) =>
      Math.min(Math.max(n, min), max);

    let left = 0;
    let top = 0;

    if (step.key === "mood-selector") {
      const moodLeft = Math.max(
        rect.left - 8 - MOOD_PAD.extraLeft,
        MOOD_PAD.sidePad
      );
      const moodRight = rect.right + 8 + MOOD_PAD.extraRight;
      const centerX = (moodLeft + moodRight) / 2;
      left = clamp(centerX - tw / 2, pad, w - pad - tw);
      top = clamp(
        rect.top - 8 - MOOD_PAD.extraTop - th - 12,
        pad,
        h - pad - th
      );
    } else if (step.key === "overview-button") {
      const small = window.matchMedia("(max-width: 640px)").matches;
      if (small) {
        left = clamp(rect.left + rect.width / 2 - tw / 2, pad, w - pad - tw);
        top = clamp(rect.bottom + 12, pad, h - pad - th);
      } else {
        let candLeft = rect.left - 12 - tw;
        if (candLeft < pad) candLeft = rect.right + 12;
        left = clamp(candLeft, pad, w - pad - tw);
        top = clamp(rect.top + rect.height / 2 - th / 2, pad, h - pad - th);
      }
    } else {
      let candTop = rect.top - 12 - th;
      if (candTop < pad) candTop = rect.bottom + 12;
      left = clamp(rect.left + rect.width / 2 - tw / 2, pad, w - pad - tw);
      top = clamp(candTop, pad, h - pad - th);
    }

    setTooltipStyle({ position: "fixed", left, top, zIndex: 60 });
  }, [MOOD_PAD.extraLeft, MOOD_PAD.extraRight, MOOD_PAD.extraTop, MOOD_PAD.sidePad, rect, step]);

  useLayoutEffect(() => {
    placeTooltip();
    const onResize = () => placeTooltip();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [placeTooltip]);

  // ปุ่มเริ่มไกด์ด้วยตัวเอง (เช่นพิมพ์ ?tour=1)
  useEffect(() => {
    (window as unknown as { __startMirrorGuide?: () => void }).__startMirrorGuide =
      () => {
        localStorage.removeItem(LS_KEY);
        setIdx(0);
      };
  }, [LS_KEY]);

  const finish = useCallback(async () => {
    localStorage.setItem(LS_KEY, "1");
    try {
      await setMirrorOnboardingSeen();
    } catch {
      /* เงียบไว้ ไม่บล็อก UI */
    }
    setIdx(-1);
  }, [LS_KEY]);

  const handleHotspotClick = useCallback(() => {
    pickVisibleOverviewButton()?.click();
  }, []);

  if (idx < 0 || !step || !rect) return null;

  const gap = 8;
  let spotLeft = rect.left - gap;
  let spotTop = rect.top - gap;
  let spotWidth = rect.width + gap * 2;
  let spotHeight = rect.height + gap * 2;

  if (step.key === "mood-selector") {
    const leftEdge = Math.max(
      rect.left - gap - MOOD_PAD.extraLeft,
      MOOD_PAD.sidePad
    );
    const rightEdge = rect.right + gap + MOOD_PAD.extraRight;
    spotLeft = leftEdge;
    spotTop = rect.top - gap - MOOD_PAD.extraTop;
    spotWidth = Math.max(spotWidth, rightEdge - leftEdge);
    spotHeight = Math.max(
      spotHeight,
      rect.height + gap * 2 + MOOD_PAD.extraTop + MOOD_PAD.extraBottom
    );
  }

  const spotlightStyle: React.CSSProperties = {
    position: "fixed",
    left: spotLeft,
    top: spotTop,
    width: spotWidth,
    height: spotHeight,
    borderRadius: "0.75rem",
  };

  return createPortal(
    <>
      <button
        aria-label="ปิดแนะนำการใช้งาน"
        onClick={finish}
        className="fixed inset-0 bg-black/40 z-[40]"
      />
      <div
        aria-hidden
        className="fixed z-[50] ring-2 ring-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.40)] pointer-events-none"
        style={spotlightStyle}
      />
      {step.key === "overview-button" && (
        <button
          aria-label="ไปยังภาพรวม"
          onClick={handleHotspotClick}
          className="fixed z-[55] bg-transparent"
          style={spotlightStyle}
        />
      )}

      <div
        ref={tooltipRef}
        role="dialog"
        aria-label={`แนะนำ: ${step.title}`}
        style={tooltipStyle}
        className="z-[60]"
      >
        <div className="max-w-[92vw] sm:max-w-sm bg-white rounded-xl shadow-lg ring-1 ring-slate-200 p-3 sm:p-4 text-slate-800">
          <div className="font-ibmthai">
            <div className="text-base sm:text-lg font-medium">{step.title}</div>
            <p className="text-sm sm:text-[15px] mt-1">{step.body}</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-slate-500 hover:text-slate-700 underline"
              onClick={finish}
            >
              ข้าม
            </button>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500">
                {idx + 1}/{STEPS.length}
              </div>
              <button
                type="button"
                className="h-9 px-3 rounded-lg bg-slate-900 text-white hover:brightness-110"
                onClick={() => (idx + 1 < STEPS.length ? setIdx(idx + 1) : finish())}
              >
                {idx + 1 < STEPS.length ? "ถัดไป" : "เสร็จสิ้น"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
