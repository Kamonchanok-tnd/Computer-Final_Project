import { Eye, Heart, Play } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";
import { useState, useEffect } from "react";
import { likeSound, checkLikedSound } from "../../../../services/https/sounds"; // ✅ ใช้เหมือน BreathingCard
import { useNavigate } from "react-router-dom";
interface MeditationContentProps {
  filteredSounds: Sound[];
  extractYouTubeID: (url: string) => string | null;
}

function MeditationContent({
  filteredSounds,
  extractYouTubeID,
}: MeditationContentProps) {
  const uid = Number(localStorage.getItem("id"));

  return (
    <div>
      <h1 className="text-xl text-basic-text mb-4">นั่งสมาธิ</h1>
      <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
        {filteredSounds?.map((sound) => {
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
    <div className="bg-white w-full h-60 rounded-xl border border-gray-200">
      <div className="h-[70%] w-full rounded-t-xl relative">
        <img
          src={thumbnail}
          alt={sound.name}
          className="w-full h-full object-center rounded-t-xl"
        />

        {/* ปุ่ม Play */}
        <div
        className="absolute bottom-[-20px] right-3 w-12 h-12 bg-button-blue flex items-center hover:scale-105 duration-300 justify-center rounded-full shadow-sm cursor-pointer"
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
        <div className="text-basic-text w-[70%] line-clamp-1">
          <h1>{sound.name}</h1>
        </div>
        <div className="flex justify-between text-subtitle">
          <p>{sound.duration} min</p>
          <div className="flex gap-2">
            <div className="flex gap-1 items-center">
              <Eye className="text-subtitle h-4 w-4" />
              <p>{sound.view}</p>
            </div>
            <div className="flex gap-1 items-center">
              <Heart className="text-subtitle h-4 w-4 text-red-500" fill="currentColor" />
              <p>{likes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeditationContent;
