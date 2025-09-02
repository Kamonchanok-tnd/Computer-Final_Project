import React, { useEffect, useState } from "react";

type Props = {
  scope?: "page" | "modal";               // เต็มหน้า หรือใน modal
  forceTheme?: "light" | "dark";          // บังคับธีม (ถ้าไม่ใส่ จะยึดตาม <html class="dark">)
  nightStyle?: "milkyway" | "constellation";
  milkyWaySrc?: string;                   // รูปช้างเผือก (ถ้ามี)
  dayCloudsSrc?: string;                  // รูปเมฆกลางวัน (ถ้ามี)
};

export default function AmbientBackground({
  scope = "page",
  forceTheme,
  nightStyle = "milkyway",
  milkyWaySrc,
  dayCloudsSrc = "/ambient/day-clouds.jpg",
}: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (forceTheme) {
      setIsDark(forceTheme === "dark");
      return;
    }
    const root = document.documentElement;
    const checkDark = () =>
      setIsDark(
        root.classList.contains("dark") ||
          window.matchMedia?.("(prefers-color-scheme: dark)").matches
      );
    checkDark();
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", checkDark);
    const obs = new MutationObserver(checkDark);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mq?.removeEventListener?.("change", checkDark);
      obs.disconnect();
    };
  }, [forceTheme]);

  const density = scope === "page" ? 1 : 0.65;
  const attach = scope === "page" ? "fixed" : "absolute"; // page → fixed (ผูกกับ viewport), modal → absolute

  return (
    <div
      aria-hidden
      className={`pointer-events-none ${attach} inset-0 z-0 overflow-hidden`}
    >
      {isDark ? (
        <NightAmbient density={density} style={nightStyle} milkyWaySrc={milkyWaySrc} />
      ) : (
        <DayAmbient density={density} cloudsSrc={dayCloudsSrc} />
      )}
      <style>{keyframes}</style>
    </div>
  );
}

/* ---------------- Heart path ---------------- */
function Heart({
  cx,
  cy,
  size = 1,
  fill = "white",
  opacity = 1,
  style,
}: {
  cx: number;
  cy: number;
  size?: number;
  fill?: string;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  const d = "M 0 -0.35 C -0.55 -0.9 -1.35 -0.1 0 0.95 C 1.35 -0.1 0.55 -0.9 0 -0.35 Z";
  return (
    <path
      d={d}
      fill={fill}
      opacity={opacity}
      transform={`translate(${cx} ${cy}) scale(${size})`}
      style={style}
    />
  );
}

/* ---------------- DAY ---------------- */

function DayAmbient({
  density = 1,
  cloudsSrc,
}: {
  density?: number;
  cloudsSrc?: string;
}) {
  const hazeOpacity = 0.55 * density;

  return (
    <div className="w-full h-full relative">
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #5aa8ff 0%, #77b9ff 18%, #a9d2ff 45%, #d7ecff 75%, #eef7ff 100%)",
        }}
      />

      {/* Haze */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 70%, rgba(255,255,255,0.7), rgba(255,255,255,0) 60%)",
          opacity: hazeOpacity,
        }}
      />

      {/* Clouds image (ถ้ามี) */}
      {cloudsSrc ? (
        <>
          <CloudPanorama
            src={cloudsSrc}
            top="28%"
            height="76%"
            opacity={0.75 * density}
            drift="130s"
            blurPx={0.6}
            maskTop="15%"
            maskBottom="8%"
          />
          <CloudPanorama
            src={cloudsSrc}
            top="36%"
            height="70%"
            opacity={0.9 * density}
            drift="95s"
            blurPx={0.3}
            maskTop="12%"
            maskBottom="10%"
            contrast={1.04}
            brightness={1.02}
          />
        </>
      ) : (
        <>
          <SoftHeartStrip y="35%" width="220%" height="60%" opacity={0.75} drift="95s" />
          <SoftHeartStrip y="50%" width="220%" height="58%" opacity={0.65} drift="130s" invert />
        </>
      )}
    </div>
  );
}

