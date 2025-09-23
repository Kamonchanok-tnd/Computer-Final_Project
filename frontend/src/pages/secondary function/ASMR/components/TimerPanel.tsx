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

  // ---------- Lazy init ----------
  const lazyInit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          mode: "pomodoro" as Mode,
          phase: "pomodoro" as Mode, // <- โหมดที่กำลังวิ่งจริง
          durations: { pomodoro: 25, short: 5, long: 15 },
          isRunning: false,
          timeLeft: 25 * 60,
          autoTransition: true,
          endAt: null as number | null,
          pomCount: 0,
        };
      }
      const saved = JSON.parse(raw);
      const durations = saved.durations ?? { pomodoro: 25, short: 5, long: 15 };
      const mode: Mode = saved.mode ?? "pomodoro";
      const phase: Mode = saved.phase ?? mode; // <- ถ้าไม่มี ใช้ mode เดิม
      const autoTransition =
        typeof saved.autoTransition === "boolean" ? saved.autoTransition : true;
      const endAt = typeof saved.endAt === "number" ? saved.endAt : null;
      const pomCount = Number.isInteger(saved.pomCount) ? saved.pomCount : 0;

      const running = !!(saved.isRunning && endAt && endAt > Date.now());
      const remain = running
        ? Math.max(0, Math.round((endAt - Date.now()) / 1000))
        : durations[phase] * 60;

      return {
        mode,
        phase,
        durations,
        isRunning: running,
        timeLeft: remain,
        autoTransition,
        endAt,
        pomCount,
      };
    } catch {
      return {
        mode: "pomodoro" as Mode,
        phase: "pomodoro" as Mode,
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

  const [mode, setMode] = useState<Mode>(init.mode); // โหมดที่ผู้ใช้เลือก
  const [phase, setPhase] = useState<Mode>(init.phase); // โหมดของรอบที่กำลังวิ่ง
  const [durations, setDurations] = useState(
    init.durations as {
      pomodoro: number;
      short: number;
      long: number;
    }
  );
  const [isRunning, setIsRunning] = useState<boolean>(init.isRunning);
  const [timeLeft, setTimeLeft] = useState<number>(init.timeLeft);
  const [showSettings, setShowSettings] = useState(false);
  const [autoTransition, setAutoTransition] = useState<boolean>(
    init.autoTransition
  );
  const [pomCount, setPomCount] = useState<number>(init.pomCount);

  // merge-save (รวมกับของเดิมใน localStorage)
  const saveState = (override?: Partial<any>) => {
    try {
      const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const payload = {
        mode,
        phase,
        durations,
        isRunning,
        autoTransition,
        endAt: endAtRef.current,
        pomCount,
        ...override,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cur, ...payload }));
    } catch {}
  };

  // sync-in
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (saved.durations) setDurations(saved.durations);
      if (saved.mode) setMode(saved.mode as Mode);
      if (saved.phase) setPhase(saved.phase as Mode);
      if (typeof saved.autoTransition === "boolean")
        setAutoTransition(saved.autoTransition);
      if (Number.isInteger(saved.pomCount)) setPomCount(saved.pomCount);
      endAtRef.current = typeof saved.endAt === "number" ? saved.endAt : null;

      if (
        saved.isRunning &&
        endAtRef.current &&
        endAtRef.current > Date.now()
      ) {
        const remain = Math.max(
          0,
          Math.round((endAtRef.current - Date.now()) / 1000)
        );
        setTimeLeft(remain);
        setIsRunning(true);
      } else {
        setIsRunning(false);
        const baseline =
          (saved.durations?.[saved.phase ?? saved.mode ?? phase] ??
            durations[phase]) * 60;
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
        // อ่าน snapshot ปัจจุบันกัน stale
        let store: any = {};
        try {
          store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        } catch {}
        if (store?.lastHandledEndAt === endAtRef.current) {
          // อีกตัวจัดการไปแล้ว
          window.clearInterval(tickRef.current!);
          tickRef.current = null;
          setIsRunning(false);
          endAtRef.current = null;
          saveState({ isRunning: false, endAt: null });
          return;
        }

        // มาร์ค endAt นี้ว่า handle แล้ว
        saveState({ lastHandledEndAt: endAtRef.current });

        // โหมดที่ "เพิ่งจบจริงๆ" ใช้ phase จาก snapshot
        const finishedMode: Mode = (store?.phase as Mode) ?? phase;

        // ปิดรอบปัจจุบันก่อน
        window.clearInterval(tickRef.current!);
        tickRef.current = null;
        setIsRunning(false);
        endAtRef.current = null;
        saveState({ isRunning: false, endAt: null });

        playSound();

        if ((store?.autoTransition ?? autoTransition) === true) {
          // คำนวณโหมดถัดไปจาก snapshot
          let nextMode: Mode;
          let nextPom = Number.isInteger(store?.pomCount)
            ? store.pomCount
            : pomCount;

          if (finishedMode === "pomodoro") {
            nextPom = nextPom + 1;
            nextMode = nextPom % 4 === 0 ? "long" : "short";
          } else {
            nextMode = "pomodoro";
            if (finishedMode === "long") nextPom = 0;
          }

          const baseDurations = store?.durations ?? durations;
          const secs = (baseDurations[nextMode] ?? 1) * 60;

          // อัปเดต phase เป็นโหมดรอบใหม่
          setPomCount(nextPom);
          setPhase(nextMode);
          setMode(nextMode); // ให้ UI ปุ่ม active ตรงกัน
          setTimeLeft(secs);

          // เริ่มรอบใหม่ทันที
          setTimeout(() => startTimer(false, secs, nextMode), 10);
          saveState({ mode: nextMode, phase: nextMode, pomCount: nextPom });
        }
      }
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [isRunning, autoTransition, phase, durations, pomCount]);

  // ถ้าไม่ได้วิ่งอยู่ อัปเดตเวลาตามโหมดที่จะแสดง (phase ใช้เฉพาะตอนวิ่ง)
  // อย่า reset เวลา ถ้ายังมี endAt (กำลังเดิน)
  // ใส่ phase และ pomCount ใน deps ด้วย เพื่อไม่ให้เซฟค่ารอบเก่าทับของใหม่
  useEffect(() => {
    if (endAtRef.current) {
      // กำลังวิ่งอยู่ → แค่อัปเดต state ใน storage ให้เป็นค่าล่าสุด
      saveState({ mode, phase, durations, pomCount });
      return;
    }
    // ไม่ได้วิ่ง → เวลาอ้างอิงตาม mode ที่จะแสดง
    setTimeLeft(durations[mode] * 60);
    saveState({ mode, phase, durations, pomCount });
  }, [mode, durations, phase, pomCount]);

  // รีเฟรชแม้เปิดอยู่
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadState();
    };
    window.addEventListener("storage", onStorage);

    const syncInterval = window.setInterval(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        const changed =
          (typeof saved.endAt === "number" ? saved.endAt : null) !==
            endAtRef.current ||
          !!saved.isRunning !== isRunning ||
          saved.phase !== phase ||
          (Number.isInteger(saved.pomCount) ? saved.pomCount : pomCount) !==
            pomCount ||
          JSON.stringify(saved.durations ?? durations) !==
            JSON.stringify(durations);
        if (changed) loadState();
      } catch {}
    }, 1000);

    const onHardReset = () => loadState();
    window.addEventListener(
      "asmrTimer:hardReset",
      onHardReset as EventListener
    );

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "asmrTimer:hardReset",
        onHardReset as EventListener
      );
      window.clearInterval(syncInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, pomCount, durations]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  // เพิ่ม forceMode เพื่อบันทึก phase ให้เป๊ะ
  const startTimer = async (
    resume = false,
    secondsOverride?: number,
    forceMode?: Mode
  ) => {
    const effectiveMode = forceMode ?? phase ?? mode;
    const seconds =
      secondsOverride ??
      (timeLeft > 0 ? timeLeft : durations[effectiveMode] * 60);

    // ✅ อ่าน pomCount ล่าสุดจาก localStorage เพื่อกันโดนเขียนทับด้วยค่า state เก่า
    let latestPom = pomCount;
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (Number.isInteger(s?.pomCount)) latestPom = s.pomCount;
    } catch {}

    endAtRef.current = Date.now() + seconds * 1000;
    setIsRunning(true);
    setPhase(effectiveMode);
    // ✅ เซฟโดยระบุ pomCount = ล่าสุดเสมอ
    saveState({
      isRunning: true,
      endAt: endAtRef.current,
      phase: effectiveMode,
      pomCount: latestPom,
    });

    try {
      if (resume) return;
      const userIdStr = localStorage.getItem("id");
      if (!userIdStr) return;
      const userId = parseInt(userIdStr);
      const recentSettings = selectedSID
        ? [{ sid: selectedSID, volume: volumes[selectedSID] || 50 }]
        : [];
      const selectedDuration = durations[effectiveMode];
      await createASMR(userId, selectedDuration, recentSettings);
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
    setPhase(mode); // รีเซ็ต phase ให้ตรงกับโหมดที่เลือก
    setTimeLeft(durations[mode] * 60);
    saveState({
      isRunning: false,
      endAt: null,
      phase: mode,
      lastHandledEndAt: null,
    });
  };

  // แจ้งว่า Panel เปิดอยู่ -> FloatingClock ซ่อนตัว
  useEffect(() => {
    try {
      const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...cur, panelOpen: true })
      );
      window.dispatchEvent(
        new CustomEvent("asmrTimer:panelOpenChanged", {
          detail: { open: true },
        })
      );
    } catch {}
    return () => {
      try {
        const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...cur, panelOpen: false })
        );
        window.dispatchEvent(
          new CustomEvent("asmrTimer:panelOpenChanged", {
            detail: { open: false },
          })
        );
      } catch {}
    };
  }, []);

  // เคารพปุ่มปิดเสียงร่วมกับ FloatingClock
  const playSound = () => {
    let soundEnabled = true;
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      soundEnabled = s.soundEnabled !== false;
    } catch {}
    if (!soundEnabled) return;
    if (!audioRef.current)
      audioRef.current = new Audio("/assets/asmr/time.mp3");
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  // ใช้ phase ขณะกำลังวิ่ง, ใช้ mode เมื่อหยุด
  const uiMode = isRunning ? phase : mode;

  return (
    <div className="font-ibmthai space-y-4">
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
                  setPhase(m); // เปลี่ยนโหมดด้วยมือ ให้ phase ตามด้วย
                  setTimeLeft(durations[m] * 60);
                  saveState({
                    mode: m,
                    phase: m,
                    isRunning: false,
                    endAt: null,
                  });
                }}
                className={`px-1.5 py-0.5 rounded-full text-xs transition-colors ${
                  uiMode === m
                    ? "bg-white text-black font-bold"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {m === "pomodoro"
                  ? "เวลาโฟกัส"
                  : m === "short"
                  ? "เวลาพักสั้น"
                  : "เวลาพักยาว"}
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
                onClick={() => startTimer(false, undefined, mode)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                เริ่ม
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                หยุดชั่วคราว
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              รีเซ็ต
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
              <span>การเปลี่ยนโหมดอัตโนมัติ</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(["pomodoro", "short", "long"] as const).map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <label className="text-white/60 text-xs mb-1">
                    {key === "pomodoro"
                      ? "เวลาโฟกัส"
                      : key === "short"
                      ? "เวลาพักสั้น"
                      : "เวลาพักยาว"}
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

            <div className="text-white/70 pt-2">
              รอบเวลาโฟกัส : <b>{pomCount % 4}</b> / 4
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} src="/assets/asmr/time.mp3" preload="auto" />
    </div>
  );
};

export default TimerPanel;
