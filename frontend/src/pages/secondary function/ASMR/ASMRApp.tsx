import React, { useState } from "react";
import { X } from "lucide-react";
import BackgroundPanel from "./components/BackgroundPanel";
import SoundPanel from "./components/SoundPanel";
import TimerPanel from "./components/TimerPanel";
import { PanelType } from "../../../interfaces/ISound";
import asmrImg from "../../../assets/asmr.png";

const ASMRApp: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);

  const menuItems = [
    { id: "background" as const, label: "🖼️ Backgrounds", emoji: "🖼️" },
    { id: "sound" as const, label: "📻 Sounds", emoji: "📻" },
    { id: "timer" as const, label: "⏳ Timer", emoji: "⏳" },
  ];

  const renderPanelContent = () => {
    switch (activePanel) {
      case "background":
        return <BackgroundPanel onSelectBg={setSelectedBg} />;
      case "sound":
        return <SoundPanel />;
      case "timer":
        return <TimerPanel />;
      default:
        return null;
    }
  };

  return (
    <div
      className="h-screen flex bg-gray-900 relative overflow-hidden"
      style={{ overflow: "hidden", height: "100%" }}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: !selectedBg
              ? `linear-gradient(180deg, #CCFFED 0%, #dffbffff 100%)`
              : undefined,
          }}
        >
          {/* แสดงรูป asmr.png เฉพาะตอนยังไม่ได้เลือกวิดีโอ */}
          {!selectedBg && (
            <img
              src={asmrImg}
              alt="ASMR Cartoon"
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 max-w-full"
              style={{ zIndex: 1 }}
            />
          )}
          {/* ถ้าเลือกวิดีโอ ให้แสดง iframe YouTube */}
          {selectedBg && (
            <iframe
              src={`https://www.youtube.com/embed/${extractVideoId(
                selectedBg
              )}?autoplay=1&controls=0&loop=1&playlist=${extractVideoId(
                selectedBg
              )}&start=30`}
              title="Background Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0"
              style={{
                zIndex: 0,
                width: "150vw",
                height: "150vh",
                left: "-25vw",
                top: "-25vh",
                objectFit: "cover",
                position: "absolute",
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/0"></div>
        </div>
      </div>

      {/* Side Menu Buttons */}
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
            {item.emoji}
          </button>
        ))}
      </div>

      {/* Overlay Panel */}
      {activePanel && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-30 bg-black/50"
            onClick={() => setActivePanel(null)}
          />

          {/* Panel */}
          <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-40 w-80 max-h-[80vh] bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Panel Content */}
            <div className="mt-2">{renderPanelContent()}</div>
          </div>
        </>
      )}

      {/* Custom CSS for slider */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ASMRApp;

// เพิ่มฟังก์ชันช่วยดึง videoId
function extractVideoId(url: string) {
  const match = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : url;
}
