import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "asmrTimerV1";

const FlipDigit: React.FC<{ digit: string }> = ({ digit }) => {
  return (
    <div
      className="relative w-10 h-14 text-4xl font-mono font-bold 
                 flex items-center justify-center rounded-md shadow-md"
      style={{
        background: "linear-gradient(to bottom, #f9fafb, #e5e7eb)", // ขาว → เทาอ่อน
        color: "#1f2937", // เทาเข้ม (gray-800)
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transition: "transform 0.6s ease-in-out",
      }}
    >
      {digit}
    </div>
  );
};

const FlipClock: React.FC<{ minutes: string; seconds: string }> = ({
  minutes,
  seconds,
}) => {
  return (
    <div className="flex gap-1 items-center">
      {minutes.split("").map((d, i) => (
        <FlipDigit key={`m-${i}`} digit={d} />
      ))}
      <div className="text-3xl font-bold text-gray-700 mx-1">:</div>
      {seconds.split("").map((d, i) => (
        <FlipDigit key={`s-${i}`} digit={d} />
      ))}
    </div>
  );
};

const FloatingClock: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.isRunning && saved.endAt) {
          const remain = Math.max(
            0,
            Math.round((saved.endAt - Date.now()) / 1000)
          );
          setTimeLeft(remain);
          setIsRunning(true);
        } else {
          setIsRunning(false);
          setTimeLeft(0);
        }
      } catch {}
    };

    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return { m, s };
  };

  if (!isRunning) return null;

  const { m, s } = formatTime(timeLeft);

  return (
    <div
      className="fixed top-20 md:top-20 lg:top-20 right-4 z-50 
                 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-md"
      style={{
        background: "rgba(243,244,246,0.9)", // gray-100 แบบโปร่ง
        border: "1px solid rgba(209,213,219,0.6)", // ขอบ gray-300
      }}
    >
      <FlipClock minutes={m} seconds={s} />
      <button
        onClick={onClose}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300/60 hover:bg-gray-400/70"
      >
        <X size={14} className="text-gray-700" />
      </button>
    </div>
  );
};

export default FloatingClock;
