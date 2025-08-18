import React from "react";

/** ใช้สำหรับกำหนด CSS custom property โดยไม่ต้อง any */
type CSSVarStyle = React.CSSProperties & { ["--amp"]: string };

export default function SideOrnaments() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 hidden md:block z-[1] pointer-events-none select-none"
    >
      {/* Glows */}
      <Glow className="absolute -top-8 -left-[6vw] w-[42vw] max-w-[560px] aspect-square blur-3xl opacity-55" />
      <Glow className="absolute -top-12 -right-[8vw] w-[46vw] max-w-[640px] aspect-square blur-3xl opacity-55" />
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[-10vh] w-[95vw] h-[40vh] blur-2xl opacity-40"
        style={{
          background:
            "radial-gradient(60% 130% at 50% 100%, rgba(147,197,253,.42) 0%, rgba(147,197,253,0) 60%)",
        }}
      />

      {/* โค้งเม็ดความทรงจำซ้าย/ขวา */}
      <BeadsArc side="left" />
      <BeadsArc side="right" />

      {/* ฟองลอยจากล่างขึ้นบน (แยกตัว) ซ้าย/ขวา */}
      <RisingBubbles side="left" />
      <RisingBubbles side="right" />

      {/* บับเบิ้ลฉากหลัง + หมอกล่าง */}
      <BubbleField layer="far" />
      <BubbleField layer="mid" />
      <BubbleField layer="near" />
      <FogBeltBottom />
    </div>
  );
}

/* ----------------- Subcomponents ----------------- */

function Glow({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background:
          "radial-gradient(60% 60% at 50% 50%, rgba(147,197,253,0.70) 0%, rgba(147,197,253,0.28) 40%, rgba(147,197,253,0) 72%)",
      }}
    />
  );
}

function BeadsArc({ side }: { side: "left" | "right" }) {
  const base: Array<{ x: number; y: number; s: number; o: number; d: string }> = [
    { x: 6, y: 10, s: 6, o: 0.35, d: ".0s" },
    { x: 20, y: 14, s: 8, o: 0.40, d: ".2s" },
    { x: 36, y: 18, s: 10, o: 0.45, d: ".4s" },
    { x: 52, y: 22, s: 12, o: 0.50, d: ".6s" },
    { x: 68, y: 26, s: 10, o: 0.45, d: ".8s" },
    { x: 78, y: 31, s: 8, o: 0.40, d: "1.0s" },
    { x: 84, y: 38, s: 7, o: 0.36, d: "1.2s" },
    { x: 88, y: 46, s: 6, o: 0.32, d: "1.4s" },
    { x: 86, y: 56, s: 7, o: 0.34, d: "1.6s" },
    { x: 78, y: 66, s: 8, o: 0.38, d: "1.8s" },
    { x: 64, y: 74, s: 10, o: 0.44, d: "2.0s" },
    { x: 48, y: 82, s: 12, o: 0.50, d: "2.2s" },
    { x: 30, y: 88, s: 10, o: 0.46, d: "2.4s" },
  ];

  const container =
    side === "right"
      ? "absolute right-0 top-[108px] bottom-[150px] w-[360px] xl:w-[420px]"
      : "absolute left-0  top-[108px] bottom-[150px] w-[360px] xl:w-[420px]";

  const halo =
    side === "right"
      ? "absolute right-[-60px] top-[-40px] w-[420px] h-[420px] rounded-full blur-3xl opacity-50"
      : "absolute left-[-60px]  top-[-40px] w-[420px] h-[420px] rounded-full blur-3xl opacity-50";

  return (
    <div className={container}>
      <div
        className={halo}
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(147,197,253,0.70) 0%, rgba(147,197,253,0.22) 45%, rgba(147,197,253,0) 75%)",
        }}
      />
      {base.map((b, i) => {
        const x = side === "right" ? b.x : 100 - b.x; // mirror แนวนอน
        return (
          <span
            key={`${side}-rb-${i}`}
            className="absolute rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.55)] animate-[twinkle_3s_ease-in-out_infinite]"
            style={{
              left: `${x}%`,
              top: `${b.y}%`,
              width: `${b.s}px`,
              height: `${b.s}px`,
              opacity: b.o,
              animationDelay: b.d,
            }}
          />
        );
      })}
    </div>
  );
}

