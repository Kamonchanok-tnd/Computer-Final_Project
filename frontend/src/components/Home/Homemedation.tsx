import { useEffect, useState } from "react";
import { Sound } from "../../interfaces/ISound";
import { getMeditationSounds } from "../../services/https/meditation";
import { getBreathingSounds } from "../../services/https/breathing";
import BreathingCard from "../../pages/secondary function/breathing/components/breathingcontent";
// import MeditationContent from "../../pages/secondary function/meditation/components/MeditationContent";
import { Eye, Heart, Play } from "lucide-react";
import { formatDurationHMS } from "../../pages/admin/meditation/editSound";
import { useNavigate } from "react-router-dom";
import { checkLikedSound, likeSound } from "../../services/https/sounds";

function HomeMeditation() {
  // const storedUid = localStorage.getItem("id");
  const [meditationSound, setMeditationSound] = useState<Sound[]>([]);
  const [breathingSounds, setBreathingSounds] = useState<Sound[]>([]);
  const uid = Number(localStorage.getItem("id"));
  const navigate = useNavigate();

  async function fetchMeditation(userId: number) {
    try {
      const res = await getMeditationSounds(userId);
      const firstSound = res.sounds?.slice(0, 3) || null; // เอาแค่ตัวแรก
      setMeditationSound(firstSound);
      // console.log("meditationSounds:", res.sounds);
    } catch (error) {
      console.error("Error fetching meditation sounds:", error);
    }
  }

  async function fetchBreathing(userId: number) {
    try {
      const res = await getBreathingSounds(userId);
      const firstThreeSounds = res.sounds?.slice(0, 2) || []; // เอาแค่ 3 ตัวแรก
      setBreathingSounds(firstThreeSounds);
    } catch (error) {
      console.error("Error fetching breathing sounds:", error);
    }
  }

  useEffect(() => {
    const storedUid = localStorage.getItem("id");
    if (storedUid) {
      fetchMeditation(Number(storedUid));
      fetchBreathing(Number(storedUid));
    }
  }, []);
  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className=" font-ibmthai ">
      <div className=" xl:px-28 px-2">
        <div className="flex items-center justify-between  px-2">
          <p className="font-ibmthai text-2xl">สมาธิบำบัดและฝึกลมหายใจ</p>
        </div>
        <div className="grid grid-cols-4 mt-4">
          <div className="col-span-2 ">
            <div className="grid grid-cols-2 gap-4 p-2">
              {breathingSounds.map((sound, index) => (
                <div key={index} className="">
                  <BreathingCard key={sound.ID} sound={sound} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 ">
            <div className="grid grid-cols-3  gap-4 p-2">
              {meditationSound.map((sound) => {
                const videoId = extractYouTubeID(sound.sound || "");
                if (!videoId) return null;
                const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

                return (
                  <MeditationCard
                    key={sound.ID}
                    sound={sound}
                    thumbnail={thumbnail}
                    uid={uid}
                  />
                );
              })}
            </div>
            <div className="w-full flex justify-center">
             <button className="bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white font-bold py-2 px-8 rounded-full mt-4 transition-all duration-300 
            cursor-pointer  hover:scale-110 "
            onClick={() => navigate("/audiohome/meditation")}>เริ่มเลย</button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

interface MeditationCardProps {
  sound: Sound;
  thumbnail: string;
  uid: number;
}

function MeditationCard({ sound, thumbnail, uid }: MeditationCardProps) {
  const [likes, setLikes] = useState(sound.like_sound || 0);
  const [isLiked, setIsLiked] = useState(false);
  const realId = sound.ID ?? (sound as any).ID;

  // ✅ โหลดสถานะ isLiked จาก backend
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await checkLikedSound(realId, uid);
        setIsLiked(res.isLiked);
      } catch (error) {
        console.error("โหลดสถานะหัวใจไม่สำเร็จ:", error);
      }
    };
    if (uid && realId) fetchLikeStatus();
  }, [realId, uid]);

  // ✅ ฟังก์ชันกดหัวใจ toggle
  const handleLike = async () => {
    if (!realId) return;
    try {
      const res = await likeSound(realId, uid); // ✅ backend ส่ง { like_count, liked }
      setLikes(res.like_count);
      setIsLiked(res.liked);
    } catch (error) {
      console.error("กดหัวใจไม่สำเร็จ:", error);
    }
  };
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate(`/audiohome/meditation/play/${sound.ID}`);
  };

  return (
    <div
      className="bg-white w-full h-fit rounded-xl group  text-basic-text border-gray-200 border 
                  dark:text-text-dark dark:bg-transparent dark:border-stoke-dark"
    >
      <div className="h-auto  w-full rounded-2xl relative">
        <img
          src={thumbnail}
          alt={sound.name}
          className="w-full h-full object-center rounded-t-xl"
        />
        

        {/* ปุ่ม Play */}
        <div
          className="absolute bottom-[-25px] sm:button-[-20]  right-3 w-15 sm:w-12 sm:h-12 h-15 bg-button-blue flex items-center justify-center rounded-full shadow-lg text-white
               opacity-100 sm:opacity-0 scale-75 translate-y-1
               group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
               transition-all duration-300 ease-out btn-glow-play"
          onClick={handlePlayClick}
        >
          <Play className="text-white" />
        </div>

        {/* ✅ หัวใจพื้นหลังวงกลมสีขาว + toggle */}
        <div
          onClick={handleLike}
          className="absolute top-3 right-3 w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md hover:scale-105 duration-300 cursor-pointer"
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "text-red-500" : "text-gray-400"}`}
            fill={isLiked ? "currentColor" : "none"}
          />
        </div>
      </div>

      <div className="p-2 space-y-2">
        <div className="text-basic-text dark:text-text-dark  w-[70%] line-clamp-1">
          <h1>{sound.name}</h1>
          
        </div>
        <div className="flex justify-between text-subtitle dark:text-text-dark">
          <p>{formatDurationHMS(sound.duration ?? 0)} </p>
          <div className="flex gap-2">
            <div className="flex gap-1 items-center">
              <Eye className="text-subtitle h-4 w-4 dark:text-text-dark " />
              <p>{sound.view}</p>
            </div>
            <div className="flex gap-1 items-center">
              <Heart className="text-subtitle h-4 w-4 dark:text-text-dark  " />
              <p>{likes}</p>
              {/* <p>คำแนะนำ: {sound.description  || "ไม่มีคำแนะนำ"}</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeMeditation;
