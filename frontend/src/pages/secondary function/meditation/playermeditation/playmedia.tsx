
import {
  ChevronLeft,
  Clock,
  Heart,
  Pause,
  Play,
  Eye,
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
import { Sound } from "../../../../interfaces/ISound";
import {
  getSoundsByTypeID,
  
  checkLikedSound,
  likeSound,
  addSoundViewBlock,
} from "../../../../services/https/sounds";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "../../Playlist/Component/starrating";
import { message } from "antd";
import { IReview } from "../../../../interfaces/IReview";
import { CheckReview, CreateReview, UpdateReview } from "../../../../services/https/review";
import { CreateHistory } from "../../../../services/https/history";
import { IHistory } from "../../../../interfaces/IHistory";

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

function Playermediameditation() {
  const { ID } = useParams<{ ID: string }>();
  const soundId = Number(ID);
  const navigate = useNavigate();

  const [meditationSounds, setMeditationSounds] = useState<Sound[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const [volume, setVolume] = useState(100);
  const [_quality, setQuality] = useState("default");

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [hasCountedView, setHasCountedView] = useState(false);

  const uid = Number(localStorage.getItem("id"));

  // ⭐ Review
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [showRating, setShowRating] = useState<boolean>(false);

  const currentSound = meditationSounds.find((s) => s.ID === soundId);

  const [editRating, setEditRating] = useState<boolean>(false);
  const [exitRating, setExitRating] = useState<number>(0);

  const viewTimer = useRef<NodeJS.Timeout | null>(null);
  const repeatRef = useRef(isRepeat);
    

   async function addHistory(sid:number) {
      try {
        const data:IHistory = { sid: sid, uid: Number(uid) }
         await CreateHistory(data)
      }catch (error) {
        console.error('Error sending rating:', error);
       
      }
     
    }

  // เพิ่ม View
  async function addView(sid:number,uid:number) {
    try {
       await addSoundViewBlock(sid,uid)
      fetchMeditation();
    } catch (error) {
      console.error("Error sending view:", error);
    }
  }

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1: return "แย่มาก";
      case 2: return "แย่";
      case 3: return "ปานกลาง";
      case 4: return "ดี";
      case 5: return "ดีเยี่ยม";
      default: return "เลือกคะแนน";
    }
  };

  const handleRatingSubmit = async () => {
    if (currentRating === 0) {
      message.warning("กรุณาเลือกคะแนนก่อนส่ง");
      return;
    }
    const data: IReview = { sid: currentSound?.ID, point: currentRating, uid };
    try {
      if (editRating) {
        updateReview()
        setShowRating(false);
      }else{
           await CreateReview(data)
          //console.log(res);
          message.success(`ให้คะแนน "${currentSound?.name}" ${currentRating} ดาว`);
          setShowRating(false);
      }
    } catch (error) {
      console.error("Error sending rating:", error);
      message.error("เกิดข้อผิดพลาดในการส่งคะแนน");
    }
    setCurrentRating(0);
  };

  // เช็คสถานะ Like
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await checkLikedSound(soundId, uid);
        setIsLiked(res.isLiked);
      } catch (error) {
        console.error("โหลดสถานะหัวใจไม่สำเร็จ:", error);
      }
    };
    if (uid && soundId) fetchLikeStatus();
  }, [soundId, uid]);

  const handleLike = async () => {
    try {
      const res = await likeSound(soundId, uid);
      setIsLiked(res.liked);
    } catch (error) {
      console.error("กดหัวใจไม่สำเร็จ:", error);
    }
  };

  // ดึงเพลงสมาธิ
  async function fetchMeditation() {
    try {
      const res = await getSoundsByTypeID(2);
      setMeditationSounds(res.sounds);
    } catch (error) {
      console.error("Error fetching meditation sounds:", error);
    }
  }

  useEffect(() => {
    fetchMeditation();
  }, [ID]);

  // ดึง VideoId จาก YouTube
  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = currentSound?.sound
    ? getYouTubeVideoId(currentSound.sound)
    : null;

  // โหลด Player
  // const hasCountedViewRef = useRef<{ [key: string]: boolean }>({}); // เก็บตาม videoId

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
        
          if (event.data === YT.PlayerState.PLAYING && !hasCountedView) {
            // เริ่มจับเวลาเพื่อตรวจสอบการนับ View
            if (viewTimer.current) clearTimeout(viewTimer.current);
            viewTimer.current = setTimeout(() => {
              if (playerRef.current) {
                const watchedTime = playerRef.current.getCurrentTime();
                const totalTime = playerRef.current.getDuration();
        
                if (watchedTime >= 30 || watchedTime >= totalTime * 0.1) {
                  const lastViewTime = localStorage.getItem(`view_${uid}_${soundId}`);
                  if (!lastViewTime) {
                    addView(soundId, uid);
                    localStorage.setItem(`view_${uid}_${soundId}`, Date.now().toString());
                    setHasCountedView(true);
                  }
        
                  // ตรวจสอบ History (เว้น 5 นาที)
                  const lastHistoryTime = localStorage.getItem(`history_${uid}_${soundId}`);
                  const now = Date.now();
                  if (!lastHistoryTime || now - parseInt(lastHistoryTime) > 5 * 60 * 1000) {
                    addHistory(soundId);
                    localStorage.setItem(`history_${uid}_${soundId}`, now.toString());
                  }
                }
              }
            }, 30000); // ตรวจหลัง 30 วิ (หรืออาจถึงก่อนด้วย 10%)
          }
        
          if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
            // หยุดจับเวลาถ้าผู้ใช้หยุดหรือวิดีโอจบ
            if (viewTimer.current) {
              clearTimeout(viewTimer.current);
              viewTimer.current = null;
            }
          }
        
          handleStateChange(event);
        },
        onPlaybackQualityChange: (event: any) => {
          setQuality(event.data);
        },
      },
      playerVars: { controls: 1, modestbranding: 1, autoplay: 1 },
    });
  }
}, [videoId]);

