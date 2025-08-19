import { type CSSProperties, useMemo } from "react";

type Props = {
  src: string;     // ไฟล์อิโมจิ (png/svg)
  count: number;   // จำนวนที่จะวาง
  seed?: number;   // ให้ตำแหน่งคงที่ต่ออารมณ์
  max?: number;    // จำกัดจำนวนเพื่อไม่ให้รกเกินไป
};

/* PRNG แบบ deterministic */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* กระจายตำแหน่งแบบ sunflower (golden-angle) + jitter */
function makePositions(n: number, seed = 1) {
  const rand = mulberry32(seed | 0);
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
  const pts: Array<{ x: number; y: number; rot: number; scl: number }> = [];

  // หมุนทั้งก้อน + บีบแกน Y เล็กน้อย → ไม่กลมเป๊ะเหมือนสติ๊กเกอร์จริง
  const globalRot = (rand() - 0.5) * 0.35; // -0.175..0.175 rad
  const squashY   = 0.92 + rand() * 0.08;  // 0.92..1.00

  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const r = Math.sqrt(t);                         // 0..1
    const ang = i * phi + (rand() - 0.5) * 0.5;    // jitter มุม

    // พิกัดฐาน
    const cx = r * Math.cos(ang);
    const cy = r * Math.sin(ang);

    // หมุนทั้งก้อน + บีบแกน Y
    const ex = cx * Math.cos(globalRot) - cy * Math.sin(globalRot);
    const ey = (cx * Math.sin(globalRot) + cy * Math.cos(globalRot)) * squashY;

    // ขยับจิ๋ว ๆ เพื่อความเป็นธรรมชาติ
    const x = ex * 0.92 + (rand() - 0.5) * 0.06;
    const y = ey * 0.92 + (rand() - 0.5) * 0.06;

    // หมุน/สเกลแต่ละสติ๊กเกอร์
    const rot = (rand() - 0.5) * 20;
    const scl = 0.94 + rand() * 0.14;

    pts.push({ x, y, rot, scl });
  }
  return pts;
}

export default function StickerBoard({ src, count, seed = 1, max = 120 }: Props) {
  const show = Math.min(max, count);
  const pts = useMemo(() => makePositions(show, seed), [show, seed]);

  return (
    <div
      className="
        relative mx-auto
        w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64
        rounded-full bg-white/40 ring-1 ring-slate-200/60
      "
      aria-label="sticker-board"
    >
      {pts.map((p, i) => {
        // วางจากจุดศูนย์กลางวงกลม ใช้ % เพื่อ responsive และกันชนขอบด้วย 46%
        const left = 50 + p.x * 46;
        const top  = 50 + p.y * 46;
        const style: CSSProperties = {
          left: `${left}%`,
          top: `${top}%`,
          transform: `translate(-50%,-50%) rotate(${p.rot}deg) scale(${p.scl})`,
        };
        return (
          <img
            key={`st-${seed}-${i}`}
            src={src}
            alt=""
            draggable={false}
            className="absolute select-none w-6 h-6 sm:w-7 sm:h-7 object-contain"
            style={style}
          />
        );
      })}

      {count > show && (
        <span className="absolute right-2 bottom-2 text-xs sm:text-sm text-slate-600 bg-white/80 rounded-md px-2 py-0.5 ring-1 ring-slate-200">
          +{count - show} ครั้ง
        </span>
      )}
    </div>
  );
}
