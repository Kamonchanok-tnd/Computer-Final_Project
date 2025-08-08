import { Play, Heart, Eye, Clock } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { likeSound, checkLikedSound, addSoundView } from "../../../../services/https/sounds"; // ✅ import addSoundView

interface BreathingCardProps {
  sound: Sound;
}

function BreathingCard({ sound }: BreathingCardProps) {
  const navigate = useNavigate();

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  const isTimeZero =
    parseInt(hours) === 0 &&
    parseInt(minutes) === 0 &&
    parseInt(seconds) === 0;

  const [likes, setLikes] = useState(sound.like_sound || 0);
  const [isLiked, setIsLiked] = useState(false);

  const realId = sound.ID ?? (sound as any).ID;
  const uid = Number(localStorage.getItem("id"));

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "h" | "m" | "s"
  ) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) value = value.slice(0, 2);
    if (type === "h") setHours(value || "00");
    if (type === "m") setMinutes(value || "00");
    if (type === "s") setSeconds(value || "00");
  };

  const pad = (num: number) => num.toString().padStart(2, "0");

  const increaseTime = () => {
    let h = parseInt(hours);
    let m = parseInt(minutes);
    m += 1;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
    setHours(pad(h));
    setMinutes(pad(m));
  };

  const decreaseTime = () => {
    let h = parseInt(hours);
    let m = parseInt(minutes);
    if (h === 0 && m === 0) return;
    m -= 1;
    if (m < 0) {
      if (h > 0) {
        h -= 1;
        m = 59;
      } else {
        m = 0;
      }
    }
    setHours(pad(h));
    setMinutes(pad(m));
  };

  // ✅ เรียกตอนกด Start
  const handleStart = () => {
    if (!realId) return;

    // ✅ ตั้งเวลาให้ครบ 1 นาทีแล้วอัปเดต view อีกครั้ง
    setTimeout(() => {
      addSoundView(realId).catch((err) =>
        console.error("เพิ่ม view หลัง 1 นาทีไม่สำเร็จ:", err)
      );
    }, 60 * 1000);

    navigate("/audiohome/breath-in", {
      state: {
        customTime: `${hours}:${minutes}:${seconds}`,
        videoUrl: sound.sound,
      },
    });
  };

  return (
    <div className="bg-gradient-to-t from-[#b3e5fc] to-white w-full rounded-xl shadow-xl flex flex-col mt-2 min-h-[260px]">
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
      <div className="p-3 flex flex-col flex-1">
        <div>
          <h1 className="text-lg font-semibold text-basic-text truncate">
            {sound.name}
          </h1>
          <p className="text-subtitle text-sm break-words line-clamp-3">
            {sound.description}
          </p>
          <p className="text-subtitle text-sm break-words line-clamp-3 mt-2">
            ผู้จัดทำ: {sound.owner}
          </p>

        </div>

        {/* ✅ Timer */}
        <div className="mt-auto">
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1 text-sm">
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
              className="text-xl font-bold bg-gray-100 px-2 rounded cursor-pointer"
            >
              +
            </button>
            <button
              onClick={decreaseTime}
              className="text-xl font-bold bg-gray-100 px-2 rounded cursor-pointer"
            >
              −
            </button>
          </div>

          {/* ปุ่มด้านล่าง */}
          <div className="flex justify-between mt-3 gap-2">
            <button className="bg-gray-200 flex-1 py-2 rounded-md text-sm font-medium cursor-pointer">
              Instructions
            </button>
            <button
              onClick={handleStart}
              disabled={isTimeZero}
              className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1 text-sm font-medium 
                ${
                  isTimeZero
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-button-blue text-white cursor-pointer"
                }`}
            >
              Start <Play className="w-4 h-4" />
            </button>
          </div>

          {/* view + like */}
          <div className="flex justify-between items-center mt-2 text-subtitle text-xs">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreathingCard;
