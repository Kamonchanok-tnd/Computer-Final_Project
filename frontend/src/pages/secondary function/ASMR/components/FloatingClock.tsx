import React, { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import focusIcon from "../../../../assets/asmr/focus.png";
import breakIcon from "../../../../assets/asmr/break.png";

const STORAGE_KEY = "asmrTimerV1";

type Mode = "pomodoro" | "short" | "long";
type Store = {
  mode: Mode;
  phase?: Mode; // โหมดที่ "กำลังวิ่งจริง"
  durations: { pomodoro: number; short: number; long: number };
  isRunning: boolean;
  autoTransition: boolean;
  endAt: number | null;
  pomCount: number;
  lastAlarmAt?: number | null;
  soundEnabled?: boolean;
  lastHandledEndAt?: number | null;
  panelOpen?: boolean;
};

const readStore = (): Store => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        mode: (s.mode ?? "pomodoro") as Mode,
        phase: (s.phase ?? s.mode ?? "pomodoro") as Mode,
        durations: s.durations ?? { pomodoro: 25, short: 5, long: 15 },
        isRunning: !!s.isRunning,
        autoTransition: typeof s.autoTransition === "boolean" ? s.autoTransition : true,
        endAt: typeof s.endAt === "number" ? s.endAt : null,
        pomCount: Number.isInteger(s.pomCount) ? s.pomCount : 0,
        lastAlarmAt: typeof s.lastAlarmAt === "number" ? s.lastAlarmAt : null,
        soundEnabled: s.soundEnabled !== false,
        lastHandledEndAt: typeof s.lastHandledEndAt === "number" ? s.lastHandledEndAt : null,
        panelOpen: !!s.panelOpen,
      };
    }
  } catch {}
  return {
    mode: "pomodoro",
    phase: "pomodoro",
    durations: { pomodoro: 25, short: 5, long: 15 },
    isRunning: false,
    autoTransition: true,
    endAt: null,
    pomCount: 0,
    lastAlarmAt: null,
    soundEnabled: true,
    lastHandledEndAt: null,
    panelOpen: false,
  };
};

const writeStore = (patch: Partial<Store>) => {
  const cur = readStore();
  const next = { ...cur, ...patch };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  return next;
};

const FlipDigit: React.FC<{ digit: string }> = ({ digit }) => (
  <div
    className="relative w-10 h-14 text-4xl font-mono font-bold flex items-center justify-center rounded-md shadow-md"
    style={{
      background: "linear-gradient(to bottom, #f9fafb, #e5e7eb)",
      color: "#1f2937",
      boxShadow: "0 3px 6px rgba(0,0,0,0.18)",
      overflow: "hidden",
    }}
  >
    <div
      className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
      style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0))" }}
    />
    {digit}
  </div>
);

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

