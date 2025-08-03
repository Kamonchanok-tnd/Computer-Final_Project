import { Play, Heart, Eye } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface BreathingCardProps {
  sound: Sound;
}

function BreathingCard({ sound }: BreathingCardProps) {
  const navigate = useNavigate();
  const [time, setTime] = useState(5);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${h}:${m}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const increaseTime = () => setTime((prev) => prev + 1);
  const decreaseTime = () => setTime((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-white w-full rounded-xl border border-gray-200 flex flex-col">
      {/* รูป + หัวใจ */}
      <div className="h-[60%] bg-pink-300 w-full rounded-t-xl relative">
        <div className="w-full h-full bg-gray-200 rounded-t-xl"></div>

        {/* หัวใจพื้นหลังวงกลมสีขาว */}
        <div className="absolute top-3 right-3 w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md hover:scale-105 duration-300">
          <Heart className="text-red-500 h-5 w-5" />
        </div>
      </div>

      {/* เนื้อหา */}
      <div className="p-3 flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-basic-text truncate">
          {sound.name || "Breathly"}
        </h1>
        <p className="text-subtitle text-sm">เพลงสบายๆ ชีวิตๆ</p>

        {/* Timer */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1 text-sm">
            ⏰ <span className="font-semibold text-black">{currentTime}</span>
          </div>
          <div className="bg-pink-100 px-3 py-1 rounded-md text-sm">{time} นาที</div>
          <button onClick={increaseTime} className="text-xl font-bold bg-gray-100 px-2 rounded">
            +
          </button>
          <button onClick={decreaseTime} className="text-xl font-bold bg-gray-100 px-2 rounded">
            −
          </button>
        </div>

        {/* ปุ่มด้านล่าง */}
        <div className="flex justify-between mt-3">
          <button className="bg-gray-200 px-4 py-2 rounded-md text-sm">
            Instructions
          </button>
          <button
  onClick={() => {
    console.log("🎵 ส่งค่า videoUrl:", sound.sound); // ✅ Log ดูว่าได้ค่าอะไร
    console.log("⏱ ส่งค่า time:", time); // ✅ Log ดูเวลา
    navigate("/audiohome/breath-in", {
      state: { 
        time, 
        videoUrl: sound.sound 
      }
    });
  }}
  className="bg-button-blue px-4 py-2 rounded-md flex items-center gap-1 text-sm text-white"
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
              <Heart className="h-4 w-4" />
              <p>{sound.like_sound || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreathingCard;
