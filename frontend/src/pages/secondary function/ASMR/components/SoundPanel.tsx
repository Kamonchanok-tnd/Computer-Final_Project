import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const ambianceFiles = [
  { name: "Rain", file: "asmr-rain.mp3", icon: "🌧️" },
  { name: "Water", file: "asmr-water.mp3", icon: "💧" },
  { name: "Beach", file: "asmr-beach.mp3", icon: "🌅" },
  { name: "Cafe", file: "asmr-cafe.mp3", icon: "☕" },
  { name: "Fire", file: "asmr-fire.mp3", icon: "🔥" },
  { name: "Cinematic", file: "asmr-cinematic.mp3", icon: "🎬" },
  { name: "Frog", file: "asmr-frog.mp3", icon: "🐸" },
  { name: "Birds", file: "asmr-bird.mp3", icon: "🐦" },
  { name: "Mechanical Keyboard", file: "asmr-mechanical-keyboard.mp3", icon: "⌨️" },
  { name: "Pencil", file: "asmr-pencil.mp3", icon: "✏️" },
];

interface Props {
  playingSounds: Set<string>;
  volumes: Record<string, number>;
  toggleSound: (key: string, src: string) => void;
  updateVolume: (key: string, value: number) => void;
}

const SoundPanel: React.FC<Props> = ({ playingSounds, volumes, toggleSound, updateVolume }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        🎧 Ambience
      </h3>
      <div className="space-y-3">
        {ambianceFiles.map((item) => {
          const isPlaying = playingSounds.has(item.file);
          const volume = volumes[item.file] ?? 50;

          return (
            <div key={item.file} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                <button
                  onClick={() => toggleSound(item.file, item.file)}
                  className={`p-2 rounded-full transition-colors ${
                    isPlaying
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              {isPlaying && (
                <div className="flex items-center space-x-2">
                  <Volume2 size={16} className="text-white/60" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => updateVolume(item.file, parseInt(e.target.value))}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none slider"
                  />
                  <span className="text-white/60 text-sm w-8">{volume}</span>
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
