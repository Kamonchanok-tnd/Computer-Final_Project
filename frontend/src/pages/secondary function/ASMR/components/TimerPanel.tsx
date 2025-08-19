import React, { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import iconTimer from "../../../../assets/asmr/asmr-t.png";


type Mode = "pomodoro" | "short" | "long";

const STORAGE_KEY = "asmrTimerV1";

const TimerPanel: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAtRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const [mode, setMode] = useState<Mode>("pomodoro");
  const [durations, setDurations] = useState({
    pomodoro: 20,
    short: 5,
    long: 15,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durations.pomodoro * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [autoTransition, setAutoTransition] = useState(true);

  const saveState = (override?: Partial<any>) => {
    const payload = {
      mode,
      durations,
      isRunning,
      autoTransition,
      endAt: endAtRef.current,
      ...override,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (saved.durations) setDurations(saved.durations);
      if (saved.mode) setMode(saved.mode as Mode);
      if (typeof saved.autoTransition === "boolean")
        setAutoTransition(saved.autoTransition);

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
        // เรียก startTimer() ทีหลังให้ interval ทำงานด้วย
        setTimeout(() => startTimer(), 100);
      } else {
        setIsRunning(false);
        setTimeLeft((saved.durations?.[saved.mode] ?? durations[mode]) * 60);
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
        window.clearInterval(tickRef.current!);
        tickRef.current = null;
        setIsRunning(false);
        endAtRef.current = null;
        saveState({ isRunning: false, endAt: null });
        playSound();

        if (autoTransition) {
          handleAutoTransition();
        }
      }
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    setTimeLeft(durations[mode] * 60);
    saveState({ mode, durations });
  }, [mode, durations]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => {
    const seconds = timeLeft > 0 ? timeLeft : durations[mode] * 60;
    endAtRef.current = Date.now() + seconds * 1000;
    setIsRunning(true);
    saveState({ isRunning: true, endAt: endAtRef.current });
  };

  const pauseTimer = () => {
    setIsRunning(false);
    endAtRef.current = null;
    saveState({ isRunning: false, endAt: null });
  };

  const resetTimer = () => {
    setIsRunning(false);
    endAtRef.current = null;
    const s = durations[mode] * 60;
    setTimeLeft(s);
    saveState({ isRunning: false, endAt: null });
  };

  const handleAutoTransition = () => {
    let next: Mode = "pomodoro";
    if (mode === "pomodoro") next = "short";
    else if (mode === "short") next = "pomodoro";
    else if (mode === "long") next = "pomodoro";

    setMode(next);
    setTimeLeft(durations[next] * 60);
    setTimeout(() => startTimer(), 100);
  };

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/asmr/time.mp3");
    }
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
                onClick={startTimer}
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
          </div>
        )}
      </div>

      {/* preload audio */}
      <audio ref={audioRef} src="/assets/asmr/time.mp3" preload="auto" />
    </div>
  );
};

export default TimerPanel;
