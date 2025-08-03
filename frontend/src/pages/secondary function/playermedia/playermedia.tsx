import {
  ChevronLeft,
  Clock,
  Eye,
  Heart,
  List,
  Pause,
  Play,
  PlayCircle,
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
import { Sound } from "../../../interfaces/ISound";
import {
  getSoundByID,
  getSoundsByTypeID,
} from "../../../services/https/sounds";
import { useParams } from "react-router-dom";
import "./playmedia.css";
import { IMG_URL } from "../../../services/https/playlist";

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
function Playermedia() {
  const params = useParams();
  const p_id = params.id;
  const [currentSound, setCurrentSound] = useState<Sound | null>(null); //vdo ปัจจุบัน
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]); //vdo ทั้งหมด
  const [currentIndex, setCurrentIndex] = useState<number>(0);
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
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const playerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchSound(id: number) {
    try {
      const res = await getSoundByID(id);
      console.log("sound is: ", res.data);
      setCurrentSound(res.data);
    } catch (error) {
      console.error("Error fetching sound:", error);
    }
  }

  async function fetchChanting() {
    try {
      const res = await getSoundsByTypeID(3);

      setChantingSounds(res.sounds); // สำคัญ! ต้องใช้ res.sounds ตามโครงสร้าง
    } catch (error) {
      console.error("Error fetching chanting sounds:", error);
    }
  }

  useEffect(() => {
    if (p_id) {
      fetchSound(Number(p_id));
      fetchChanting();
    }
  }, [p_id]);

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const videoId = extractYouTubeID(currentSound?.sound || "");

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
    if (isApiReady && playerRef.current && !player) {
      const currentVideoId = getVideoId(chantingSounds[currentIndex]);
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: "350",
        width: "100%",
        videoId: currentVideoId || "dQw4w9WgXcQ",
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            // รอให้ metadata โหลดเสร็จก่อนอัปเดต duration
            setTimeout(() => {
              const duration = event.target.getDuration();
              setPlayerState((prev) => ({
                ...prev,
                duration: duration || 0,
                volume: event.target.getVolume(),
              }));
            }, 1000);
            updateVideoTitle(event.target);
          },
          onStateChange: (event: any) => {
            const currentState = event.data;
            setPlayerState((prev) => ({
              ...prev,
              isPlaying: currentState === window.YT.PlayerState.PLAYING,
            }));

            // อัปเดต duration เมื่อเริ่มเล่น
            if (currentState === window.YT.PlayerState.PLAYING) {
              const duration = event.target.getDuration();
              if (duration && duration > 0) {
                setPlayerState((prev) => ({
                  ...prev,
                  duration: duration,
                }));
              }
            }

            // Auto play next video when current video ends
            if (currentState === window.YT.PlayerState.ENDED) {
              console.log(
                "Video ended. Repeat:",
                isRepeating,
                "AutoPlay:",
                isAutoPlay
              );

              if (isRepeating) {
                // เล่นวิดีโอเดิมซ้ำ
                setTimeout(() => {
                  event.target.seekTo(0);
                  event.target.playVideo();
                }, 500);
              } else if (isAutoPlay) {
                // เล่นวิดีโอถัดไปอัตโนมัติ
                setTimeout(() => {
                  playNext();
                }, 1000);
              }
              // ถ้าไม่เปิด autoplay จะหยุดเล่น
            }
          },
        },
      });
    }
  }, [isApiReady, chantingSounds, currentIndex]);

  const removeFromPlaylist = (index: number) => {
    if (chantingSounds.length <= 1) {
      alert("ต้องมีวิดีโออย่างน้อย 1 เรื่องใน playlist");
      return;
    }

    const newPlaylist = chantingSounds.filter((_, i) => i !== index);
    setChantingSounds(newPlaylist);

    if (index === currentIndex) {
      setCurrentIndex(0);
      const firstVideoId = getVideoId(newPlaylist[0]);
      if (player && firstVideoId) {
        player.loadVideoById(firstVideoId);
      }
    } else if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const playVideo = (index: number) => {
    setCurrentIndex(index);
    const videoId = getVideoId(chantingSounds[index]);

    if (player && videoId) {
      player.loadVideoById(videoId);
      setPlayerState((prev) => ({
        ...prev,
        currentTime: 0,
        duration: 0, // รีเซ็ต duration เพื่อรอให้โหลดใหม่
      }));
      setTimeout(() => {
        updateVideoTitle(player);
        // อัปเดต duration ใหม่
        const newDuration = player.getDuration();
        if (newDuration && newDuration > 0) {
          setPlayerState((prev) => ({
            ...prev,
            duration: newDuration,
          }));
        }
        // เล่นวิดีโอทันทีหลังจากโหลดเสร็จ
        player.playVideo();
      }, 1500); // เพิ่มเวลารอให้โหลดเสร็จ
    }
  };
  const updateVideoTitle = (playerInstance: any) => {
    try {
      const title =
        playerInstance.getVideoData()?.title ||
        chantingSounds[currentIndex]?.name ||
        "Unknown Title";
      setVideoTitle(title);
    } catch (error) {
      setVideoTitle(chantingSounds[currentIndex]?.name || "Unknown Title");
    }
  };
  const playNext = () => {
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * chantingSounds.length);
    } else {
      nextIndex = (currentIndex + 1) % chantingSounds.length;
    }
    playVideo(nextIndex);
  };
  const playPrevious = () => {
    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * chantingSounds.length);
    } else {
      prevIndex =
        currentIndex === 0 ? chantingSounds.length - 1 : currentIndex - 1;
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
      const newTime = Math.min(
        playerState.duration,
        playerState.currentTime + 10
      );
      player.seekTo(newTime);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-full duration-300 items-center bg-background-blue dark:bg-background-dark">
      <div
        className={`sm:mt-2  px:2  px-1 sm:px-8 sm:w-[95%] w-full  flex flex-col gap-8 dark:border-stoke-dark dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] duration-300
             bg-transparent  sm:rounded-xl`}
      >
        <div className="grid grid-cols-3 w-full h-full gap-12">
          {/* player media */}

          <div className="col-span-2 bg-b rounded-2xl flex flex-col ">
            <div className="flex gap-4 items-center ">
              <ChevronLeft size={40} className="text-button-blue" />
              <h1 className="text-xl font-semibold ">สวดมนต์</h1>
            </div>
            {/* vdo */}
            <div className="w-full  bg-tranparent  ">
              <div className="bg-black rounded-2xl overflow-hidden  mb-6">
                <div ref={playerRef} className="w-full aspect-video" />
              </div>
            </div>

            {/* controll */}
            <div className="   rounded-2xl  px-4 ">
              {/* Progress Bar */}
             
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Heart className="text-basic-text"/> 
                  </div>
                
                 <p className="text-basic-text text-lg">{videoTitle}</p>
              </div> 
                
              
              <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-button-blue  transition-colors"
                  >
                    {playerState.isMuted ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={playerState.volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-[#C8F3FD] rounded-lg appearance-none cursor-pointer "
                  />

                </div>
              </div>
             
              <div className="mb-6">
                <div className="flex justify-between text-black text-sm mb-2">
                  <span>{formatTime(playerState.currentTime)}</span>
                  <span>{formatTime(playerState.duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={playerState.duration > 0 ? playerState.duration : 100}
                  value={playerState.currentTime}
                  onChange={handleSeek}
                  className="audio-progress-slider w-full h-2 bg-white/20 rounded-lg   appearance-none cursor-pointer "
                  style={{
                    background:
                      playerState.duration > 0
                        ? `linear-gradient(to right, #5DE2FF 0%, #C8F3FD ${
                            (playerState.currentTime / playerState.duration) *
                            100
                          }%, #C8F3FD ${
                            (playerState.currentTime / playerState.duration) *
                            100
                          }%, #C8F3FD 100%)`
                        : "rgba(255,255,255,0.2)",
                  }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between ">
                
                  {/* <button
                    onClick={toggleAutoPlay}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isAutoPlay
                        ? "bg-green-500 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    title="เล่นต่อเนื่อง"
                  >
                    <PlayCircle size={18} />
                  </button> */}
                
                  <button
                    onClick={toggleShuffle}
                    className={`p-3 rounded-full transition-colors duration-300   ${
                      isShuffled
                        ? "bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] text-black"
                        : "bg-transparent "
                    }`}
                    title="สุ่มเล่น"
                  >
                    <Shuffle
                      size={25}
                      className={`transition-all duration-300 ${
                        isShuffled ? "text-white" : "text-button-blue"
                      } `}
                    />
                  </button>

                  <div className="flex items-center gap-4 ">
                    <button
                      onClick={playPrevious}
                      className="p-3 bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] hover:bg-white rounded-full transition-all duration-200 text-white"
                      title="เพลงก่อนหน้า"
                    >
                      <SkipBack size={25} />
                    </button>

                    <button
                      onClick={seekBackward}
                      className="p-2 bg-background-button rounded-full transition-all duration-200 text-button-blue"
                      title="ย้อนหลัง 10 วินาที"
                    >
                      <RotateCcw size={18} />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="p-4 bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] rounded-full transition-all duration-200 text-white "
                      title={playerState.isPlaying ? "หยุดเล่น" : "เล่น"}
                    >
                      {playerState.isPlaying ? (
                        <Pause size={30} />
                      ) : (
                        <Play size={30} />
                      )}
                    </button>

                    <button
                      onClick={seekForward}
                      className="p-2 bg-background-button rounded-full transition-all duration-200 text-button-blue"
                      title="เดินหน้า 10 วินาที"
                    >
                      <RotateCw size={18} />
                    </button>

                    <button
                      onClick={playNext}
                      className="p-3 bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] rounded-full transition-all duration-200 text-white"
                      title="เพลงถัดไป"
                    >
                      <SkipForward size={25} />
                    </button>
                  </div>

                  <button
                    onClick={toggleRepeat}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isRepeating
                        ? "bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] text-white"
                        : " text-button-blue"
                    }`}
                    title="เล่นซ้ำ"
                  >
                    <Repeat size={25} />
                  </button>
                

               

              </div>
            </div>
          </div>
          {/* listsound */}
          <div className="col-span-1 bg-transparent rounded-2xl">
            <div className="flex gap-4 items-center">
              <h1 className="text-xl font-semibold">รายการเสียง</h1>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl  border border-white/20 h-full">
              

              <div
                className={`space-y-2 max-h-96 overflow-auto scrollbar-hide  ${
                  showPlaylist ? "block" : "hidden lg:block"
                }`}
              >
                {chantingSounds.map((item, index) =>{
                  const youtubeID = extractYouTubeID(item.sound || "");
                  const thumbnail = `https://img.youtube.com/vi/${youtubeID}/0.jpg`;
                  return(
                  <div
                    key={index}
                    className={`group gap-2 rounded-lg h-20  cursor-pointer transition-all duration-200 flex   ${
                      index === currentIndex
                        ? "bg-background-button  border-1 border-blue-word"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                    }`}
                    onClick={() => playVideo(index)}
                  >
                    <div>
                      <img
                        src={thumbnail}
                        className="w-20 h-full object-cover rounded-l-lg border"
                      />
                    </div>
                    <div className="flex flex-col w-[50%] justify-between py-2   ">
                      <div>
                           <p className="text-black font-medium truncate">
                            {item.name}
                          </p>
                          <p>{item.owner}</p>
                      </div>
                   
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <p>{item.duration}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Eye size={16} />
                            <p>{item.like_sound}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart size={16} />
                          <p>{item.like_sound}</p>
                        </div>
                      </div>
                      
                      
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {index === currentIndex && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-word rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-word">
                            กำลังเล่น
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPlaylist(index);
                        }}
                        className="p-1 text-white/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )})}
              </div>

              {/* Playlist Controls */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-1 ${
                        isAutoPlay ? "text-green-400 font-semibold" : ""
                      }`}
                    >
                      <PlayCircle size={14} />
                      ต่อเนื่อง {isAutoPlay ? "เปิด" : "ปิด"}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        isShuffled ? "text-pink-400 font-semibold" : ""
                      }`}
                    >
                      <Shuffle size={14} />
                      สุ่ม {isShuffled ? "เปิด" : "ปิด"}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        isRepeating ? "text-purple-400 font-semibold" : ""
                      }`}
                    >
                      <Repeat size={14} />
                      ซ้ำ {isRepeating ? "เปิด" : "ปิด"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playermedia;
