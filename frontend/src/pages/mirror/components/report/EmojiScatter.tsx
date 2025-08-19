import { useMemo } from "react";

type Props = {
  count: number;
  src: string;
  seed?: string;
  className?: string;
  /** เพดานจำนวนคอลัมน์ต่อแถว (ค่าเริ่มต้น 6 ตามที่ต้องการ 5–6 ต่อแถว) */
  maxPerRow?: number;
};

export default function EmojiScatter({
  count,
  src,
  seed = "seed",
  className = "",
  maxPerRow = 6,
}: Props) {
  const cells = useMemo(() => {
    const n = Math.max(0, Math.floor(count || 0));
    if (n === 0) return [];

    // 1) หา cols ที่บาลานซ์ที่สุด ภายใต้เพดาน maxPerRow
    let bestCols = 1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let cols = 1; cols <= Math.min(maxPerRow, n); cols++) {
      const rows = Math.ceil(n / cols);
      const totalCells = rows * cols;
      const balance = Math.abs(rows - cols);   // ใกล้จัตุรัสยิ่งดี
      const waste = totalCells - n;            // ช่องว่างเหลือน้อยยิ่งดี
      const score = balance * 100 + waste;     // ให้ balance สำคัญกว่า waste

      if (score < bestScore) {
        bestScore = score;
        bestCols = cols;
      } else if (score === bestScore) {
        // ถ้าเท่ากัน เอนเอียงไปทาง 5 หรือ 6 คอลัมน์ก่อน
        const preferA = cols === 5 || cols === 6;
        const preferB = bestCols === 5 || bestCols === 6;
        if (preferA && !preferB) bestCols = cols;
      }
    }

    const cols = bestCols;
    const rows = Math.ceil(n / cols);

    // 2) สร้างกริดและจัดอันดับ cell ตามระยะจากกึ่งกลาง (ใกล้ก่อน)
    type P = { x: number; y: number; r: number; c: number; d2: number };
    const all: P[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) / cols;
        const y = (r + 0.5) / rows;
        const d2 = (x - 0.5) ** 2 + (y - 0.5) ** 2;
        all.push({ x, y, r, c, d2 });
      }
    }

    all.sort((a, b) => a.d2 - b.d2 || a.r - b.r || a.c - b.c);
    const chosen = all.slice(0, n);

    // เรียงเพื่อให้ render คงที่ (ไม่กระทบตำแหน่งที่เลือกแล้ว)
    chosen.sort((a, b) => a.y - b.y || a.x - b.x);

    return chosen.map((p) => ({
      left: `${p.x * 100}%`,
      top: `${p.y * 100}%`,
    }));
  }, [count, seed, maxPerRow]);

  if (cells.length === 0) {
    return <div className={`relative ${className}`} />;
  }

  return (
    <div className={`relative ${className}`}>
      {cells.map((pos, i) => (
        <img
          key={`emo-${i}`}
          src={src}
          alt=""
          draggable={false}
          className="absolute w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
          style={{
            left: pos.left,
            top: pos.top,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
