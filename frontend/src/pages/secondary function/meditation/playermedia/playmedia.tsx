import {
  ChevronLeft,
  Clock,
  Heart,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sound } from "../../../../interfaces/ISound";
import { getSoundByID, getSoundsByTypeID } from "../../../../services/https/sounds";
import { useParams } from "react-router-dom";
import "./playmedia.css";
import { useNavigate } from "react-router-dom";
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

function Playermediameditation() {
  const { ID } = useParams();
  const p_id = Number(ID);

  const [currentSound, setCurrentSound] = useState<Sound | null>(null);


  const [meditationSounds, setMeditationSounds] = useState<Sound[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
  });
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const playerRef = useRef<HTMLDivElement>(null);

  async function fetchSound(id: number) {
    try {
      const res = await getSoundByID(id);
      setCurrentSound(res.data);
    } catch (error) {
      console.error("Error fetching sound:", error);
    }
  }

  async function fetchMeditation() {
    try {
      const res = await getSoundsByTypeID(2);
      setMeditationSounds(res.sounds);
    } catch (error) {
      console.error("Error fetching meditation sounds:", error);
    }
  }

  useEffect(() => {
    if (p_id && meditationSounds.length > 0) {
      const index = meditationSounds.findIndex((item) => item.ID === p_id);
      if (index !== -1) {
        setCurrentIndex(index); // 🔥 เซ็ต index ให้ตรงกับ ID
      }
    }
  }, [p_id, meditationSounds]);

  useEffect(() => {
    if (p_id) {
      fetchSound(p_id);
      fetchMeditation();
    }
  }, [p_id]);

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVideoId = (item: Sound): string | null => {
    return extractYouTubeID(item.sound || "");
  };

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
  }, []);

  useEffect(() => {
  if (!isApiReady || !playerRef.current || meditationSounds.length === 0) return;
  if (currentIndex === null || currentIndex === undefined) return; // ✅ ถ้า index ยังไม่ถูกเซ็ต อย่าเพิ่งสร้าง player

  const currentVideoId = getVideoId(meditationSounds[currentIndex]);
  console.log("🎥 แสดงคลิป:", { currentIndex, currentVideoId, sound: meditationSounds[currentIndex] });

  if (player) {
    player.loadVideoById(currentVideoId);
    updateVideoTitle(player);
    return;
  }

  const newPlayer = new window.YT.Player(playerRef.current, {
  height: "350",
  width: "100%",
  videoId: currentVideoId || "dQw4w9WgXcQ",
  playerVars: { controls: 0, modestbranding: 1, rel: 0, showinfo: 0 },
  events: {
    onReady: (event: any) => {
      setPlayer(event.target);
      updateVideoTitle(event.target);
    },
    onStateChange: (event: any) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    },
  },
});

}, [isApiReady, meditationSounds, currentIndex]);

  const updateVideoTitle = (playerInstance: any) => {
  if (currentIndex === null) {
    setVideoTitle("Unknown Title");
    return;
  }

  try {
    const title =
      playerInstance.getVideoData()?.title ||
      meditationSounds[currentIndex]?.name ||
      "Unknown Title";
    setVideoTitle(title);
  } catch (error) {
    setVideoTitle(meditationSounds[currentIndex]?.name || "Unknown Title");
  }
};

  const playVideo = (index: number) => {
  setCurrentIndex(index);
  const videoId = getVideoId(meditationSounds[index]);

  if (player && videoId) {
    player.loadVideoById(videoId);
    setPlayerState(prev => ({
      ...prev,
      currentTime: 0,
      duration: 0,
      isPlaying: true, // ✅ ให้ปุ่มเปลี่ยนเป็น Pause ทันที
    }));
    setTimeout(() => {
      updateVideoTitle(player);
      const newDuration = player.getDuration();
      if (newDuration && newDuration > 0) {
        setPlayerState(prev => ({
          ...prev,
          duration: newDuration,
        }));
      }
      player.playVideo();
    }, 1500);
  }
};

  const playNext = () => {
  if (currentIndex === null) return; // ✅ กัน null

  let nextIndex;
  if (isShuffled) {
    nextIndex = Math.floor(Math.random() * meditationSounds.length);
  } else {
    nextIndex = (currentIndex + 1) % meditationSounds.length;
  }
  playVideo(nextIndex);
};

