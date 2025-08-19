import { Eye, Heart, Play } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";
import { use, useEffect, useState } from "react";
import { checkLikedSound, likeSound } from "../../../../services/https/sounds";

interface ChantingContentProps {
    filteredSounds: Sound[];
    extractYouTubeID: (url: string) => string | null;
    gotoSound: (id: number) => void
    
}




function ChantingContent({filteredSounds, extractYouTubeID,gotoSound}: ChantingContentProps) {
    return  (
        <div className="font-ibmthai">
        <h1 className="text-xl  text-basic-text mb-4 dark:text-text-dark  ">สวดมนต์</h1>
        <div className="grid lg:grid-cols-6 sm:grid-cols-3 md:grid-cols-4 grid-cols-1 sm:gap-2 gap-2  px-4 sm:px-0">
          {filteredSounds?.map((sound) => {
            const videoId = extractYouTubeID(sound.sound!);
            const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            const realId = sound.ID ?? (sound as any).ID;
            const uid = Number(localStorage.getItem("id"));
            const [isLiked, setIsLiked] = useState(false);
            const [likes, setLikes] = useState(sound.like_sound || 0);
            useEffect(() => {
       
              if (uid && realId) fetchLikeStatus();
            }, [realId, uid]);

            const fetchLikeStatus = async () => {
              try {
                const res = await checkLikedSound(realId, uid);
                setIsLiked(res.isLiked);
              } catch (error) {
                console.error("โหลดสถานะหัวใจไม่สำเร็จ:", error);
              }
            };
            const handleLike = async () => {
                if (!realId) return;
                try {
                  const res = await likeSound(realId, uid); 
                  setLikes(res.like_count);
                  setIsLiked(res.liked);
                } catch (error) {
                  console.error("กดหัวใจไม่สำเร็จ:", error);
                }
              };
            return (
              <div
                key={sound.ID}
                className="bg-white w-full h-fit rounded-xl group  text-basic-text border-gray-200 border 
                dark:text-text-dark dark:bg-transparent dark:border-stoke-dark "
              >
                <div className="h-auto  w-full rounded-2xl relative ">
                  <img
                    src={thumbnail}
                    alt=""
                    className="w-full h-full object-center rounded-t-xl"
                  />

                  <button onClick={() => gotoSound(Number(sound.ID))} className="absolute bottom-[-25px] sm:button-[-20]  right-3 w-15 sm:w-12 sm:h-12 h-15 bg-button-blue flex items-center justify-center rounded-full shadow-lg text-white
             opacity-100 sm:opacity-0 scale-75 translate-y-1
             group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
             transition-all duration-300 ease-out btn-glow-play">
                    <Play className="text-white" />
                  </button>
                  <div
                  onClick={handleLike}
                  className="absolute top-3 right-3 w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md hover:scale-105 duration-300 cursor-pointer"
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 ${isLiked ? "text-red-500" : "text-gray-400"}`}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </div>
                </div>
                <div className="p-2 space-y-2">
                  <div className="text-basic-text dark:text-text-dark  w-[70%] line-clamp-1">
                    <h1>{sound.name}</h1>
                  </div>
                  <div className="flex justify-between text-subtitle dark:text-text-dark" >
                    <p>{sound.duration} min</p>
                    <div className="flex gap-2">
                      <div className="flex gap-1 items-center">
                        <Eye className="text-subtitle h-4 w-4 dark:text-text-dark " />
                        <p>{sound.view}</p>
                      </div>
                      <div className="flex gap-1 items-center">
                        <Heart className="text-subtitle h-4 w-4 dark:text-text-dark  " />
                        <p>{likes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
}
export default ChantingContent


