import { useMemo } from "react";

type Props = {
  count: number;
  src: string;
  className?: string;
  /** รัศมีสูงสุดของฝูง (สัดส่วนของกล่อง 0–0.5) */
  maxRadius?: number;
};

export default function EmojiScatter({
  count,
  src,
  className = "",
  maxRadius = 0.45,
}: Props) {
  // PRNG deterministic (ไว้สำหรับ jitter ให้ดูธรรมชาติ)
  function mulberry32(seed: number) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20250819);

  const positions = useMemo(() => {
    const n = Math.max(0, Math.floor(count || 0));
    if (n === 0) return [] as { x: number; y: number }[];

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    const R = maxRadius * 0.98;

    // ↓↓↓ สำคัญ: ทำให้ “จำนวนน้อย” เกาะกลางมากขึ้น
    // shrink: n เล็ก → บีบรัศมีรวมเข้าศูนย์กลาง (เช่น n<=3 ~ 0.55R)
    const shrink = n <= 1 ? 0 : 0.55 + Math.min(1, (n - 3) / 15) * 0.45;
    // สเกลรัศมีพื้นฐาน
    const c = (R * shrink) / (Math.sqrt(n) + 0.5);

    // ระยะกันชนขั้นต่ำ (หน่วยเป็นสัดส่วนกล่อง) — จำกัดช่วงไม่ให้ใหญ่เกินสำหรับ n น้อย
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const minDist = clamp(c * 1.2, 0.06, 0.095);
    const minDist2 = minDist * minDist;

    // ดึงเข้าศูนย์กลาง (soft pull) มากเมื่อน้อย น้อยเมื่อเยอะ
    const pullCenter = 0.12 * (1 - Math.min(n / 12, 1)); // n<12 จะดึงมากกว่า

    // 1) sunflower layout + jitter เล็กน้อย
    const pts: { x: number; y: number }[] = [];
    for (let k = 0; k < n; k++) {
      const theta = k * phi;
      const baseR = c * Math.sqrt(k + 0.8);
      const jitter = (rand() - 0.5) * 0.08 * c; // เล็กพอให้ดูธรรมชาติ
      const r = Math.min(R, baseR + jitter);

      // จุดเริ่ม
      let x = 0.5 + r * Math.cos(theta);
      let y = 0.5 + r * Math.sin(theta);

      // ดึงเข้าศูนย์กลางตามสัดส่วน (ช่วยให้ n น้อยไม่เวิ้ง)
      const dx0 = x - 0.5, dy0 = y - 0.5;
      x -= dx0 * pullCenter;
      y -= dy0 * pullCenter;

      pts.push({ x, y });
    }

    // 2) repulsion เบา ๆ เพื่อไม่ให้ชนกันจริง ๆ
    const ITER = Math.min(6, 2 + Math.floor(n / 10));
    for (let it = 0; it < ITER; it++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pts[j].x - pts[i].x;
          const dy = pts[j].y - pts[i].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < minDist2 && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const push = (minDist - d) * 0.5;
            const ux = dx / d, uy = dy / d;
            pts[i].x -= ux * push; pts[i].y -= uy * push;
            pts[j].x += ux * push; pts[j].y += uy * push;
          }
        }
        // clamp กลับเข้าในวงกลม R
        const cx = pts[i].x - 0.5, cy = pts[i].y - 0.5;
        const rr = Math.hypot(cx, cy);
        if (rr > R) {
          pts[i].x = 0.5 + (cx / rr) * R;
          pts[i].y = 0.5 + (cy / rr) * R;
        }
      }
    }

    return pts;
  }, [count, maxRadius, rand]);

  if (count <= 0) return <div className={`relative ${className}`} />;

  return (
    <div className={`relative ${className}`}>
      {positions.map((p, i) => (
        <img
          key={`emo-${i}`}
          src={src}
          alt=""
          draggable={false}
          className="absolute w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
          style={{
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      ))}
    </div>
  );
}