/** ฟองลอยจากล่างขึ้นบน (กระจาย ไม่ติดกัน) */
function RisingBubbles({ side }: { side: "left" | "right" }) {
  const X_MIN = side === "left" ? 4 : 82;
  const X_MAX = side === "left" ? 20 : 96;
  const COUNT = 7;
  const RANGE = X_MAX - X_MIN;
  const GAP = RANGE / COUNT;
  const JITTER = GAP * 0.22;

  const dRand = (seed: number, a = 1103515245, c = 12345, m = 2 ** 31) =>
    ((((seed * a + c) % m) / m) * 2 - 1); // [-1,1]

  const items = Array.from({ length: COUNT }, (_, i) => {
    const center = X_MIN + GAP * (i + 0.5);
    const jitter = dRand(i + (side === "left" ? 7 : 13)) * JITTER;
    const x = center + jitter;

    const size = Math.round(28 + (i % 5) * 6 + Math.abs(dRand(i + 21)) * 6);
    const dur = (12 + Math.abs(dRand(i + 31)) * 4).toFixed(1); // 12–16s
    const swayDur = (4.5 + Math.abs(dRand(i + 41)) * 2).toFixed(1); // 4.5–6.5s
    const amp = `${Math.round(10 + Math.abs(dRand(i + 51)) * 7)}px`; // 10–17px
    const delay = (-parseFloat(dur) * (i / COUNT)).toFixed(2); // เหลื่อมเวลา

    return { x, size, dur, swayDur, amp, delay };
  });

  return (
    <div className="absolute inset-0">
      {items.map((b, i) => {
        const parentStyle: CSSVarStyle = {
          left: `${b.x}%`,
          bottom: "-8vh",
          animation: `sway ${b.swayDur}s ease-in-out infinite`,
          animationDelay: `${b.delay}s`,
          ["--amp"]: b.amp,
        };
        const bubbleStyle: React.CSSProperties = {
          width: `${b.size}px`,
          height: `${b.size}px`,
          animation: `rise ${b.dur}s linear infinite`,
          animationDelay: `${b.delay}s`,
          opacity: 0.35,
          background:
            "radial-gradient(65% 65% at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.15) 65%, rgba(255,255,255,0) 80%)," +
            "radial-gradient(100% 100% at 38% 32%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 55%)",
          boxShadow:
            "inset 0 0 14px rgba(255,255,255,0.35), 0 10px 26px rgba(147,197,253,0.20)",
        };
        return (
          <span key={`${side}-rise-${i}`} className="absolute" style={parentStyle}>
            <span className="block rounded-full" style={bubbleStyle} />
          </span>
        );
      })}
    </div>
  );
}

function BubbleField({ layer }: { layer: "far" | "mid" | "near" }) {
  const cfg =
    layer === "far"
      ? { blur: "blur-sm", z: "z-[1]", size: [26, 38] as const, count: 12, opacity: 0.18, dur: 10 }
      : layer === "mid"
      ? { blur: "blur-[1px]", z: "z-[2]", size: [32, 48] as const, count: 10, opacity: 0.22, dur: 9 }
      : { blur: "", z: "z-[3]", size: [40, 62] as const, count: 8, opacity: 0.26, dur: 8 };

  const rand = (i: number, min: number, max: number) =>
    min + (((i * 9301 + 49297) % 233280) / 233280) * (max - min);

  const items = new Array(cfg.count).fill(0).map((_, i) => {
    const x = i % 2 === 0 ? rand(i, 4, 22) : rand(i, 78, 96);
    const y = rand(i + 7, 12, 86);
    const s = Math.round(rand(i + 13, cfg.size[0], cfg.size[1]));
    const d = (rand(i + 19, 0, 1.6)).toFixed(2) + "s";
    return { x: `${x}%`, y: `${y}%`, s, d };
  });

  return (
    <>
      {items.map((b, i) => (
        <span
          key={`${layer}-${i}`}
          className={`absolute ${cfg.z} ${cfg.blur} rounded-full animate-[float_${cfg.dur}s_ease-in-out_infinite]`}
          style={{
            left: b.x,
            top: b.y,
            width: `${b.s}px`,
            height: `${b.s}px`,
            opacity: cfg.opacity,
            animationDelay: b.d,
            background:
              "radial-gradient(75% 75% at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.06) 62%, rgba(255,255,255,0) 75%)," +
              "radial-gradient(100% 100% at 35% 32%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.35), 0 6px 22px rgba(147,197,253,0.22)",
          }}
        />
      ))}
    </>
  );
}

function FogBeltBottom() {
  return (
    <div className="absolute inset-x-0 bottom-[-2vh] h-[26vh]">
      <div
        className="absolute inset-x-[10%] bottom-0 h-[24vh] blur-2xl opacity-55"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 100%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 38%, rgba(255,255,255,0.15) 62%, rgba(255,255,255,0) 80%)",
        }}
      />
      <div
        className="absolute left-[-6%] bottom-[2vh] w-[38vw] h-[18vh] blur-2xl opacity-45"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 100%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 80%)",
        }}
      />
      <div
        className="absolute right-[-6%] bottom-[2vh] w-[38vw] h-[18vh] blur-2xl opacity-45"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 100%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 80%)",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[7vh] w-[60vw] h-[14vh] blur-xl opacity-35"
        style={{
          background:
            "radial-gradient(70% 80% at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 80%)",
        }}
      />
    </div>
  );
}
