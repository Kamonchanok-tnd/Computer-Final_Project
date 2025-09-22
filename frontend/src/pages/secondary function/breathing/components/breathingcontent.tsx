import { Play, Heart, Clock } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { likeSound, checkLikedSound, addSoundView } from "../../../../services/https/sounds"; // ✅ import addSoundView
import { CreateHistory } from "../../../../services/https/history";
import TimeSettingModal from "./TimeSettingModal";
interface BreathingCardProps {
  sound: Sound;
}

function BreathingCard({ sound }: BreathingCardProps) {
  const navigate = useNavigate();

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("05");
  const [seconds, setSeconds] = useState("00");

  const isTimeZero =
    parseInt(hours) === 0 &&
    parseInt(minutes) === 0 &&
    parseInt(seconds) === 0;

  const [_likes, setLikes] = useState(sound.like_sound || 0);
  const [isLiked, setIsLiked] = useState(false);

  const realId = sound.ID ?? (sound as any).ID;
  const uid = Number(localStorage.getItem("id"));
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);


  // ✅ โหลดสถานะ isLiked
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

  

  // ✅ เรียกตอนกด Start
  const handleStart = async (h: number, m: number, s: number) => {
    if (!realId) return;
  
    try {
      await addSoundView(realId);
      await CreateHistory({ uid, sid: realId });
      //console.log("View and history created successfully");
    } catch (err) {
      console.error("ไม่สามารถบันทึก view/history:", err);
    }
  
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
  
    navigate("/audiohome/breath-in", {
      state: {
        customTime: `${hh}:${mm}:${ss}`,
        videoUrl: sound.sound,
      },
    });
  };
  





  return (
    <div className="bg-gradient-to-tl from-[#C2F4FF]  to-[#5FE2FF] hover:to-[#2BD9FF] dark:hover:to-transparent duration-300 transition-colors  w-full rounded-3xl shadow-sm flex flex-col mt-2 min-h-[250px] 
    dark:text-text-dark font-ibmthai dark:bg-bg-gradient-to-t dark:from-chat-dark dark:to-chat-dark/20 dark:backdrop:blur-lg
    dark:border dark:border-stoke-dark">
      {/* รูป + หัวใจ */}
      <div className="w-full rounded-t-xl relative">
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

      {/* เนื้อหา */}
      <div className="p-4 flex flex-col flex-1  ">
        <div>
          <h1 className="text-xl font-semibold text-basic-text truncate dark:text-text-dark ">
            {sound.name}
          </h1>
          <p className="text-subtitle text-sm break-words line-clamp-2 dark:text-text-dark mt-4">
            {sound.description}
          </p>

          <div className="flex items-center gap-2 justify-between">
            <p className="text-subtitle text-sm break-words line-clamp-3 mt-2 dark:text-text-dark">
            ผู้จัดทำ: {sound.owner}
          </p>
          <button className="flex  gap-2 text-subtitle text-sm dark:text-background-dark  px-2 py-1 bg-white dark:hover:text-white dark:bg-white/70 rounded-lg backdrop:blur-lg shadow-sm cursor-pointer
          hover:text-button-blue transition-colors duration-300"
          onClick={() => setIsTimeModalOpen(true)}>
            <Clock className="w-4 h-4"/>
            <span>ตั้งเวลา</span>
          </button>
          </div>

          <TimeSettingModal
          open={isTimeModalOpen}
          onClose={() => setIsTimeModalOpen(false)}
          initialHours={Number(hours)}
  initialMinutes={Number(minutes)}
  initialSeconds={Number(seconds)}
          onConfirm={(h, m, s) => {
            setHours(String(h).padStart(2, "0"));
            setMinutes(String(m).padStart(2, "0"));
            setSeconds(String(s).padStart(2, "0"));
          }}
          handleStart={handleStart}
        />
          

        </div>

        {/* ✅ Timer */}
        <div className="mt-2  p-4 rounded-2xl bg-white dark:bg-chat-dark flex-1 flex items-center">
          {/* <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 bg-gray-100 b rounded-md px-3 py-1 text-sm 
            dark:text-text-dark dark:bg-transparent
            ">
              <Clock className="w-4 h-4" />
              <input
                value={hours}
                onChange={(e) => handleChange(e, "h")}
                placeholder="00"
                className="w-8 text-center bg-transparent outline-none cursor-pointer"
              />
              :
              <input
                value={minutes}
                onChange={(e) => handleChange(e, "m")}
                placeholder="00"
                className="w-8 text-center bg-transparent outline-none cursor-pointer"
              />
              :
              <input
                value={seconds}
                onChange={(e) => handleChange(e, "s")}
                placeholder="00"
                className="w-8 text-center bg-transparent outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={increaseTime}
              className="text-xl font-bold bg-gray-100 px-2 rounded cursor-pointer
              dark:bg-box-dark"
            >
              +
            </button>
            <button
              onClick={decreaseTime}
              className="text-xl font-bold bg-gray-100 px-2 rounded cursor-pointer
              dark:bg-box-dark"
            >
              −
            </button>
          </div> */}

          {/* ปุ่มด้านล่าง */}
          <div className=" flex items-center justify-between w-full ">
            {/* <button className="bg-gray-200 flex-1 py-2 rounded-md text-sm font-medium cursor-pointer">
              Instructions
            </button> */}
            {/* time */}
      
            <div className="text-subtitle w-60 dark:text-text-dark">
                <div className="grid grid-cols-5 text-center text-xs mb-1">
                  <span>ชั่วโมง</span>
                  <span></span>
                  <span>นาที</span>
                  <span></span>
                  <span>วินาที</span>
                </div>
                <div className="grid grid-cols-5 text-center text-3xl">
                  <span>{hours}</span>
                  <span>:</span>
                  <span>{minutes}</span>
                  <span>:</span>
                  <span>{seconds}</span>
                </div>
              </div>


            <button
              onClick={() => handleStart (Number(hours), Number(minutes), Number(seconds))}
              disabled={isTimeZero}
              className={` p-4 rounded-full  gap-1 text-sm font-medium  bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white shadow-sm 
                hover:scale-105 duration-300 cursor-pointer 
                `}
            >
               <Play className="w-6 h-6 " fill="currentColor"/>
            </button>
          </div>

          {/* view + like */}
          {/* <div className="flex justify-between items-center mt-2 text-subtitle text-xs text-basic-text dark:text-text-dark">
            <div className="flex gap-2">
              <div className="flex gap-1 items-center">
                <Eye className="h-4 w-4" />
                <p>{sound.view || 0}</p>
              </div>
              <div className="flex gap-1 items-center">
                <Heart
                  className="text-subtitle h-4 w-4 text-red-500"
                  fill="currentColor"
                />
                <p>{likes}</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default BreathingCard;