const playPrevious = () => {
  if (currentIndex === null) return; // ✅ กัน null

  let prevIndex;
  if (isShuffled) {
    prevIndex = Math.floor(Math.random() * meditationSounds.length);
  } else {
    prevIndex = currentIndex === 0 ? meditationSounds.length - 1 : currentIndex - 1;
  }
  playVideo(prevIndex);
};


  const togglePlay = () => {
    if (player) {
      if (playerState.isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (player) {
      player.seekTo(time);
      setPlayerState((prev) => ({ ...prev, currentTime: time }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value);
    if (player) {
      player.setVolume(volume);
      setPlayerState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
    }
  };

  const toggleMute = () => {
    if (player) {
      if (playerState.isMuted) {
        player.unMute();
        setPlayerState((prev) => ({ ...prev, isMuted: false }));
      } else {
        player.mute();
        setPlayerState((prev) => ({ ...prev, isMuted: true }));
      }
    }
  };

  const seekBackward = () => {
    if (player) {
      const newTime = Math.max(0, playerState.currentTime - 10);
      player.seekTo(newTime);
    }
  };

  const seekForward = () => {
    if (player) {
      const newTime = Math.min(playerState.duration, playerState.currentTime + 10);
      player.seekTo(newTime);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const navigate = useNavigate(); // ✅ ใช้งาน navigate

  return (
    <div className="flex flex-col min-h-full items-center bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] dark:bg-background-dark">
      <div className="sm:mt-4 px-2 sm:px-8 sm:w-[95%] w-full flex flex-col gap-8">
        <div className="grid grid-cols-3 w-full gap-12">
          {/* Player */}
          <div className="col-span-2 bg-white/50 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col">
            <div className="flex gap-4 items-center">
               <button onClick={() => navigate("/audiohome/meditation")}>
                <ChevronLeft size={32} className="text-[#00796B] cursor-pointer" />
              </button>
              <h1 className="text-2xl font-semibold text-[#004D40]">ทำสมาธิ</h1>
            </div>

            <div className="w-full mt-4">
              <div className="bg-black rounded-2xl overflow-hidden mb-6">
                <div ref={playerRef} className="w-full aspect-video" />
              </div>
            </div>

            <div className="rounded-2xl px-2">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Heart className="text-[#00796B]" />
                  </div>
                  <p className="text-[#004D40] text-lg font-medium">{videoTitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} className="p-2 text-[#00796B]">
                    {playerState.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={playerState.volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-[#B2DFDB] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-[#004D40] text-sm mb-2">
                  <span>{formatTime(playerState.currentTime)}</span>
                  <span>{formatTime(playerState.duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={playerState.duration > 0 ? playerState.duration : 100}
                  value={playerState.currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background:
                      playerState.duration > 0
                        ? `linear-gradient(to right, #80CBC4 0%, #B2DFDB ${
                            (playerState.currentTime / playerState.duration) * 100
                          }%, #E0F2F1 ${(playerState.currentTime / playerState.duration) * 100}%, #E0F2F1 100%)`
                        : "rgba(255,255,255,0.3)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={toggleShuffle}
                  className={`p-3 rounded-full ${isShuffled ? "bg-[#80CBC4]" : "bg-transparent"}`}
                  title="สุ่มเล่น"
                >
                  <Shuffle size={25} className={isShuffled ? "text-white" : "text-[#00796B]"} />
                </button>

                <div className="flex items-center gap-4">
                  <button onClick={playPrevious} className="p-3 bg-[#80CBC4] rounded-full text-white">
                    <SkipBack size={25} />
                  </button>
                  <button onClick={seekBackward} className="p-2 bg-[#E0F2F1] rounded-full text-[#00796B]">
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-4 bg-[#4DB6AC] rounded-full text-white"
                  >
                    {playerState.isPlaying ? <Pause size={30} /> : <Play size={30} />}
                  </button>
                  <button onClick={seekForward} className="p-2 bg-[#E0F2F1] rounded-full text-[#00796B]">
                    <RotateCw size={18} />
                  </button>
                  <button onClick={playNext} className="p-3 bg-[#80CBC4] rounded-full text-white">
                    <SkipForward size={25} />
                  </button>
                </div>

                <button
                  onClick={toggleRepeat}
                  className={`p-3 rounded-full ${isRepeating ? "bg-[#80CBC4] text-white" : "text-[#00796B]"}`}
                  title="เล่นซ้ำ"
                >
                  <Repeat size={25} />
                </button>
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div className="col-span-1 bg-transparent rounded-2xl">
            <h1 className="text-xl font-semibold text-[#004D40] mb-2">รายการสมาธิ</h1>
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-2 max-h-[500px] overflow-auto">
              {meditationSounds.map((item, index) => {
                const youtubeID = extractYouTubeID(item.sound || "");
                const thumbnail = `https://img.youtube.com/vi/${youtubeID}/0.jpg`;
                return (
                  <div
                    key={index}
                    className={`group gap-2 rounded-lg h-20 cursor-pointer flex transition-all duration-200 mb-2 ${
                      index === currentIndex ? "bg-[#80CBC4]/30" : "hover:bg-[#E0F2F1]/60"
                    }`}
                    onClick={() => playVideo(index)}
                  >
                    <img src={thumbnail} className="w-20 h-full object-cover rounded-l-lg" />
                    <div className="flex flex-col w-[60%] justify-between py-2 px-2">
                      <p className="text-[#004D40] font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-[#00796B] text-sm">
                        <Clock size={16} />
                        <p>{item.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center ml-auto pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("ลบเสียงนี้ออกจากเพลย์ลิสต์");
                        }}
                        className="p-1 text-[#00796B]/50 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playermediameditation;
