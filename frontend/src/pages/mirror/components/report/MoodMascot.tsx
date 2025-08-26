
/** โหมดมาสคอต */
export type MascotMood = "happy" | "angry" | "sad" | "neutral";

/** ขนาดแนะนำ: 120–160px (responsive ได้) */
export default function MoodMascot({
  mood,
  size = 140,
  label,
}: {
  mood: MascotMood;
  size?: number;
  label?: string; // คำบรรยายใต้รูป (ไม่บังคับ)
}) {
  // โทนสีให้เข้ากับธีมฟ้า + มองชัด
  const faceFill =
    mood === "happy" ? "#FCD34D" : mood === "angry" ? "#FCA5A5" : mood === "sad" ? "#93C5FD" : "#E5E7EB";
  const stroke = "rgba(0,0,0,0.35)";

  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      {/* keyframes ใส่เฉพาะในคอมโพเนนต์นี้ (ชื่อ unique) */}
      <style>
        {`
        @keyframes mm-bob { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6%) } }
        @keyframes mm-shake { 0%,100%{ transform: translateX(0) } 25%{ transform: translateX(-3%) } 75%{ transform: translateX(3%) } }
        @keyframes mm-blink { 0%,88%,92%,100%{ transform: scaleY(1) } 90%{ transform: scaleY(0.05) } }
        @keyframes mm-tear { 0%{ opacity:0; transform: translate(0,-2px) } 10%{ opacity:1 } 100%{ opacity:0; transform: translate(0,16px) } }
      `}
      </style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={[
          "drop-shadow-sm",
          mood === "happy" ? "animate-[mm-bob_2.8s_ease-in-out_infinite]" : "",
          mood === "angry" ? "animate-[mm-shake_1.2s_ease-in-out_infinite]" : "",
          mood === "neutral" ? "" : "",
          mood === "sad" ? "" : "",
        ].join(" ")}
        aria-hidden
      >
        {/* พื้น */}
        <ellipse cx="50" cy="90" rx="22" ry="5" fill="rgba(0,0,0,0.06)" />

        {/* หน้ากลม */}
        <circle cx="50" cy="50" r="28" fill={faceFill} stroke={stroke} strokeWidth="1.5" />

        {/* ตา (มี blink) */}
        <g transform="translate(0,0)">
          <rect x="38" y="45" width="8" height="2.5" rx="1.25" fill={stroke} className="origin-center animate-[mm-blink_4.5s_linear_infinite]" />
          <rect x="54" y="45" width="8" height="2.5" rx="1.25" fill={stroke} className="origin-center animate-[mm-blink_5.2s_linear_infinite]" />
        </g>

        {/* แก้ม(เฉพาะ happy) */}
        {mood === "happy" && (
          <>
            <circle cx="36" cy="56" r="3.5" fill="rgba(244,114,182,0.5)" />
            <circle cx="64" cy="56" r="3.5" fill="rgba(244,114,182,0.5)" />
          </>
        )}

        {/* คิ้วโกรธ */}
        {mood === "angry" && (
          <>
            <path d="M34 40 L45 44" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M66 40 L55 44" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* ปาก */}
        {mood === "happy" && (
          <path d="M38 60 Q50 67 62 60" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mood === "neutral" && (
          <path d="M40 61 L60 61" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mood === "angry" && (
          <path d="M40 64 Q50 56 60 64" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mood === "sad" && (
          <path d="M40 66 Q50 58 60 66" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* น้ำตา (sad) */}
        {mood === "sad" && (
          <>
            <circle cx="64" cy="58" r="2" fill="#60A5FA" className="animate-[mm-tear_1.8s_ease-in-out_infinite]" />
            <circle cx="36" cy="58" r="2" fill="#60A5FA" className="animate-[mm-tear_2.1s_ease-in-out_infinite]" />
          </>
        )}
      </svg>

      {label && <div className="mt-1 text-xs sm:text-sm text-slate-600">{label}</div>}
    </div>
  );
}
