// components/SoundPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Sound } from '../../../../interfaces/ISound';
import { getSoundsByTypeID } from '../../../../services/https/sounds';

const SoundPanel: React.FC = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingSounds, setPlayingSounds] = useState<Set<number>>(new Set());
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({});

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await getSoundsByTypeID(1);
        setSounds(response.sounds);
        // Initialize volumes
        const initialVolumes: Record<number, number> = {};
        response.sounds.forEach((sound: Sound) => {
          if (sound.ID) initialVolumes[sound.ID] = 50;
        });
        setVolumes(initialVolumes);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSounds();
  }, []);

  const createAudioElement = (soundId: number, src: string) => {
    if (!audioRefs.current[soundId]) {
      const audio = new Audio(`/assets/sounds/${src}`);
      audio.loop = true;
      audio.volume = (volumes[soundId] || 50) / 100;
      audioRefs.current[soundId] = audio;
    }
    return audioRefs.current[soundId];
  };

  const toggleSound = async (soundId: number, soundSrc: string) => {
    const audio = createAudioElement(soundId, soundSrc);
    const newPlayingSounds = new Set(playingSounds);
    
    if (newPlayingSounds.has(soundId)) {
      audio.pause();
      newPlayingSounds.delete(soundId);
    } else {
      try {
        await audio.play();
        newPlayingSounds.add(soundId);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    setPlayingSounds(newPlayingSounds);
  };

  const updateVolume = (soundId: number, volume: number) => {
    setVolumes(prev => ({ ...prev, [soundId]: volume }));
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].volume = volume / 100;
    }
  };

  // Cleanup audio elements when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-white text-xl font-medium flex items-center gap-2">
          🎵 Sounds
        </h3>
        <div className="text-white/60">Loading sounds...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white text-xl font-medium flex items-center gap-2">
        📻 Ambient Sounds
      </h3>
      <div className="space-y-3">
        {sounds.map((sound) => (
          sound.ID && sound.sound && (
            <div key={sound.ID} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white font-medium">{sound.name}</span>
                  {sound.description && (
                    <p className="text-white/60 text-xs">{sound.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleSound(sound.ID!, sound.sound!)}
                  className={`p-2 rounded-full transition-colors ${
                    playingSounds.has(sound.ID!) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {playingSounds.has(sound.ID!) ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
              {playingSounds.has(sound.ID!) && (
                <div className="flex items-center space-x-2">
                  <Volume2 size={16} className="text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumes[sound.ID!] || 50}
                    onChange={(e) => updateVolume(sound.ID!, parseInt(e.target.value))}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none slider"
                  />
                  <span className="text-white/60 text-sm w-8">{volumes[sound.ID!] || 50}</span>
                </div>
              )}
            </div>
          )
        ))}
      </div>
      
      <div className="text-center text-white/60 text-xs mt-4">
        <p>💡 Place your MP3 files in <code>/assets/sounds/</code> folder</p>
      </div>
    </div>
  );
};

export default SoundPanel;