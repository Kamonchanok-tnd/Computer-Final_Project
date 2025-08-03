import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ ใช้ navigate
import owlImage from "../../../assets/maditaion.jpg";

function BreathingExercise() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ สำหรับ redirect
  const selectedTime = location.state?.time || 5;
  const totalSeconds = selectedTime * 60;
  const videoUrl = location.state?.videoUrl || "";

  const [seconds, setSeconds] = useState(totalSeconds);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const duration = 6;
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
    if (!isMicOn) return;
    speak(phase === "in" ? "หายใจเข้า" : "หายใจออก", 0.9);
  }, [phase, isMicOn]);

  // ✅ เมื่อหมดเวลา -> หยุดเพลง + ปิดไมค์ + Popup
  useEffect(() => {
    if (seconds === 0) {
      postMessageToPlayer("pauseVideo");
      setIsPlaying(false);
      setIsMicOn(false);
      setShowPopup(true);
    }
  }, [seconds]);

  useEffect(() => {
    let frame: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      let pct = Math.min(elapsed / duration, 1);
      if (phase === "out") pct = 1 - pct;
      setProgress(pct * circumference);

      if (elapsed < duration) {
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
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/audiohome/meditation"); // ✅ Redirect ไปหน้า meditation
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen transition-colors duration-700 
        ${phase === "out"
          ? "bg-gradient-to-b from-[#2c3e50] to-[#1a252f]"
          : "bg-gradient-to-b from-[#f8d8d0] to-[#d2e9e3]"
        }`}
    >
      <div
        className={`w-[800px] h-[700px] rounded-3xl relative flex flex-col items-center justify-center shadow-2xl transition-colors duration-700 
          ${phase === "out"
            ? "bg-gradient-to-b from-[#34495e] to-[#2c3e50]"
            : "bg-gradient-to-b from-[#a3e4e1] to-[#fefefe]"
          }`}
      >
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
          <h1 className="text-white text-3xl font-semibold tracking-widest drop-shadow">
            {phase === "in" ? "BREATHE IN" : "BREATHE OUT"}
          </h1>
          <p className="text-white/80 mt-1 text-lg">FOR A COUNT OF {selectedTime}</p>
        </div>

        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="absolute w-full h-full rotate-[-90deg]">
            <circle
              cx="112"
              cy="112"
              r={radius}
              stroke="#ffffff33"
              strokeWidth="8"
              fill="none"
            />
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

          <img src={owlImage} alt="owl" className="w-28 h-28 z-10" />
        </div>

        <div className="absolute bottom-8 w-full flex items-center justify-center gap-32">
          <button
            type="button"
            aria-label="Toggle microphone"
            title="Toggle microphone"
            onClick={() => setIsMicOn((prev) => !prev)}
            className={`${isMicOn ? "bg-green-500" : "bg-gray-500"} 
              hover:bg-[#1e40af] text-white rounded-full p-3 shadow-lg transition`}
          >
            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <div className="text-white text-lg font-semibold drop-shadow">
            {formatTime(seconds)}
          </div>

          <button
            type="button"
            aria-label="Toggle sound"
            title="Toggle sound"
            onClick={toggleAudio}
            className={`${isPlaying ? "bg-red-500" : "bg-[#2563eb]"
              } hover:bg-[#1e40af] text-white rounded-full p-3 shadow-lg transition`}
          >
            {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        {/* ✅ Popup */}
        {showPopup && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-fadeIn scale-95">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                🎉 ฝึกสมาธิครบแล้ว!
              </h2>
              <p className="text-gray-700 mb-6">คุณทำได้เยี่ยมมาก</p>
              <button
                onClick={handlePopupClose} // ✅ ปิด popup และ redirect
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl shadow-lg transition"
              >
                กลับไปหน้า Meditation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BreathingExercise;
