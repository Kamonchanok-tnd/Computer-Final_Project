import React, { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import iconTimer from "../../../../assets/asmr/asmr-t.png";
import { createASMR } from "../../../../services/https/asmr";

type Mode = "pomodoro" | "short" | "long";

interface TimerPanelProps {
  playingSounds: Set<string>;
  volumes: Record<string, number>;
  selectedSID: number | null;
}

const STORAGE_KEY = "asmrTimerV1";

const TimerPanel: React.FC<TimerPanelProps> = ({ volumes, selectedSID }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAtRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  // ---------- Lazy init จาก localStorage ----------
  const lazyInit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          mode: "pomodoro" as Mode,
          durations: { pomodoro: 25, short: 5, long: 15 },
          isRunning: false,
          timeLeft: 25 * 60,
          autoTransition: true,
          endAt: null as number | null,
          pomCount: 0, // จำนวนรอบ pomodoro ที่จบแล้วในหนึ่ง cycle
        };
      }
      const saved = JSON.parse(raw);
      const durations = saved.durations ?? { pomodoro: 25, short: 5, long: 15 };
      const mode: Mode = saved.mode ?? "pomodoro";
      const autoTransition =
        typeof saved.autoTransition === "boolean" ? saved.autoTransition : true;
      const endAt = typeof saved.endAt === "number" ? saved.endAt : null;
      const pomCount = Number.isInteger(saved.pomCount) ? saved.pomCount : 0;

      const running = !!(saved.isRunning && endAt && endAt > Date.now());
      const remain = running
        ? Math.max(0, Math.round((endAt - Date.now()) / 1000))
        : durations[mode] * 60;

      return { mode, durations, isRunning: running, timeLeft: remain, autoTransition, endAt, pomCount };
    } catch {
      return {
        mode: "pomodoro" as Mode,
        durations: { pomodoro: 25, short: 5, long: 15 },
        isRunning: false,
        timeLeft: 25 * 60,
        autoTransition: true,
        endAt: null as number | null,
        pomCount: 0,
      };
    }
  };

  const init = lazyInit();
  endAtRef.current = init.endAt;

  const [mode, setMode] = useState<Mode>(init.mode);
  const [durations, setDurations] = useState(init.durations as {
    pomodoro: number;
    short: number;
    long: number;
  });
  const [isRunning, setIsRunning] = useState<boolean>(init.isRunning);
  const [timeLeft, setTimeLeft] = useState<number>(init.timeLeft);
  const [showSettings, setShowSettings] = useState(false);
  const [autoTransition, setAutoTransition] = useState<boolean>(init.autoTransition);
  const [pomCount, setPomCount] = useState<number>(init.pomCount);

  const saveState = (override?: Partial<any>) => {
    const payload = {
      mode,
      durations,
      isRunning,
      autoTransition,
      endAt: endAtRef.current,
      pomCount,
      ...override,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  };

  // sync state เผื่อโดนแก้จาก component อื่น
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.durations) setDurations(saved.durations);
      if (saved.mode) setMode(saved.mode as Mode);
      if (typeof saved.autoTransition === "boolean")
        setAutoTransition(saved.autoTransition);
      if (Number.isInteger(saved.pomCount)) setPomCount(saved.pomCount);
      endAtRef.current = typeof saved.endAt === "number" ? saved.endAt : null;

      if (saved.isRunning && endAtRef.current && endAtRef.current > Date.now()) {
        const remain = Math.max(
          0,
          Math.round((endAtRef.current - Date.now()) / 1000)
        );
        setTimeLeft(remain);
        setIsRunning(true); // ไม่ startTimer ใหม่
      } else {
        setIsRunning(false);
        const baseline =
          (saved.durations?.[saved.mode] ?? durations[mode]) * 60;
        setTimeLeft(baseline);
        endAtRef.current = null;
        saveState({ isRunning: false, endAt: null });
      }
    } catch {}
  };

  useEffect(() => {
    loadState();
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  useEffect(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (!isRunning) return;

    tickRef.current = window.setInterval(() => {
      if (!endAtRef.current) return;
      const remain = Math.max(
        0,
        Math.round((endAtRef.current - Date.now()) / 1000)
      );
      setTimeLeft(remain);

      if (remain <= 0) {
        // จด mode ที่เพิ่งจบไว้ก่อน (เพราะเดี๋ยว mode จะเปลี่ยน)
        const finishedMode: Mode = mode;

        window.clearInterval(tickRef.current!);
        tickRef.current = null;
        setIsRunning(false);
        endAtRef.current = null;
        saveState({ isRunning: false, endAt: null });

        playSound();
        if (autoTransition) {
          autoAdvance(finishedMode);
        }
      }
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [isRunning, autoTransition, mode, durations, pomCount]);

  // อย่า reset เวลา ถ้ายังมี endAt (กำลังเดิน)
  useEffect(() => {
    if (endAtRef.current) {
      saveState({ mode, durations, pomCount });
      return;
    }
    setTimeLeft(durations[mode] * 60);
    saveState({ mode, durations, pomCount });
  }, [mode, durations]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  // รองรับ secondsOverride เพื่อเริ่มนับด้วยเวลาที่กำหนดตรง ๆ
  const startTimer = async (resume = false, secondsOverride?: number) => {
    const seconds =
      secondsOverride ??
      (timeLeft > 0 ? timeLeft : durations[mode] * 60);

    endAtRef.current = Date.now() + seconds * 1000;
    setIsRunning(true);
    saveState({ isRunning: true, endAt: endAtRef.current });

    try {
      if (resume) return; // รีซูมไม่ยิง API
      const userIdStr = localStorage.getItem("id");
      if (!userIdStr) return;
      const userId = parseInt(userIdStr);

      const recentSettings = selectedSID
        ? [{ sid: selectedSID, volume: volumes[selectedSID] || 50 }]
        : [];
      console.log("Sending recentSettings to API:", recentSettings);

      const selectedDuration = durations[mode];
      await createASMR(userId, selectedDuration, recentSettings);
      console.log(
        `ASMR record saved for user ${userId}, duration ${selectedDuration} min`,
        recentSettings
      );
    } catch (err) {
      console.error("Failed to save ASMR record", err);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    endAtRef.current = null;
    saveState({ isRunning: false, endAt: null });
  };

  const resetTimer = () => {
    setIsRunning(false);
    endAtRef.current = null;
    setTimeLeft(durations[mode] * 60);
    saveState({ isRunning: false, endAt: null });
  };

  // ---------- Auto Pomodoro Cycle ----------
  const autoAdvance = (finishedMode: Mode) => {
    let next: Mode;
    let nextPomCount = pomCount;

    if (finishedMode === "pomodoro") {
      nextPomCount = pomCount + 1;
      // ทุกครั้งที่จบ pomodoro: ถ้าเป็นครั้งที่ 4 → long, ไม่งั้น short
      next = nextPomCount % 4 === 0 ? "long" : "short";
    } else {
      // จาก break (short/long) กลับไป pomodoro
      next = "pomodoro";
      if (finishedMode === "long") {
        // จบ long = ครบหนึ่ง cycle → รีเซ็ตตัวนับ
        nextPomCount = 0;
      }
    }

    setPomCount(nextPomCount);
    setMode(next);

    const secs = durations[next] * 60;
    setTimeLeft(secs);
    // เริ่มนับทันทีด้วยเวลาของช่วงใหม่ (คำนวณตรง ๆ เลี่ยง race condition)
    setTimeout(() => startTimer(false, secs), 10);
    saveState({ mode: next, pomCount: nextPomCount });
  };

  const playSound = () => {
    if (!audioRef.current) audioRef.current = new Audio("/assets/asmr/time.mp3");
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        <img src={iconTimer} alt="Focus Timer" className="w-5 h-5" />
        เวลาโฟกัส
      </h3>

      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-center mb-4">
          <div className="text-4xl font-mono text-white mb-4">
            {formatTime(timeLeft)}
          </div>

          <div className="flex justify-center mb-4 space-x-4">
            {(["pomodoro", "short", "long"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setIsRunning(false);
                  endAtRef.current = null;
                  setMode(m);
                  setPomCount(m === "pomodoro" ? pomCount : pomCount); // ไม่เปลี่ยนตัวนับเมื่อเปลี่ยนมือ
                  setTimeLeft(durations[m] * 60);
                  saveState({ mode: m, isRunning: false, endAt: null });
                }}
                className={`px-1.5 py-0.5 rounded-full text-xs transition-colors ${
                  mode === m
                    ? "bg-white text-black font-bold"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {m === "pomodoro"
                  ? "Pomodoro"
                  : m === "short"
                  ? "Short Break"
                  : "Long Break"}
              </button>
            ))}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="ml-2 text-white/70 hover:text-white"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="flex justify-center space-x-2">
            {!isRunning ? (
              <button
                onClick={() => startTimer()}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 space-y-3 text-sm text-white">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoTransition}
                onChange={(e) => {
                  setAutoTransition(e.target.checked);
                  saveState({ autoTransition: e.target.checked });
                }}
              />
              <span>Auto-transition Timer</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(["pomodoro", "short", "long"] as const).map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <label className="text-white/60 text-xs mb-1">
                    {key === "pomodoro"
                      ? "Pomodoro"
                      : key === "short"
                      ? "Short Break"
                      : "Long Break"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={durations[key]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setDurations((prev) => ({ ...prev, [key]: val }));
                      if (!isRunning && mode === key) setTimeLeft(val * 60);
                      saveState({ durations: { ...durations, [key]: val } });
                    }}
                    className="w-16 px-2 py-1 bg-white/20 text-white rounded text-center"
                  />
                </div>
              ))}
            </div>

            {/* แสดงสถานะรอบ Pomodoro ปัจจุบัน */}
            <div className="text-white/70 pt-2">
              รอบ Pomodoro ใน cycle นี้: <b>{pomCount % 4}</b> / 4
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} src="/assets/asmr/time.mp3" preload="auto" />
    </div>
  );
};

export default TimerPanel;
