import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react"; // ✅ ใช้ Speaker + Music
import { useLocation, useNavigate } from "react-router-dom";
import owlImage from "../../../assets/maditaion.jpg";
import BubbleBackground from "./BubbleBackground";

function BreathingExercise() {
  const location = useLocation();
  const navigate = useNavigate();

  const customTime = location.state?.customTime; // HH:MM:SS
  const selectedTime = location.state?.time;     // นาที (เก่า)
  const videoUrl = location.state?.videoUrl || "";

  // ✅ ฟังก์ชันแปลง HH:MM:SS -> วินาที
  const parseTimeToSeconds = (timeStr: string) => {
    const [h, m, s] = timeStr.split(":").map((v) => parseInt(v || "0", 10));
    return h * 3600 + m * 60 + s;
  };

  // ✅ ใช้ customTime ถ้ามี ถ้าไม่มีใช้ selectedTime
  const totalSeconds = customTime
    ? parseTimeToSeconds(customTime)
    : (selectedTime || 0) * 60;

  const [seconds, setSeconds] = useState(totalSeconds);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(false); // ✅ voice guide
  const [showPopup, setShowPopup] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  const extractYouTubeId = (url: string) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  };
  const videoId = extractYouTubeId(videoUrl);

  const postMessageToPlayer = (command: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    }
  };

  const toggleAudio = () => {
    if (!iframeRef.current) return;
    if (isPlaying) {
      postMessageToPlayer("pauseVideo");
      setIsPlaying(false);
    } else {
      postMessageToPlayer("playVideo");
      postMessageToPlayer("unMute");
      setIsPlaying(true);
    }
  };

  const speak = (text: string, rate: number = 1) => {
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "th-TH";
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    }
  };

  useEffect(() => {
    if (!isVoiceOn) return;
    speak(phase === "in" ? "หายใจเข้า" : "หายใจออก", 0.9);
  }, [phase, isVoiceOn]);

  useEffect(() => {
    if (seconds === 0) {
      postMessageToPlayer("pauseVideo");
      setIsPlaying(false);
      setIsVoiceOn(false);
      setShowPopup(true);
    }
  }, [seconds]);

  const inDuration = 3;   // หายใจเข้า 3 วินาที
  const outDuration = 4;  // หายใจออก 4 วินาที

  useEffect(() => {
    let frame: number;
    let startTime: number | null = null;
    const currentDuration = phase === "in" ? inDuration : outDuration;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      let pct = Math.min(elapsed / currentDuration, 1);
      if (phase === "out") pct = 1 - pct;
      setProgress(pct * circumference);

      if (elapsed < currentDuration) {
        frame = requestAnimationFrame(animate);
      } else {
        setPhase((prev) => (prev === "in" ? "out" : "in"));
        startTime = null;
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")} : ${m
      .toString()
      .padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/audiohome/meditation");
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-700 
        ${phase === "out"
          ? "bg-gradient-to-b from-[#A1CAE2] to-white"
          : "bg-gradient-to-b from-white to-[#b3e5fc]"
        }`}
    >
      <BubbleBackground />
      {videoId && (
        <iframe
          ref={iframeRef}
          title="YouTube Audio Player"
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=0&mute=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0`}
          frameBorder="0"
          allow="autoplay"
          style={{ display: "none" }}
        />
      )}

      <div className="text-center mb-10">
        <h1
          className={`text-3xl font-extrabold tracking-widest drop-shadow-lg
            ${phase === "in" ? "text-[#a2d4ff]" : "text-white"}`}
        >
          {phase === "in" ? "BREATHE IN" : "BREATHE OUT"}
        </h1>
        <p
          className={`text-lg font-extrabold tracking-widest drop-shadow-lg
            ${phase === "in" ? "text-[#a2d4ff]" : "text-white"} mt-1`}
        >
          {customTime ? `TIME: ${customTime}` : `FOR ${selectedTime || 0} MIN`}
        </p>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="absolute w-full h-full rotate-[-90deg]">
          <circle cx="112" cy="112" r={radius} stroke="#ffffff33" strokeWidth="8" fill="none" />
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#ffffff"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>

        <img
          src={owlImage}
          alt="owl"
          className="z-10 rounded-full object-cover"
          style={{
            width: "200px",
            height: "200px",
            padding: "6px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div className="mt-10 w-full flex items-center justify-center gap-32">
        {/* ✅ Voice Guide */}
        <button
          type="button"
          aria-label="Toggle voice guide"
          title="Toggle voice guide"
          onClick={() => setIsVoiceOn((prev) => !prev)}
          className={`${isVoiceOn ? "bg-green-500" : "bg-gray-500"} 
            hover:bg-[#1e40af] text-white rounded-full p-3 shadow-lg transition`}
        >
          {isVoiceOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        <div className="text-white text-2xl font-semibold drop-shadow">
          {formatTime(seconds)}
        </div>

        {/* ✅ Music (YouTube) */}
        <button
          type="button"
          aria-label="Toggle background sound"
          title="Toggle background sound"
          onClick={toggleAudio}
          className={`${isPlaying ? "bg-red-500" : "bg-[#2563eb]"
            } hover:bg-[#1e40af] text-white rounded-full p-3 shadow-lg transition`}
        >
          {isPlaying ? <Music2 className="w-6 h-6" /> : <Music className="w-6 h-6" />}
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[#b3e5fc] rounded-2xl p-8 shadow-2xl text-center animate-fadeIn scale-95 max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-[#0288d1] mb-4">🎉 ฝึกสมาธิครบแล้ว!</h2>
            <p className="text-[#01579b] mb-6">คุณทำได้เยี่ยมมาก</p>
            <button
              onClick={handlePopupClose}
              className="bg-[#03a9f4] hover:bg-[#039be5] text-white px-6 py-2 rounded-xl shadow-lg transition"
            >
              กลับไปหน้า Meditation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BreathingExercise;
