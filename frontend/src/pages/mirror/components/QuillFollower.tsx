import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  editorRef: React.RefObject<HTMLDivElement>;
  boundsRef: React.RefObject<HTMLDivElement>;
  /** ชื่อไฟล์ขนนกใน public/images (เว้นไว้จะใช้ quill-feather-128.png) */
  src?: string;
  /** ขนาดเรนเดอร์ (px) */
  size?: number;
  /** ถ้าอยากคุมออฟเซ็ตเอง */
  offsetX?: number;
  offsetY?: number;
};

type CaretPos = { x: number; y: number; h: number; visible: boolean };

function nodeInside(root: Node, n: Node | null): boolean {
  return !!n && (n === root || root.contains(n));
}

function getCaretPosRelative(
  editorEl: HTMLDivElement,
  boundsEl: HTMLDivElement
): CaretPos {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0 || !nodeInside(editorEl, sel.anchorNode)) {
    return { x: 0, y: 0, h: 18, visible: false };
    }
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(false);

  // ถ้าท้ายบรรทัด rect ว่าง → วัดด้วย probe
  let rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    const probe = document.createElement("span");
    probe.textContent = "\u200b";
    range.insertNode(probe);
    rect = probe.getBoundingClientRect();
    probe.remove();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  const b = boundsEl.getBoundingClientRect();
  return {
    x: Math.round(rect.left - b.left),
    y: Math.round(rect.top - b.top),
    h: Math.max(12, Math.round(rect.height || 18)),
    visible: true,
  };
}

export default function QuillFollower({
  editorRef,
  boundsRef,
  src,
  size = 44,
  offsetX,
  offsetY,
}: Props) {
  // ใช้ BASE_URL ของ Vite เพื่อกัน path เพี้ยนเวลา deploy ใต้ subpath
  const assetUrl =
    (src
      ? `${import.meta.env.BASE_URL}images/${src.replace(/^\/?images\//, "")}`
      : `${import.meta.env.BASE_URL}images/quill-feather-128.png}`);

  const outerRef = useRef<HTMLDivElement>(null); // translate/rotate (JS physics)
  const [pos, setPos] = useState<CaretPos>({ x: 0, y: 0, h: 18, visible: false });
  const [typing, setTyping] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  // อัปเดตเป้าหมายจาก caret
  const updateTarget = useMemo(
    () => () => {
      const ed = editorRef.current;
      const bd = boundsRef.current;
      if (!ed || !bd) return;
      setPos(getCaretPosRelative(ed, bd));
    },
    [editorRef, boundsRef]
  );

  // ฟัง input/selection/resize
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const onInput = () => {
      setTyping(true);
      updateTarget();
      window.setTimeout(() => setTyping(false), 420);
    };
    const onSel = () => updateTarget();
    const onResize = () => updateTarget();

    ed.addEventListener("input", onInput);
    document.addEventListener("selectionchange", onSel);
    window.addEventListener("resize", onResize);
    updateTarget();

    return () => {
      ed.removeEventListener("input", onInput);
      document.removeEventListener("selectionchange", onSel);
      window.removeEventListener("resize", onResize);
    };
  }, [updateTarget]);

  // ฟิสิกส์สปริง + เอียงตามความเร็ว (ทำใน rAF → ไม่ re-render)
  useEffect(() => {
    if (!pos.visible) return;
    let raf = 0;
    let last = performance.now();

    const current = { x: pos.x, y: pos.y };
    const vel = { x: 0, y: 0 };

    const K = 32;     // stiffness
    const D = 12;     // damping
    const TILT = 0.22;
    const MAX_TILT = 14;

    const step = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.033);
      last = t;

      // ออฟเซ็ตปลายปากกา: ถ้าไม่ระบุ ใช้สัดส่วนตามความสูง caret
      const ox = offsetX ?? pos.h * 0.6;
      const oy = offsetY ?? pos.h * 0.45;

      const tx = pos.x + ox;
      const ty = pos.y + oy;

      const ax = (tx - current.x) * K - vel.x * D;
      const ay = (ty - current.y) * K - vel.y * D;

      vel.x += ax * dt;
      vel.y += ay * dt;

      current.x += vel.x * dt;
      current.y += vel.y * dt;

      let rot = -(vel.x * TILT);
      if (rot > MAX_TILT) rot = MAX_TILT;
      if (rot < -MAX_TILT) rot = -MAX_TILT;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${rot - 18}deg)`;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pos, offsetX, offsetY]);

  if (!pos.visible || !imgOk) return null;

  return (
    <div className="pointer-events-none absolute z-20" style={{ left: 0, top: 0 }} aria-hidden>
      <div
        ref={outerRef}
        className={typing ? "animate-feather-write will-change-transform" : "animate-feather-flutter will-change-transform"}
        style={{ transformOrigin: "70% 30%" }}
      >
        <img
          src={assetUrl}
          alt=""
          width={size}
          height={size}
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,.25)] select-none"
          draggable={false}
          onError={() => setImgOk(false)}
        />
      </div>
    </div>
  );
}