const FloatingClock: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [_isRunning, setIsRunning] = useState<boolean>(false);
  const [pomProgress, setPomProgress] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<Mode>("pomodoro"); // ใช้ phase เป็นหลัก
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // console.log("FloatingClock rendered" + (isRunning ? " (running)" : ""));
  // sync panelOpen
  useEffect(() => {
    const handler = (e: any) => setPanelOpen(!!e?.detail?.open);
    window.addEventListener("asmrTimer:panelOpenChanged", handler as EventListener);
    setPanelOpen(!!readStore().panelOpen);
    return () => window.removeEventListener("asmrTimer:panelOpenChanged", handler as EventListener);
  }, []);

  const beep = () => {
    const s = readStore();
    if (s.soundEnabled === false) return;
    if (!alarmRef.current) alarmRef.current = new Audio("/assets/asmr/time.mp3");
    alarmRef.current.currentTime = 0;
    alarmRef.current.play().catch(() => {});
  };

  const hardReset = () => {
    const s = readStore();
    writeStore({
      mode: "pomodoro",
      phase: "pomodoro",
      isRunning: false,
      endAt: null,
      pomCount: 0,
      lastAlarmAt: null,
      lastHandledEndAt: null,
      durations: s.durations,
      autoTransition: s.autoTransition,
    });
    try { window.dispatchEvent(new CustomEvent("asmrTimer:hardReset")); } catch {}
    onClose();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    writeStore({ soundEnabled: next });
    try { window.dispatchEvent(new CustomEvent("asmrTimer:soundToggled")); } catch {}
  };

  useEffect(() => {
    const tick = () => {
      const s = readStore();

      // โหมดที่จะแสดง: ถ้ากำลังวิ่งให้ใช้ phase
      const effectiveMode: Mode = (s.isRunning ? (s.phase ?? s.mode) : s.mode) as Mode;
      setDisplayMode(effectiveMode);
      setPomProgress(s.pomCount % 4);
      setSoundOn(s.soundEnabled !== false);
      setPanelOpen(!!s.panelOpen);

      // Panel เปิดอยู่ → ไม่จัดการ transition ใน FloatingClock
      if (s.panelOpen) {
        const remain = s.isRunning && s.endAt
          ? Math.max(0, Math.floor((s.endAt - Date.now()) / 1000))
          : (s.durations?.[effectiveMode] ?? 1) * 60;
        setTimeLeft(remain);
        setIsRunning(!!s.isRunning);
        return;
      }

      if (s.isRunning && s.endAt) {
        const remain = Math.max(0, Math.floor((s.endAt - Date.now()) / 1000));
        setTimeLeft(remain);
        setIsRunning(true);

        if (remain <= 0) {
          // Guard: endAt นี้ถูกจัดการแล้วหรือยัง
          if (s.lastHandledEndAt === s.endAt) return;

          writeStore({ lastHandledEndAt: s.endAt });

          // beep ครั้งเดียว
          if (s.lastAlarmAt !== s.endAt) {
            beep();
            writeStore({ lastAlarmAt: s.endAt });
          }

          if (s.autoTransition) {
            // ใช้ "phase" เป็นโหมดที่เพิ่งจบจริง
            const finished: Mode = (s.phase ?? s.mode) as Mode;

            let nextMode: Mode;
            let nextPom = s.pomCount;
            if (finished === "pomodoro") {
              nextPom = s.pomCount + 1;
              nextMode = nextPom % 4 === 0 ? "long" : "short";
            } else {
              nextMode = "pomodoro";
              if (finished === "long") nextPom = 0; // ครบ cycle
            }

            const secs = (s.durations?.[nextMode] ?? 1) * 60;

            // เขียนทั้ง mode และ phase ให้ตรงกับรอบใหม่
            writeStore({
              mode: nextMode,
              phase: nextMode,
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
        const secs = (s.durations?.[effectiveMode] ?? 1) * 60;
        setTimeLeft(secs);
        setIsRunning(false);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) tick(); };
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(id); window.removeEventListener("storage", onStorage); };
  }, []);

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  const modeIcon = displayMode === "pomodoro" ? focusIcon : breakIcon;

  if (panelOpen) return null;

  return (
    <div
      className="font-ibmthai fixed right-4 top-20 z-50 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2"
      style={{ background: "rgba(243,244,246,0.95)", border: "1px solid rgba(209,213,219,0.8)" }}
    >
      <div className="flex flex-col items-stretch gap-1 w-full">
        <div className="flex items-center gap-2 w-full">
          <DotsIndicator filled={pomProgress} />
          <img
            src={modeIcon}
            alt={displayMode === "pomodoro" ? "Focus time" : "Break time"}
            className="w-8 h-8 opacity-90 select-none"
            draggable={false}
          />
          <button
            onClick={toggleSound}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
              soundOn ? "bg-gray-300/70 hover:bg-gray-400/90" : "bg-gray-200/80 hover:bg-gray-300/90"
            }`}
            title={soundOn ? "ปิดเสียง" : "เปิดเสียง"}
            aria-pressed={soundOn ? "true" : "false"}
          >
            {soundOn ? <Volume2 size={16} className="text-gray-700" /> : <VolumeX size={16} className="text-gray-700" />}
          </button>
          <button
            onClick={() => { writeStore({ lastHandledEndAt: null }); hardReset(); setPanelOpen(false); }}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-full bg-gray-300/70 hover:bg-gray-400/90"
            title="รีเซ็ตและปิด"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>
        <FlipClock minutes={mm} seconds={ss} />
      </div>

      <audio ref={alarmRef} src="/assets/asmr/time.mp3" preload="auto" className="hidden" />
    </div>
  );
};

export default FloatingClock;
