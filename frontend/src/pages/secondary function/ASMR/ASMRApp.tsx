import React, { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import BackgroundPanel from "./components/BackgroundPanel";
import SoundPanel from "./components/SoundPanel";
import TimerPanel from "./components/TimerPanel";
import { PanelType } from "../../../interfaces/ISound";
import asmrImg from "../../../assets/asmr.png";
import iconBg from "../../../assets/asmr/asmr-bg.png";
import iconSound from "../../../assets/asmr/asmr-hp.png";
import iconTimer from "../../../assets/asmr/asmr-t.png";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const ASMRApp: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [selectedBgId, setSelectedBgId] = useState<number | null>(null);
  const [selectedBgUrl, setSelectedBgUrl] = useState<string | null>(null);
  const [selectedSID, setSelectedSID] = useState<number | null>(null); // <-- เก็บ sound ID
  const [volume, setVolume] = useState<number>(50);
  const [muted, setMuted] = useState<boolean>(false);
  const playerRef = useRef<any>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({});

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = createPlayer;
    return () => {
      document.body.removeChild(tag);
    };
  }, []);

  useEffect(() => {
    if (selectedBgUrl && window.YT && window.YT.Player) {
      createPlayer();
    }
  }, [selectedBgUrl]);

  const createPlayer = () => {
    if (iframeContainerRef.current && selectedBgUrl) {
      const videoId = extractVideoId(selectedBgUrl);
      if (playerRef.current) playerRef.current.destroy();

      playerRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: videoId,
          mute: muted ? 1 : 0,
          start: 30,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
            muted ? event.target.mute() : event.target.unMute();
          },
        },
      });
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      muted ? playerRef.current.unMute() : playerRef.current.mute();
    }
    setMuted(!muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
      vol === 0 ? playerRef.current.mute() : playerRef.current.unMute();
      setMuted(vol === 0);
    }
  };

  const toggleSound = async (key: string, src: string) => {
    if (!audioRefs.current[key]) {
      const audio = new Audio(`/assets/asmr/${src}`);
      audio.loop = true;
      audio.volume = (volumes[key] || 50) / 100;
      audioRefs.current[key] = audio;
    }
    const audio = audioRefs.current[key];
    const newPlaying = new Set(playingSounds);

    if (newPlaying.has(key)) {
      audio.pause();
      newPlaying.delete(key);
    } else {
      try {
        await audio.play();
        newPlaying.add(key);
      } catch (err) {
        console.error("Cannot play:", key, err);
      }
    }
    setPlayingSounds(newPlaying);
  };

  const updateVolume = (key: string, value: number) => {
    setVolumes((prev) => ({ ...prev, [key]: value }));
    if (audioRefs.current[key]) audioRefs.current[key].volume = value / 100;
  };

  const menuItems = [
    { id: "background" as const, label: "Backgrounds", icon: iconBg },
    { id: "sound" as const, label: "Sounds", icon: iconSound },
    { id: "timer" as const, label: "Timer", icon: iconTimer },
  ];

  const renderPanelContent = () => {
    switch (activePanel) {
      case "background":
        return (
          <BackgroundPanel
            selectedId={selectedBgId}
            onSelectBg={(id, url, sid) => {
              setSelectedBgId(id);
              setSelectedBgUrl(url);
              setSelectedSID(sid); // <-- เก็บ SID
              setPlayingSounds(new Set([sid.toString()]));
            }}
          />
        );
      case "sound":
        return (
          <SoundPanel
            playingSounds={playingSounds}
            volumes={volumes}
            toggleSound={toggleSound}
            updateVolume={updateVolume}
          />
        );
      case "timer":
        return (
          <TimerPanel
            playingSounds={playingSounds}
            volumes={volumes}
            selectedSID={selectedSID} // <-- ส่งต่อไป TimerPanel
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh flex bg-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: !selectedBgUrl
              ? `linear-gradient(180deg, #CCFFED 0%, #dffbffff 100%)`
              : undefined,
          }}
        >
          {!selectedBgUrl && (
            <img
              src={asmrImg}
              alt="ASMR"
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 max-w-full"
              style={{ zIndex: 1 }}
            />
          )}
          <div
            ref={iframeContainerRef}
            className="absolute inset-0"
            style={{
              width: "150vw",
              height: "150vh",
              left: "-25vw",
              top: "-25vh",
              zIndex: 0,
            }}
          />
          <div className="absolute inset-0 bg-black/0"></div>
        </div>
      </div>

      {/* Volume Controls */}
      {selectedBgUrl && (
        <div className="absolute bottom-2 right-4 z-40 flex items-center gap-3 bg-black/10 p-3 rounded-xl backdrop-blur">
          <button onClick={toggleMute} className="text-white">
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolumeChange}
            className="slider w-32"
          />
        </div>
      )}

      {/* Side Menu */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              setActivePanel(activePanel === item.id ? null : item.id)
            }
            className={`w-12 h-12 rounded-full backdrop-blur-lg border border-white/20 flex items-center justify-center text-2xl transition-all hover:scale-110 hover:bg-white/20 ${
              activePanel === item.id
                ? "bg-white/30 border-white/40"
                : "bg-black/20"
            }`}
            title={item.label}
          >
            <img src={item.icon} alt={item.label} className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Overlay Panel */}
      {activePanel && (
        <>
          <div
            className="absolute inset-0 z-30 bg-black/50"
            onClick={() => setActivePanel(null)}
          />
          <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-40 w-80 max-h-[80vh] bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 overflow-y-auto scrollbar-hide">
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>
            <div className="mt-2">{renderPanelContent()}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ASMRApp;

function extractVideoId(url: string) {
  const match = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : url;
}
