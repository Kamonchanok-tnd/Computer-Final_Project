import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "asmrTimerV1";

// ----------------- utils: read/write state ที่เก็บใน localStorage -----------------
type Mode = "pomodoro" | "short" | "long";
type Store = {
  mode: Mode;
  durations: { pomodoro: number; short: number; long: number };
  isRunning: boolean;
  autoTransition: boolean;
  endAt: number | null;
  pomCount: number;            // จำนวน pomodoro ที่จบแล้วใน cycle นี้ (0..4)
  lastAlarmAt?: number | null; // ป้องกันเสียงซ้ำ
};

const readStore = (): Store => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        mode: (s.mode ?? "pomodoro") as Mode,
        durations: s.durations ?? { pomodoro: 25, short: 5, long: 15 },
        isRunning: !!s.isRunning,
        autoTransition: typeof s.autoTransition === "boolean" ? s.autoTransition : true,
        endAt: typeof s.endAt === "number" ? s.endAt : null,
        pomCount: Number.isInteger(s.pomCount) ? s.pomCount : 0,
        lastAlarmAt: typeof s.lastAlarmAt === "number" ? s.lastAlarmAt : null,
      };
    }
  } catch {}
  return {
    mode: "pomodoro",
    durations: { pomodoro: 25, short: 5, long: 15 },
    isRunning: false,
    autoTransition: true,
    endAt: null,
    pomCount: 0,
    lastAlarmAt: null,
  };
};

const writeStore = (patch: Partial<Store>) => {
  const cur = readStore();
  const next = { ...cur, ...patch };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  return next;
};

// ----------------- UI Parts -----------------
const FlipDigit: React.FC<{ digit: string }> = ({ digit }) => {
  return (
    <div
      className="relative w-10 h-14 text-4xl font-mono font-bold flex items-center justify-center rounded-md shadow-md"
      style={{
        background: "linear-gradient(to bottom, #f9fafb, #e5e7eb)", // ขาว → เทาอ่อน
        color: "#1f2937", // gray-800
        boxShadow: "0 3px 6px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      {/* gloss */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0))" }}
      />
      {digit}
    </div>
  );
};

const FlipClock: React.FC<{ minutes: string; seconds: string }> = ({ minutes, seconds }) => (
  <div className="flex gap-1 items-center">
    {minutes.split("").map((d, i) => <FlipDigit key={`m-${i}`} digit={d} />)}
    <div className="text-3xl font-bold text-gray-700 mx-1">:</div>
    {seconds.split("").map((d, i) => <FlipDigit key={`s-${i}`} digit={d} />)}
  </div>
);

const DotsIndicator: React.FC<{ filled: number }> = ({ filled }) => {
  const dots = Array.from({ length: 4 }, (_, i) => i < filled);
  return (
    <div className="flex gap-1.5">
      {dots.map((on, i) => (
        <span
          key={i}
          className={`inline-block rounded-full ${on ? "bg-orange-500" : "bg-gray-300"}`}
          style={{ width: 8, height: 8 }}
        />
      ))}
    </div>
  );
};

// ----------------- FloatingClock (engine ตอน Panel ปิด) -----------------
const FloatingClock: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomProgress, setPomProgress] = useState<number>(0); // 0..3 (แสดงด้วยจุด)
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  console.log("FloatingClock mounted", { timeLeft, isRunning, pomProgress });
  const beep = () => {
    if (!alarmRef.current) alarmRef.current = new Audio("/assets/asmr/time.mp3");
    alarmRef.current.currentTime = 0;
    alarmRef.current.play().catch(() => {});
  };

  // ปุ่มปิด = hard reset ทั้งระบบ (TimerPanel + FloatingClock)
  const hardReset = () => {
    // เคลียร์สถานะ timer แต่เก็บ durations ไว้
    const s = readStore();
    writeStore({
      mode: "pomodoro",
      isRunning: false,
      endAt: null,
      pomCount: 0,
      lastAlarmAt: null,
      // durations/autoTransition คงค่าเดิมไว้
      durations: s.durations,
      autoTransition: s.autoTransition,
    });

    // แจ้ง component อื่นในหน้านี้ (เช่น TimerPanel ถ้าเปิดอยู่) ให้รีเซ็ตตาม
    try {
      window.dispatchEvent(new CustomEvent("asmrTimer:hardReset"));
    } catch {}

    onClose(); // ปิด FloatingClock UI
  };

  useEffect(() => {
    const tick = () => {
      const s = readStore();

      // อัปเดต indicator: ในหนึ่ง cycle แสดง 0..3 จุดแดง
      setPomProgress(s.pomCount % 4);

      if (s.isRunning && s.endAt) {
        const remain = Math.max(0, Math.floor((s.endAt - Date.now()) / 1000));
        setTimeLeft(remain);
        setIsRunning(true);

        if (remain <= 0) {
          if (s.lastAlarmAt !== s.endAt) {
            beep();
            writeStore({ lastAlarmAt: s.endAt });
          }

          if (s.autoTransition) {
            let next: Mode;
            let nextPom = s.pomCount;
            if (s.mode === "pomodoro") {
              nextPom = s.pomCount + 1;
              next = nextPom % 4 === 0 ? "long" : "short";
            } else {
              next = "pomodoro";
              if (s.mode === "long") nextPom = 0; // ครบ cycle
            }
            const secs = (s.durations?.[next] ?? 1) * 60;
            writeStore({
              mode: next,
              isRunning: true,
              endAt: Date.now() + secs * 1000,
              pomCount: nextPom,
            });
          } else {
            writeStore({ isRunning: false, endAt: null });
            setIsRunning(false);
          }
        }
      } else {
        const secs = (s.durations?.[s.mode] ?? 1) * 60;
        setTimeLeft(secs);
        setIsRunning(false);
      }
    };

    tick();
    const id = setInterval(tick, 1000);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) tick();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div
      className="fixed right-4 top-20 z-50 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3"
      style={{
        background: "rgba(243,244,246,0.95)",   // gray-100
        border: "1px solid rgba(209,213,219,0.8)" // gray-300
      }}
    >
      {/* ซ้อนเป็นคอลัมน์: จุดบอกความคืบหน้า + นาฬิกา */}
      <div className="flex flex-col items-start gap-1">
        <DotsIndicator filled={pomProgress} />
        <FlipClock minutes={mm} seconds={ss} />
      </div>

      <button
        onClick={hardReset}
        className="ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-300/70 hover:bg-gray-400/90"
        title="รีเซ็ตและปิด"
      >
        <X size={16} className="text-gray-700" />
      </button>

      <audio ref={alarmRef} src="/assets/asmr/time.mp3" preload="auto" className="hidden" />
    </div>
  );
};

export default FloatingClock;
