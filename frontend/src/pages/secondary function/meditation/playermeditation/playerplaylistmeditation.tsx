import {
  ChevronLeft,
  Clock,
  Eye,
  Heart,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addSoundView,
  checkLikedSound,
  likeSound,
} from "../../../../services/https/sounds";

import { CustomSoundPlaylist } from "../../Playlist/Playlist";
import { GetSoundPlaylistByPID } from "../../../../services/https/soundplaylist";
import { IHistory } from "../../../../interfaces/IHistory";
import { CreateHistory } from "../../../../services/https/history";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}


function PlayerPlaylistMeditation() {
  const { id } = useParams<{ id: string }>(); //id sound
  const {pid} = useParams<{ pid: string }>()//id playlist
  const navigate = useNavigate();
  const soundId = Number(id);

  const [soundPlaylist, setSoundPlaylist] = useState<CustomSoundPlaylist[]>([]); //vdo ใน playlist


  const [history, setHistory] = useState<number[]>([]);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const [volume, setVolume] = useState(100);
  const [quality, setQuality] = useState("default");

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const realId = Number(id);
  const uid = Number(localStorage.getItem("id"));
  const [hasCountedView, setHasCountedView] = useState(false); //เอาไว้เพิ่ม view

    async function addHistory(sid:number) {
      try {
        const data:IHistory = { sid: sid, uid: Number(uid) }
         await CreateHistory(data)
      }catch (error) {
        console.error('Error sending rating:', error);
       
      }
     
    }
  
  async function addView(sid:number) {
     try {
        await addSoundView(sid)
     }catch (error) {
       console.error('Error sending rating:', error);
      
     }
    
   }

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await checkLikedSound(Number(realId), uid);
        setIsLiked(res.isLiked);
      } catch (error) {
        console.error("โหลดสถานะหัวใจไม่สำเร็จ:", error);
      }
    };
    if (uid && realId) fetchLikeStatus();
  }, [realId, uid]);

  const handleLike = async () => {
    if (!realId) return;
    try {
      const res = await likeSound(realId, uid);
      setIsLiked(res.liked);
      fetchSoundPlaylist();
    } catch (error) {
      console.error("กดหัวใจไม่สำเร็จ:", error);
    }
  };

  async function fetchSoundPlaylist() {
      try {
        const res = await GetSoundPlaylistByPID(Number(pid));
        setSoundPlaylist(res);
        console.log("sound playlist is: ", res);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    }
  useEffect(() => {
    fetchSoundPlaylist();
  }, [id,pid]);

  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const currentSound = soundPlaylist.find((s) => s.sid === soundId);

  const videoId = currentSound?.sound
    ? getYouTubeVideoId(currentSound.sound)
    : null;

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      loadPlayer();
    }
    window.onYouTubeIframeAPIReady = () => {
      loadPlayer();
    };

    function loadPlayer() {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      playerRef.current = new window.YT.Player("yt-player", {
        height: "360",
        width: "640",
        videoId: videoId || "",
        events: {
          onReady: () => {
            setIsReady(true);
            setDuration(playerRef.current.getDuration());
            playerRef.current.setVolume(volume);

            playerRef.current.playVideo();
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          
            if (event.data === 1 && !hasCountedView) {
              // เริ่มจับเวลา เมื่อวิดีโอเริ่มเล่น
              const checkView = setInterval(() => {
                if (playerRef.current) {
                  const watchedTime = playerRef.current.getCurrentTime();
                  const totalTime = playerRef.current.getDuration();
                  if (watchedTime >= 30 || watchedTime >= totalTime * 0.1) {
                    // นับ view แล้วส่ง API
                    addView(realId);
                    addHistory(realId);
                    setHasCountedView(true);
                    clearInterval(checkView);
                  }
                }
              }, 1000);
            }
          
            handleStateChange(event);
          },
          onPlaybackQualityChange: (event: any) => {
            setQuality(event.data);
          },
        },
        playerVars: {
          controls: 1,
          modestbranding: 1,
          autoplay: 1,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  function handleStateChange(event: any) {
    setIsPlaying(event.data === 1);

    if (event.data === 0) {
      // วิดีโอจบ
      if (isRepeat) {
        playerRef.current.playVideo(); // เล่นซ้ำ
      } else {
        handleNext();
      }
    }
  }

  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        if (dur > 0) {
          setProgress((current / dur) * 100);
          setCurrentTime(current);
          setDuration(dur);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isReady]);

  // ปรับ volume player
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const toggleMute = () => {
    if (playerContainerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted((prev) => !prev);
      } else {
        playerRef.current.mute();
        setIsMuted((prev) => !prev);
      }
    }
  };

  // ปรับ quality player


  const handlePlay = () => playerRef.current?.playVideo();
  const handlePause = () => playerRef.current?.pauseVideo();
//   const handleStop = () => playerRef.current?.stopVideo();

  const handleSeek = (percent: number) => {
    if (!playerRef.current) return;
    const seekToSeconds = (percent / 100) * playerRef.current.getDuration();
    playerRef.current.seekTo(seekToSeconds, true);
  };

  const seekBySeconds = (seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.min(
      Math.max(playerRef.current.getCurrentTime() + seconds, 0),
      playerRef.current.getDuration()
    );
    playerRef.current.seekTo(newTime, true);
  };

  const onProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = (clickX / rect.width) * 100;
    handleSeek(newPercent);
  };

  const handleNext = () => {
    if (!currentSound) return;

    setHistory((prev) => [...prev, soundId]);

    const currentIndex = soundPlaylist.findIndex((s) => s.sid === soundId);

    if (isShuffle) {
      let nextIndex = currentIndex;
      while (soundPlaylist.length > 1 && nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * soundPlaylist.length);
      }
      const nextId = soundPlaylist[nextIndex]?.sid;
      if (nextId) navigate(`/audiohome/meditation/playlist/play/${pid}/${nextId}`);
    } else {
      const nextSound = soundPlaylist[currentIndex + 1];
      if (nextSound) {
        console.log("next sound is : ", nextSound.sid);
        navigate(`/audiohome/meditation/playlist/play/${pid}/${nextSound.sid}`);
      } else {
        console.log("next sound is : ", nextSound);
        const firstSound = soundPlaylist[0];
        if (firstSound) {
          navigate(`/audiohome/meditation/playlist/play/${pid}/${firstSound.sid}`);
        }
    }
    }
  };

  const handlePrev = () => {
    if (history.length === 0) return;
    const lastId = history[history.length - 1];
    setHistory((h) => h.slice(0, h.length - 1));
    navigate(`/audiohome/meditation/play/${lastId}`);
  };

  return (
    <div className="flex flex-col min-h-full overflow-y-auto scrollbar-hide duration-300 items-center bg-background-blue dark:bg-background-dark ">
      <div className="sm:mt-4   sm:w-[100%] lg:w-[95%] w-full flex-1 flex-col gap-6 dark:border-stoke-dark 
      dark:bg-box-dark duration-300 bg-transparent md:rounded-xl font-ibmthai">
        {/* Grid Layout - ปรับให้ responsive ดีขึ้น */}
        <div className="grid grid-cols-1 md:grid-cols-3  w-full lg:gap-8 gap-2   h-[88vh]">
          {/* Main Player Section */}
          <div className="sm:col-span-2 sm:rounded-2xl flex flex-col h-full gap-4 px-4 py-4 bg-white/50  justify-between backdrop-blur-md shadow-md
          dark:bg-box-dark dark:text-text-dark">
            {/* Header */}
            <div className="flex gap-4 items-center">
                <button onClick={() => navigate('/audiohome/meditation')}>
                      <ChevronLeft size={32} className="text-button-blue" />
                </button>
            
              <h1 className="text-lg lg:text-xl font-semibold">สมาธิ</h1>
            </div>

            {/* Video Container - ปรับขนาดให้เหมาะสม */}
            <div
              ref={playerContainerRef}
              id="yt-player"
              className="w-full rounded-2xl  flex-1 min-h-[200px] md: lg:min-h-[300px] lg:max-h-[calc(100vh - 280px)] h-[300px]"
            ></div>

            {/* Controls Section */}
            <div className="space-y-4">
              {/* Title and Volume Controls */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    onClick={handleLike}
                    className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md hover:scale-105 duration-300 cursor-pointer"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isLiked ? "text-red-500" : "text-gray-400"
                      }`}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </div>
                  <p className="text-basic-text text-sm lg:text-lg truncate max-w-[200px] lg:max-w-none">
                    {currentSound?.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-button-blue dark:text-blue-word transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-16 lg:w-20 h-1 bg-[#C8F3FD] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center w-full gap-2 lg:gap-4">
                <span className="text-xs lg:text-sm w-10 lg:w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <div
                  onClick={onProgressBarClick}
                  className="relative flex-grow h-[4px] lg:h-[5px] bg-[#C8F3FD] dark:bg-midnight-blue/20 cursor-pointer rounded-[5px] overflow-hidden"
                >
                  <div
                    className="absolute h-full bg-[#5DE2FF] transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-xs lg:text-sm w-10 lg:w-12">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons - ปรับขนาดให้เหมาะกับมือถือ */}
              <div className="flex items-center justify-center">
                {/* Shuffle Button */}
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 lg:p-3 rounded-full transition-colors duration-300 ${
                    isShuffle
                      ? "bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] dark:bg-bg-gradient-to-tl dark:from-midnight-blue/40 dark:to-midnight-blue/40 text-black"
                      : "bg-transparent"
                  }`}
                  title="สุ่มเล่น"
                >
                  <Shuffle
                    size={20}
                    className={`transition-all duration-300 ${
                      isShuffle ? "text-white dark:text-blue-word " : "text-button-blue dark:text-text-dark"
                    }`}
                  />
                </button>

                {/* Main Control Group */}
                <div className="flex items-center gap-2 lg:gap-4 mx-4">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrev}
                    disabled={history.length === 0}
                    className="p-2 lg:p-3 bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] hover:bg-white rounded-full transition-all duration-200 text-white
                    dark:bg-gradient-to-tl dark:from-midnight-blue/70 dark:to-midnight-blue/70 "
                    title="เพลงก่อนหน้า"
                  >
                    <SkipBack size={20} />
                  </button>

                  {/* Rewind Button */}
                  <button
                    onClick={() => seekBySeconds(-10)}
                    disabled={!isReady}
                    className="p-1.5 lg:p-2 bg-background-button rounded-full transition-all duration-200 text-button-blue
                     dark:text-blue-word dark:bg-midnight-blue/20"
                    title="ย้อนหลัง 10 วินาที"
                  >
                    <RotateCcw size={16} />
                  </button>

                  {/* Play/Pause Button */}
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        handlePause();
                      } else {
                        handlePlay();
                      }
                    }}
                    className="p-3 lg:p-4 bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] rounded-full transition-all duration-200 text-white
                   dark:bg-gradient-to-tl dark:from-midnight-blue/70 dark:to-midnight-blue/70  "
                    title={isPlaying ? "หยุดเล่น" : "เล่น"}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  {/* Fast Forward Button */}
                  <button
                    onClick={() => seekBySeconds(10)}
                    disabled={!isReady}
                    className="p-1.5 lg:p-2 bg-background-button rounded-full transition-all duration-200 text-button-blue
                    dark:text-blue-word dark:bg-midnight-blue/20"
                    title="เดินหน้า 10 วินาที"
                  >
                    <RotateCw size={16} />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    
                    className="p-2 lg:p-3 bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] rounded-full transition-all duration-200 text-white
                    dark:bg-gradient-to-tl dark:from-midnight-blue/70 dark:to-midnight-blue/70 "
                    title="เพลงถัดไป"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* Repeat Button */}
                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-2 lg:p-3 rounded-full transition-all duration-200 ${
                    isRepeat
                      ? "bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF] dark:bg-bg-gradient-to-tl dark:from-midnight-blue/40 dark:to-midnight-blue/40 "
                      : "text-button-blue "
                  }`}
                  title="เล่นซ้ำ"
                >
                  <Repeat size={20}
                   className={`transition-all duration-300 ${
                    isRepeat ? "text-white dark:text-blue-word " : "text-button-blue dark:text-text-dark"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Playlist Section - ปรับให้เหมาะกับหน้าจอเล็ก */}
          <div className="bg-transparent rounded-2xl col-span-1">
            <div className="flex gap-4 items-center mb-4">
              <h1 className="text-lg lg:text-xl font-semibold text-basic-text dark:text-text-dark">รายการเสียง</h1>
            </div>

            <div className="bg-white/10 dark:bg-transparent backdrop-blur-lg rounded-xl  flex flex-col">
              <div className="space-y-2 sm:h-[570px] h-[250px] overflow-auto scrollbar-hide p-2">
                {soundPlaylist.map((item) => {
                  const youtubeID = getYouTubeVideoId(item.sound || "");
                  const thumbnail = `https://img.youtube.com/vi/${youtubeID}/0.jpg`;
                  const isCurrent = item.sid === soundId;

                
                  

                  return (
                    <div
                      key={item.ID}
                      className={`group gap-2 rounded-lg h-16 lg:h-20 cursor-pointer transition-all duration-200 flex ${
                        isCurrent
                          ? "bg-background-button border border-blue-word dark:bg-midnight-blue/40 "
                          : "bg-white dark:bg-transparent hover:bg-white/10 "
                      }`}
                      onClick={() => {
                        if (!isCurrent) {
                          setHistory((prev) => [...prev, soundId]); // เก็บ id ปัจจุบัน
                          navigate(`/audiohome/meditation/playlist/play/${pid}/${item.sid}`);
                        }
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={thumbnail}
                          alt={item.name}
                          className="w-16 lg:w-20 h-full object-cover rounded-l-lg border"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-2 pr-2 ">
                        <div>
                          <p className="text-black font-medium text-sm lg:text-base truncate dark:text-text-dark">
                            {item.name}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600 truncate dark:text-text-dark">
                            {item.owner}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-text-dark">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span className="hidden sm:inline">
                              {item.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span className="hidden lg:inline">
                              {item.view}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={12} />
                            <span>{item.like_sound}</span>
                          </div>
                        </div>
                      </div>

                      {/* Playing Indicator */}
                      {isCurrent && (
                        <div className="flex items-center gap-1 pr-2">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-word rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-word hidden lg:inline">
                            กำลังเล่น
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PlayerPlaylistMeditation;
