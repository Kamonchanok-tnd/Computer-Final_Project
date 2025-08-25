import { useEffect, useState } from "react";
import { getSoundsByTypeID } from "../../services/https/sounds";
import { Sound } from "../../interfaces/ISound";
import { useNavigate } from "react-router-dom";
import ChaintingCard from "./chantincard";

function HomeChanting() {
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
  const navigate = useNavigate();

  async function fetchChanting() {
    try {
      const res = await getSoundsByTypeID(3);
      const firstFiveSounds = res.sounds?.slice(0, 6) || [];
      setChantingSounds(firstFiveSounds);
    } catch (error) {
      console.error("Error fetching chanting sounds:", error);
    }
  }

  useEffect(() => {
    fetchChanting();
  }, []);

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  function gotoSound(id: number) {
    console.log("id is: ", id);
    navigate(`/audiohome/chanting/play/${id}`);
  }

  return (
    <div className="font-ibmthai mt-4 ">
      <div className="xl:px-28 px-2">
        <div className="flex items-center justify-between  px-2">
          <p className="font-ibmthai text-2xl">สวดมนต์</p>
        </div>
        <div className="grid grid-cols-6 gap-2 mt-4">
          {chantingSounds.map((sound) => (
            <ChaintingCard
              key={sound.ID}
              sound={sound}
              extractYouTubeID={extractYouTubeID}
              gotoSound={gotoSound}
            />
          ))}
        </div>
        <div className="w-full flex justify-center">
             <button className="bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white font-bold py-2 px-8 rounded-full mt-4 transition-all duration-300 
            cursor-pointer  hover:scale-110 "
            onClick={() => navigate("/audiohome/chanting")}>เริ่มเลย</button>
            </div>
      </div>
    </div>
  );
}

export default HomeChanting;