function CloudPanorama({
  src,
  top,
  height,
  opacity = 0.85,
  drift = "220s",
  blurPx = 0.5,
  contrast = 1.02,
  brightness = 1.03,
  maskTop = "10%",
  maskBottom = "10%",
}: {
  src: string;
  top: string;
  height: string;
  opacity?: number;
  drift?: string;
  blurPx?: number;
  contrast?: number;
  brightness?: number;
  maskTop?: string;
  maskBottom?: string;
}) {
  const maskBottomPct = 100 - parseInt(maskBottom);
  return (
    <div
      className="absolute left-[-50%] w-[200%] pointer-events-none"
      style={{
        top,
        height,
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: `blur(${blurPx}px) brightness(${brightness}) contrast(${contrast})`,
        opacity,
        animation: `driftRight ${drift} linear infinite`,
        maskImage: `linear-gradient(to bottom, transparent ${maskTop}, black 30%, black 70%, transparent ${maskBottomPct}%)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent ${maskTop}, black 30%, black 70%, transparent ${maskBottomPct}%)`,
      }}
    />
  );
}

// เมฆหัวใจ (fallback แบบเวคเตอร์)
function SoftHeartStrip({
  y,
  width,
  height,
  opacity,
  drift,
  invert = false,
}: {
  y: string;
  width: string;
  height: string;
  opacity: number;
  drift: string;
  invert?: boolean;
}) {
  return (
    <svg
      className="absolute"
      width={width}
      height={height}
      viewBox="0 0 1000 300"
      preserveAspectRatio="xMidYMid slice"   // ป้องกันบีบ/ยืด
      style={{
        top: y,
        left: "-60%",
        opacity,
        animation: `${invert ? "driftLeft" : "driftRight"} ${drift} linear infinite`,
      }}
    >
      <defs>
        <linearGradient id="cgDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.75)" />
        </linearGradient>
      </defs>
      {(
        [
          [180, 170, 90, 60],
          [430, 165, 120, 70],
          [700, 175, 135, 80],
          [940, 165, 110, 68],
        ] as Array<[number, number, number, number]>
      ).map(([cx, cy, sx, sy], i) => (
        <path
          key={i}
          d="M 0 -0.35 C -0.55 -0.9 -1.35 -0.1 0 0.95 C 1.35 -0.1 0.55 -0.9 0 -0.35 Z"
          fill="url(#cgDay)"
          transform={`translate(${cx} ${cy}) scale(${sx} ${sy})`}
          style={{ filter: "blur(1px)" }}
        />
      ))}
    </svg>
  );
}

/* ---------------- NIGHT ---------------- */

function NightAmbient({
  density = 1,
  style = "milkyway",
  milkyWaySrc,
}: {
  density?: number;
  style?: "milkyway" | "constellation";
  milkyWaySrc?: string;
}) {
  return (
    <div className="w-full h-full relative">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 20%, rgba(160,190,255,0.12), rgba(30,41,59,0) 60%)",
        }}
      />

      {/* ดาว 3 ชั้น */}
      <StarLayer count={140 * density} twinkleMin={5} twinkleMax={9}  drift="240s" opacity={0.9}  seed={11} colorJitter />
      <StarLayer count={90  * density} twinkleMin={6} twinkleMax={11} drift="300s" opacity={0.8}  seed={22} colorJitter />
      <StarLayer count={60  * density} twinkleMin={7} twinkleMax={13} drift="360s" opacity={0.65} seed={33} colorJitter />

      {style === "milkyway" ? <MilkyWayBand src={milkyWaySrc} /> : <Constellations />}

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)",
          backgroundSize: "2px 2px",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

