import { type CSSProperties } from "react";

type Props = {
  src: string;
  count: number;
  seed?: number;   // ทำให้ตำแหน่ง “คงที่” ต่ออารมณ์
  max?: number;    // จำกัดจำนวนที่แสดง เพื่อไม่ให้ยาวเกิน
};

function seeded(i: number, seed: number) {
  // ค่าคงที่แบบ deterministic
  return (Math.sin(i * 127.1 + seed * 311.7) + 1) * 0.5; // 0..1
}

function jitterStyle(i: number, seed: number): CSSProperties {
  const r1 = seeded(i, seed);
  const r2 = seeded(i + 1, seed);
  const r3 = seeded(i + 2, seed);
  const rotate = (r1 * 12) - 6;               // -6..+6 deg
  const translateY = Math.round((r2 * 8) - 4); // -4..+4 px
  const scale = 0.94 + r3 * 0.14;             // 0.94..1.08
  return { transform: `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})` };
}

export default function EmojiCloud({ src, count, seed = 1, max = 80 }: Props) {
  const show = Math.min(max, count);
  const more = Math.max(0, count - show);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-2.5 sm:gap-y-2.5">
      {Array.from({ length: show }).map((_, i) => (
        <img
          key={`emo-${seed}-${i}`}
          src={src}
          alt=""
          className="h-6 w-6 sm:h-7 sm:w-7 object-contain select-none"
          draggable={false}
          style={jitterStyle(i, seed)}
        />
      ))}
      {more > 0 && (
        <span className="ml-1 text-xs sm:text-sm text-slate-500">+{more} ครั้ง</span>
      )}
    </div>
  );
}
