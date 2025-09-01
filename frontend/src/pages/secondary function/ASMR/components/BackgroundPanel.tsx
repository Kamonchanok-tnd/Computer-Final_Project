import React, { useState, useEffect } from "react";
import { Sound } from "../../../../interfaces/ISound";
import { getSoundsByTypeID } from "../../../../services/https/sounds";
import iconBg from "../../../../assets/asmr/asmr-bg.png";

interface BackgroundPanelProps {
  selectedId: number | null;
  onSelectBg: (id: number, bgUrl: string, sid: number) => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ selectedId, onSelectBg }) => {
  const [backgrounds, setBackgrounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await getSoundsByTypeID(1);
        setBackgrounds(response.sounds);
        if (!selectedId && response.sounds.length > 0 && response.sounds[0].ID && response.sounds[0].sound) {
          onSelectBg(response.sounds[0].ID, response.sounds[0].sound, response.sounds[0].ID);
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
    <div className="space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        <img src={iconBg} alt="Backgrounds" className="w-8 h-8" />
        ภาพพื้นหลัง
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {backgrounds.map((bg) => (
          <div
            key={bg.ID}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedId === bg.ID ? "border-blue-400" : "border-transparent hover:border-gray-400"
            }`}
            onClick={() => selectBackground(bg.ID!)}
          >
            <img
              src={bg.sound ? `https://img.youtube.com/vi/${bg.sound.split("v=")[1]?.split("&")[0]}/mqdefault.jpg` : "/api/placeholder/200/120"}
              alt={bg.name}
              className="w-full h-20 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-white text-xs font-medium">{bg.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundPanel;
