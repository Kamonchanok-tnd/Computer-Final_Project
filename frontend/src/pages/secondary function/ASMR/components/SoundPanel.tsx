import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import iconSound from "../../../../assets/asmr/asmr-hp.png";

const ambianceFiles = [
  { name: "ฝนตก", file: "asmr-rain.mp3", icon: "🌧️" },
  { name: "น้ำ", file: "asmr-water.mp3", icon: "💧" },
  { name: "ชายหาด", file: "asmr-beach.mp3", icon: "🌅" },
  { name: "คาเฟ่", file: "asmr-cafe.mp3", icon: "☕" },
  { name: "ไฟ", file: "asmr-fire.mp3", icon: "🔥" },
  { name: "ภาพยนตร์", file: "asmr-cinematic.mp3", icon: "🎬" },
  { name: "กบ", file: "asmr-frog.mp3", icon: "🐸" },
  { name: "นก", file: "asmr-bird.mp3", icon: "🐦" },
  { name: "คีย์บอร์ด", file: "asmr-mechanical-keyboard.mp3", icon: "⌨️" },
  { name: "ดินสอ", file: "asmr-pencil.mp3", icon: "✏️" },
];

interface Props {
  playingSounds: Set<string>;
  volumes: Record<string, number>;
  toggleSound: (key: string, src: string) => void;
  updateVolume: (key: string, value: number) => void;
}

const SoundPanel: React.FC<Props> = ({ playingSounds, volumes, toggleSound, updateVolume }) => {
  return (
    <div className="font-ibmthai space-y-4">
      <h3 className="text-white text-lg md:text-xl font-medium flex items-center gap-2">
        <img src={iconSound} alt="Ambience" className="w-7 h-7 md:w-8 md:h-8" />
        เสียงบรรยากาศ
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {ambianceFiles.map((item) => {
          const isPlaying = playingSounds.has(item.file);
          const volume = volumes[item.file] ?? 50;

          return (
            <div key={item.file} className="bg-white/10 rounded-xl p-3 md:p-4 backdrop-blur-sm">
              {/* แถวบน: ไอคอน+ชื่อ + ปุ่มเล่น/หยุด → บนจอเล็กให้ wrap ได้ */}
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="flex items-center gap-2 text-white font-medium">
                  <span className="text-lg md:text-xl leading-none">{item.icon}</span>
                  <span className="text-sm md:text-base">{item.name}</span>
                </div>
                <button
                  onClick={() => toggleSound(item.file, item.file)}
                  className={`p-2 md:p-2.5 rounded-full transition-colors
                    ${isPlaying ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/80 hover:bg-white/30'}`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              {/* แถวล่าง: แถบปรับเสียง → มือถือเรียงซ้อน/ชิด, md+ กว้างขึ้น */}
              {isPlaying && (
                <div className="flex items-center gap-2 md:gap-3">
                  <Volume2 size={16} className="text-white/60 shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => updateVolume(item.file, parseInt(e.target.value))}
                    className="flex-1 h-1.5 md:h-2 bg-white/20 rounded-lg appearance-none slider"
                  />
                  <span className="text-white/60 text-xs md:text-sm w-8 text-right">{volume}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SoundPanel;