function StarLayer({
  count,
  twinkleMin,
  twinkleMax,
  drift,
  opacity,
  seed,
  colorJitter = false,
}: {
  count: number;
  twinkleMin: number;
  twinkleMax: number;
  drift: string;
  opacity: number;
  seed: number;
  colorJitter?: boolean;
}) {
  const stars = React.useMemo(() => {
    const n = Math.max(1, Math.round(count));
    const arr: Array<{ x: number; y: number; r: number; tw: number; col: string }> = [];
    let s = (seed * 9973) >>> 0;
    for (let i = 0; i < n; i++) {
      s = (s * 1103515245 + 12345) >>> 0;
      const x = (s % 10000) / 100;
      s = (s * 1103515245 + 12345) >>> 0;
      const y = (s % 10000) / 100;
      s = (s * 1103515245 + 12345) >>> 0;
      const r = 0.5 + ((s % 1000) / 1000) * 1.4;
      s = (s * 1103515245 + 12345) >>> 0;
      const tw = twinkleMin + ((s % 1000) / 1000) * (twinkleMax - twinkleMin);
      let col = "rgba(255,255,255,0.95)";
      if (colorJitter) {
        const hue = 200 + (s % 30);
        const lt  = 88 + (s % 10);
        col = `hsl(${hue} 100% ${lt}% / 0.98)`;
      }
      arr.push({ x, y, r, tw, col });
    }
    return arr;
  }, [count, twinkleMin, twinkleMax, seed, colorJitter]);

  return (
    <svg
      className="absolute w-[240%] h-full left-[-70%] top-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"    // ป้องกันบีบ/ยืด
      style={{ opacity, animation: `driftRight ${drift} linear infinite` }}
    >
      {stars.map((st, i) => (
        <Heart
          key={i}
          cx={st.x}
          cy={st.y}
          size={st.r * 0.7}
          fill={st.col}
          style={{ animation: `twinkle ${st.tw}s ease-in-out infinite` }}
        />
      ))}
    </svg>
  );
}

function MilkyWayBand({ src }: { src?: string }) {
  return (
    <>
      <div
        className="absolute inset-[-20%] rotate-[18deg] pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 45%, rgba(200,220,255,0.18), rgba(255,255,255,0.0) 60%), radial-gradient(60% 40% at 60% 60%, rgba(200,220,255,0.14), rgba(255,255,255,0.0) 70%)",
          filter: "blur(1.5px) contrast(1.05)",
          mixBlendMode: "screen",
          maskImage: "radial-gradient(120% 80% at 50% 50%, black 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% 50%, black 35%, transparent 100%)",
          opacity: 0.55,
        }}
      />
      {src && (
        <div
          className="absolute inset-[-18%] rotate-[18deg] pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px) brightness(1.18) contrast(1.12)",
            mixBlendMode: "screen",
            maskImage: "radial-gradient(110% 75% at 50% 50%, black 30%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(110% 75% at 50% 50%, black 30%, transparent 90%)",
            opacity: 0.42,
            animation: "driftRight 280s linear infinite",
          }}
        />
      )}
    </>
  );
}

function Constellations() {
  const nodes: Array<[number, number]> = [
    [8,20],[14,26],[22,24],[30,30],[38,26],[46,32],
    [60,14],[64,22],[70,20],[76,26],[82,22],[88,28],
    [18,70],[26,66],[34,72],[42,68],[50,74],[58,70],[66,76],
  ];
  return (
    <svg
      className="absolute w-[240%] h-full left-[-70%] top-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"    // ป้องกันบีบ/ยืด
      style={{ animation: "driftRight 160s linear infinite" }}
    >
      <g
        stroke="rgba(138,180,248,0.5)"
        strokeWidth="0.25"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 2px rgba(138,180,248,0.35))" }}
      >
        <path d="M8,20 L14,26 L22,24 L30,30 L38,26 L46,32" style={{ animation: "glow 6s ease-in-out infinite" }} />
        <path d="M60,14 L64,22 L70,20 L76,26 L82,22 L88,28" style={{ animation: "glow 7s ease-in-out infinite 1.2s" }} />
        <path d="M18,70 L26,66 L34,72 L42,68 L50,74 L58,70 L66,76" style={{ animation: "glow 8s ease-in-out infinite 0.6s" }} />
      </g>

      {nodes.map(([x, y], i) => (
        <Heart
          key={i}
          cx={x}
          cy={y}
          size={0.9}
          fill="white"
          style={{ animation: `twinkle ${4 + (i % 5)}s ease-in-out infinite` }}
        />
      ))}
    </svg>
  );
}

/* ---------------- KEYFRAMES ---------------- */

const keyframes = `
@keyframes driftRight { 0% { transform: translateX(-2%); } 100% { transform: translateX(2%); } }
@keyframes driftLeft  { 0% { transform: translateX( 2%); } 100% { transform: translateX(-2%); } }
@keyframes twinkle { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes glow { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.85; } }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; }
}
`;