function handleStateChange(event: any) {
  setIsPlaying(event.data === 1);

  if (event.data === 0) {
    // วิดีโอจบ
    if (repeatRef.current) {
      playerRef.current.seekTo(0); // กลับไปต้น
      playerRef.current.playVideo(); // เล่นทันที
    } else {
      handleNext();
    }
  }
}
useEffect(() => {
  repeatRef.current = isRepeat;
}, [isRepeat]);


  

  // Update Progress Bar
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

  // Volume
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Control Functions
  const toggleMute = () => {
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handlePlay = () => playerRef.current?.playVideo();
  const handlePause = () => playerRef.current?.pauseVideo();
  const seekBySeconds = (seconds: number) => {
    const newTime = Math.min(
      Math.max(playerRef.current.getCurrentTime() + seconds, 0),
      playerRef.current.getDuration()
    );
    playerRef.current.seekTo(newTime, true);
  };

  const handleNext = () => {
    if (!currentSound) return;
    setHistory((prev) => [...prev, soundId]);
    const currentIndex = meditationSounds.findIndex((s) => s.ID === soundId);
    if (isShuffle) {
      let nextIndex = currentIndex;
      while (meditationSounds.length > 1 && nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * meditationSounds.length);
      }
      navigate(`/audiohome/meditation/play/${meditationSounds[nextIndex]?.ID}`);
    } else {
      const nextSound = meditationSounds[currentIndex + 1];
      if (nextSound) {
        navigate(`/audiohome/meditation/play/${nextSound.ID}`);
      }
    }
  };

  const handlePrev = () => {
    if (history.length === 0) return;
    const lastId = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    navigate(`/audiohome/meditation/play/${lastId}`);
  };

    async function updateReview(){
      const data: IReview = { sid: Number(currentSound?.ID), point: currentRating , uid: Number(uid) };
      try {
        await UpdateReview(data);
        message.success(`แก้ไขคะแนน "${currentSound?.name}" ${currentRating} ดาว`);
    }catch (error) {
        console.error('Error sending rating:', error);
        message.error('เกิดข้อผิดพลาดในการส่งคะแนน กรุณาลองอีกครั้ง');
    }
    }
    async function checkReview(){
      try {
        const result = await CheckReview(Number(uid), Number(currentSound?.ID));
        if (result.exists && typeof result.point === "number") {
          setCurrentRating(result.point);
          setExitRating(result.point);
          setEditRating(true);
      
        }
      } catch (error) {
        console.error('Error sending rating:', error);
    }
  }
  
  function openReview() {
    checkReview();
    setShowRating(true);
  }
  function closeReview() {
    setShowRating(false);
    setCurrentRating(0);
  }

  return (
    <div className="flex flex-col min-h-full items-center bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] 
        dark:bg-bg-gradient-to-b dark:from-background-dark dark:to-background-dark  ">
      <div className="sm:mt-4 px-4 sm:px-10 w-full flex flex-col gap-8 max-w-[1600px] font-ibmthai">
        
        {/* ✅ Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-6 lg:gap-12">
          
          {/* Player */}
          <div className="lg:col-span-2 bg-white/50 dark:bg-box-dark backdrop-blur-md rounded-2xl p-5 shadow-lg flex flex-col">
            <div className="flex gap-4 items-center">
              <button onClick={() => navigate("/audiohome/meditation")}>
                <ChevronLeft size={28} className="text-[#00796B] dark:text-[#07D8C0]" />
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#004D40] dark:text-[#07D8C0] ">
                สมาธิ
              </h1>
            </div>

            {/* ✅ Video Full Size */}
            <div className="w-full mt-4 flex-grow">
              <div className="bg-black rounded-2xl overflow-hidden h-[50vh] sm:h-[60vh]">
                <div ref={playerContainerRef} id="yt-player" className="w-full h-full" />
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4">
              {/* Like + Volume */}
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div
                    onClick={handleLike}
                    className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md cursor-pointer"
                  >
                    <Heart
                      className={`h-5 w-5 ${isLiked ? "text-red-500" : "text-gray-400"}`}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </div>
                  <p className="text-[#004D40] dark:text-[#07D8C0]  text-base sm:text-lg font-medium truncate max-w-[200px] sm:max-w-none">
                    {currentSound?.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} className="p-2 text-[#00796B] dark:text-[#07D8C0]">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 sm:w-28 h-1 bg-[#B2DFDB] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center w-full gap-2 text-xs sm:text-sm">
                <span className="w-8 sm:w-10 dark:text-[#07D8C0]">{formatTime(currentTime)}</span>
                <div
                  className="relative flex-grow h-[4px] bg-[#07D8C0]/30 rounded cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPercent = (clickX / rect.width) * 100;
                    const seekToSeconds = (newPercent / 100) * duration;
                    playerRef.current.seekTo(seekToSeconds, true);
                  }}
                >
                  <div
                    className="absolute h-full bg-[#07D8C0]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="w-8 sm:w-10 dark:text-[#07D8C0]">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center mt-4 gap-2 sm:gap-4 flex-wrap">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full ${isShuffle ? "bg-[#80CBC4] dark:bg-[#07D8C0]/20  dark:text-[#07D8C0] text-white" : "dark:text-text-dark text-[#00796B]"}`}
                >
                  <Shuffle size={18} />
                </button>

                <button onClick={handlePrev} className="p-3 bg-[#80CBC4] dark:bg-[#80CBC4]/20 dark:text-[#07D8C0] text-white rounded-full">
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={() => seekBySeconds(-10)}
                  className="p-2 bg-[#E0F2F1] dark:bg-[#E0F2F1]/20 dark:text-[#07D8C0] rounded-full text-[#00796B]"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => (isPlaying ? handlePause() : handlePlay())}
                  className="p-4 bg-[#4DB6AC] dark:bg-[#80CBC4]/40 dark:text-[#07D8C0] rounded-full text-white"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={() => seekBySeconds(10)}
                  className="p-2 bg-[#E0F2F1] dark:bg-[#E0F2F1]/20 dark:text-[#07D8C0] rounded-full text-[#00796B]"
                >
                  <RotateCw size={16} />
                </button>
                <button onClick={handleNext} className="p-3 bg-[#80CBC4] dark:bg-[#80CBC4]/20 dark:text-[#07D8C0] text-white rounded-full">
                  <SkipForward size={18} />
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-2 rounded-full ${isRepeat ? "bg-[#80CBC4] dark:bg-[#07D8C0]/20  dark:text-[#07D8C0] text-white" : "dark:text-text-dark text-[#00796B]"}`}
                >
                  <Repeat size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Playlist + Review */}
          <div className="lg:col-span-1 bg-white/50 dark:bg-transparent backdrop-blur-md rounded-2xl p-5 shadow-lg flex flex-col">
            <h1 className="text-lg sm:text-xl font-semibold dark:text-[#07D8C0] mb-3">รายการสมาธิ</h1>
            
            {/* Playlist */}
            <div className="bg-white/70 dark:bg-transparent backdrop-blur-md rounded-xl p-3 overflow-auto">
            {!showRating ? (
              <div>

            
              {meditationSounds.map((item) => {
                const youtubeID = getYouTubeVideoId(item.sound || "");
                const thumbnail = `https://img.youtube.com/vi/${youtubeID}/0.jpg`;
                const isCurrent = item.ID === soundId;
                return (
                  <div
                    key={item.ID}
                    onClick={() => {
                      if (!isCurrent) {
                        setHistory((prev) => [...prev, soundId]);
                        navigate(`/audiohome/meditation/play/${item.ID}`);
                      }
                    }}
                    className={`flex items-center gap-3 min-h-16 sm:min-h-20 rounded-lg mb-2 cursor-pointer px-3 sm:px-4
                      ${isCurrent ? "bg-[#80CBC4]/30" : "hover:bg-[#E0F2F1]/60"}`}
                  >
                    <img
                      src={thumbnail}
                      className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg"
                    />
                    <div className="flex flex-col justify-center flex-1 overflow-hidden ">
                      <p className="text-[#004D40] dark:text-[#07D8C0] text-sm sm:text-base font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-text-dark">
                        <Clock size={12} />
                        <span>{item.duration}</span>
                        <Eye size={12} />
                        <span>{item.view}</span>
                        <Heart size={12} />
                        <span>{item.like_sound}</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <div className="flex items-center gap-1 pr-2 whitespace-nowrap">
                        <div className="w-2 h-2 bg-blue-word rounded-full animate-pulse"></div>
                        <span className="text-[10px] sm:text-xs text-blue-word">
                          กำลังเล่น
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
            ) : (
             <div>
               <div className="mt-6">
            
                <div className="relative text-center space-y-1 py-3 rounded-xl bg-white/70 shadow-sm">
                  <h4 className="text-base sm:text-xl font-medium text-basic-text">
                    คุณให้คะแนนบทสวดนี้เท่าไหร่?
                  </h4>
                 

                  <div className="flex justify-center">
                    <StarRating
                      rating={currentRating}
                      onRatingChange={setCurrentRating}
                      size="lg"
                    />
                  </div>

                  <p className="text-sm sm:text-lg font-medium text-text-basic">
                    {getRatingLabel(currentRating)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">{currentRating}/5 ดาว</p>

                  <div className="flex gap-3 justify-center pt-4 flex-wrap">
                    {currentRating > 0 && (
                      <button
                        onClick={closeReview}
                        className="px-4 sm:px-6 py-2 bg-transparent text-red-600 rounded-lg transition-colors"
                      >
                        ยกเลิก
                      </button>
                    )}
                    <button
                      onClick={handleRatingSubmit}
                      disabled={currentRating === 0 || currentRating === exitRating}
                      className="px-4 sm:px-6 py-2 bg-[#07D8C0] text-white rounded-lg disabled:bg-gray-400 transition-colors"
                    >
                      ส่งคะแนน
                    </button>
                  </div>
                </div>
              
            </div>

             </div>
            )}
            </div>

            {/* Review */}
            {!showRating &&(<div className="text-center py-4">
                  <button
                    onClick={() => openReview()}
                    className="px-4 sm:px-6 py-2 bg-[#07D8C0] text-white rounded-lg transition duration-300 hover:scale-105"
                  >
                    รีวิวบทสวด
                  </button>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
export default Playermediameditation;