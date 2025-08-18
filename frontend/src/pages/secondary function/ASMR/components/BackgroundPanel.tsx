import React, { useState, useEffect } from "react";
import { Sound } from "../../../../interfaces/ISound";
import { getSoundsByTypeID } from "../../../../services/https/sounds";
import iconBg from "../../../../assets/asmr/asmr-bg.png";


interface BackgroundPanelProps {
  selectedId: number | null;
  onSelectBg: (id: number, bgUrl: string) => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  selectedId,
  onSelectBg,
}) => {
  const [backgrounds, setBackgrounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await getSoundsByTypeID(1);
        setBackgrounds(response.sounds);
        if (
          !selectedId &&
          response.sounds.length > 0 &&
          response.sounds[0].ID &&
          response.sounds[0].sound
        ) {
          onSelectBg(response.sounds[0].ID, response.sounds[0].sound);
        }
      } catch (error) {
        console.error("Error fetching backgrounds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgrounds();
  }, []);

  const selectBackground = (bgId: number) => {
    const bg = backgrounds.find((b) => b.ID === bgId);
    if (bg?.sound) {
      onSelectBg(bgId, bg.sound);
    }
    setIsPlaying(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=${
      isPlaying ? 1 : 0
    }&mute=${volume === 0 ? 1 : 0}&controls=0&loop=1&playlist=${videoId}`;
  };

  const generateThumbnail = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-white text-xl font-medium flex items-center gap-2">
          <img src={iconBg} alt="Backgrounds" className="w-8 h-8" />
          ภาพพื้นหลัง
        </h3>
        <div className="text-white/60">Loading backgrounds...</div>
      </div>
    );
  }

  const selectedBackground = backgrounds.find((bg) => bg.ID === selectedId);

  return (
    <div className="space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        <img src={iconBg} alt="Backgrounds" className="w-8 h-8" />
        ภาพพื้นหลัง
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {backgrounds.map(
          (bg) =>
            bg.ID && (
              <div
                key={bg.ID}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedId === bg.ID
                    ? "border-blue-400"
                    : "border-transparent hover:border-gray-400"
                }`}
                onClick={() => selectBackground(bg.ID!)}
              >
                <img
                  src={
                    bg.sound
                      ? generateThumbnail(bg.sound)
                      : "/api/placeholder/200/120"
                  }
                  alt={bg.name}
                  className="w-full h-20 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/200/120";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium">{bg.name}</p>
                </div>
                {selectedId === bg.ID && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full"></div>
                )}
              </div>
            )
        )}
      </div>

      {/* เพิ่มส่วนนี้เพื่อแสดงรายละเอียดวิดีโอที่เลือก */}
      {selectedBackground && (
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-medium">
                {selectedBackground.name}
              </span>
              {selectedBackground.description && (
                <p className="text-white/60 text-sm">
                  {selectedBackground.description}
                </p>
              )}
            </div>
          </div>
          {/* สามารถเพิ่มข้อมูลอื่น ๆ เช่น duration, author ฯลฯ ได้ที่นี่ */}
        </div>
      )}

      {selectedBackground?.sound && (
        <div className="hidden">
          <iframe
            src={getYouTubeEmbedUrl(selectedBackground.sound)}
            title={selectedBackground.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;
