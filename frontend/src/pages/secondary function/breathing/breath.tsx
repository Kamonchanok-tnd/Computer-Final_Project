import React, { useState, useRef, useEffect } from "react";
import "./breath.css";

import { getBreathingSounds } from "../../../services/https/breathing";

interface Sound {
  id: string;
  title: string;
}

const BreathingPage: React.FC = () => {
  const [breathing, setBreathing] = useState<"หายใจเข้า" | "หายใจออก">("หายใจเข้า");
  const [started, setStarted] = useState(false);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const timeoutRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const breathInDuration = 3000;
  const breathOutDuration = 3000;

  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingText, setBreathingText] = useState("เริ่ม");

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "th-TH";
      window.speechSynthesis.speak(utterance);
    }
  };

  const startBreathingCycle = (current: "หายใจเข้า" | "หายใจออก") => {
    speak(current);
    setBreathing(current);

    const nextDuration = current === "หายใจเข้า" ? breathInDuration : breathOutDuration;
    const nextState = current === "หายใจเข้า" ? "หายใจออก" : "หายใจเข้า";

    timeoutRef.current = window.setTimeout(() => {
      startBreathingCycle(nextState);
    }, nextDuration);
  };

  const stopBreathingCycle = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    setBreathing("หายใจเข้า");
  };

  const postMessageToPlayer = (command: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    }
  };

  const loadAndPlayVideo = (videoId: string) => {
    if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0`;
    }
  };

  const handleCircleClick = () => {
    if (isBreathing) {
      // หยุดการหายใจ
      setIsBreathing(false);
      setBreathingText("Start");
      stopBreathingCycle();
      postMessageToPlayer("pauseVideo");
      setStarted(false);
    } else {
      // เริ่มการหายใจ
      setIsBreathing(true);
      setBreathingText("");
      startBreathingCycle("หายใจเข้า");
      postMessageToPlayer("playVideo");
      setStarted(true);
    }
  };

  const handleStart = () => {
    if (!started) {
      setIsBreathing(true);
      setBreathingText("");
      setStarted(true);
      postMessageToPlayer("playVideo");
      startBreathingCycle("หายใจเข้า");
    }
  };

  const handleStop = () => {
    setIsBreathing(false);
    setBreathingText("start");
    setStarted(false);
    stopBreathingCycle();
    postMessageToPlayer("pauseVideo");
  };

  const handleChangeSong = (videoId: string) => {
  // หยุดรอบหายใจ
  stopBreathingCycle();
  // หยุดเสียงเพลงเดิม
  postMessageToPlayer("pauseVideo");
  // รีเซ็ตสถานะ
  setIsBreathing(false);
  setStarted(false);
  setBreathingText("เริ่ม");

  // เปลี่ยนเพลงใหม่
  setCurrentVideoId(videoId);
  if (iframeRef.current) {
    iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`;
  }
};


  useEffect(() => {
    (async () => {
      try {
        const data = await getBreathingSounds();
        if (data.sounds && data.sounds.length > 0) {
          const fetchedSounds = data.sounds.map((s: any) => ({
            id: extractYouTubeId(s.Sound),
            title: s.Name,
          }));
          setSounds(fetchedSounds);
          setCurrentVideoId(fetchedSounds[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch breathing sounds", error);
      }
    })();

    return () => {
      stopBreathingCycle();
      postMessageToPlayer("pauseVideo");
    };
  }, []);

  const extractYouTubeId = (url: string) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  };

  return (
    <div className="breathing-page">
      <h1>ฝึกหายใจ</h1>

      <div className="sound-selector">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => handleChangeSong(sound.id)}
            className={`sound-btn ${currentVideoId === sound.id ? "active" : ""}`}
            title={sound.title}
          >
            🎵 {sound.title}
          </button>
        ))}
      </div>

      <div className="breathing-exercise">
        <div
          className={`circle ${isBreathing ? "breathing" : ""}`}
          onClick={handleCircleClick}
        >
          {/* แสดง "เริ่ม" ตอนยังไม่เริ่ม และ "หายใจเข้า" / "หายใจออก" ตอนกำลังหายใจ */}
          <span>{isBreathing ? breathing : breathingText}</span>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        title="YouTube Audio Player"
        width="0"
        height="0"
        src={`https://www.youtube.com/embed/${currentVideoId}?enablejsapi=1&controls=0&autoplay=0&loop=1&playlist=${currentVideoId}&modestbranding=1&rel=0`}
        frameBorder="0"
        allow="autoplay"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default BreathingPage;
