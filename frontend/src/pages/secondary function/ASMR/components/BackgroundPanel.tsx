import React, { useState, useEffect } from "react";
import { Sound } from "../../../../interfaces/ISound";
import { getSoundsByTypeID } from "../../../../services/https/sounds";
import iconBg from "../../../../assets/asmr/asmr-bg.png";

interface BackgroundPanelProps {
  selectedId: number | null;
  onSelectBg: (id: number, bgUrl: string, sid: number) => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  selectedId,
  onSelectBg,
}) => {
  const [backgrounds, setBackgrounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);

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
          onSelectBg(
            response.sounds[0].ID,
            response.sounds[0].sound,
            response.sounds[0].ID
          );
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
    if (bg?.sound && bg.ID) {
      onSelectBg(bgId, bg.sound, bg.ID);
    }
  };

  if (loading) return <div>Loading backgrounds...</div>;

  return (
    <div className="font-ibmthai space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        <img src={iconBg} alt="Backgrounds" className="w-8 h-8" />
        ภาพพื้นหลัง
      </h3>

      <div
        className="
    grid
    [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]
    sm:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]
    grid grid-cols-1 md:grid-cols-2 gap-3
  "
      >
        {backgrounds.map((bg) => (
          <div
            key={bg.ID}
            className={`group relative cursor-pointer rounded-lg overflow-hidden
        border border-white/20 transition
        ${
          selectedId === bg.ID
            ? "ring-2 ring-blue-400/60"
            : "hover:border-white/30"
        }`}
            onClick={() => selectBackground(bg.ID!)}
          >
            <img
              src={
                bg.sound
                  ? `https://img.youtube.com/vi/${
                      bg.sound.split("v=")[1]?.split("&")[0]
                    }/mqdefault.jpg`
                  : "/api/placeholder/200/120"
              }
              alt={bg.name}
              className="w-full aspect-[16/9] object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 sm:p-2">
              <p className="text-white text-[11px] sm:text-xs font-medium truncate">
                {bg.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundPanel;
