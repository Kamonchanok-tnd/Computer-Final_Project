import React, { useState, useRef, useEffect } from "react";
import "./breath.css";

import { getBreathingSounds } from "../../../services/https/breathing";

interface Sound {
  id: string;       // YouTube video ID
  title: string;    // ชื่อเพลง
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

  const handleStart = () => {
    if (!started) {
      setStarted(true);
      postMessageToPlayer("playVideo");
      startBreathingCycle("หายใจเข้า");
    }
  };

  const handleStop = () => {
    setStarted(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    postMessageToPlayer("pauseVideo");
    setBreathing("หายใจเข้า");
  };

  const handleChangeSong = (videoId: string) => {
    setCurrentVideoId(videoId);
    if (started) {
      loadAndPlayVideo(videoId);
    } else {
      if (iframeRef.current) {
        iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&autoplay=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`;
      }
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.speechSynthesis.cancel();
      postMessageToPlayer("pauseVideo");
    };
  }, []);

  // ฟังก์ชันแยกเอา YouTube Video ID จาก URL (รองรับทั้ง youtu.be และ youtube.com)
  function extractYouTubeId(url: string) {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  }

  return (
    <div className="breathing-page" >
      <h1>ฝึกหายใจ</h1>

      {/* ปุ่มเลือกเพลงมุมขวาบน */}
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
        <div className="circle">
          <span>{breathing}</span>
        </div>
      </div>

      <div className="control-buttons">
        {!started ? (
          <button onClick={handleStart} className="btn start-btn">
            ▶ เริ่ม
          </button>
        ) : (
          <button onClick={handleStop} className="btn stop-btn">
            ■ หยุด
          </button>
        )}
      </div>

      {/* iframe YouTube แบบซ่อน */}
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
