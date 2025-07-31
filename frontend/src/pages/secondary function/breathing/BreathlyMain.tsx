import { Play, Plus, Search } from "lucide-react";
import { useDarkMode } from "../../../components/Darkmode/toggleDarkmode";
import { getSoundsByTypeID } from "../../../services/https/sounds";
import { useEffect, useState } from "react";
import { Sound } from "../../../interfaces/ISound";
import ModalPlaylist from "../chanting/components/modalPlaylist";

function BreathlyMain() {
  const { isDarkMode } = useDarkMode();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ state สำหรับ filter
  const [breathly, setBreathly] = useState(true);
  const [playlist, setPlaylist] = useState(true);

  async function fetchBreathly() {
    try {
      const res = await getSoundsByTypeID(4);
      setSounds(res.sounds);
    } catch (error) {
      console.error("Error fetching sounds:", error);
    }
  }

  const filteredSounds = sounds.filter((sound) =>
    sound.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function filterAll() {
    setBreathly(true);
    setPlaylist(true);
  }
  function filterBreathly() {
    setBreathly(true);
    setPlaylist(false);
  }
  function filterPlaylist() {
    setBreathly(false);
    setPlaylist(true);
  }

  useEffect(() => {
    fetchBreathly();
  }, []);

  return (
    <div
      className={`flex flex-col h-full duration-300 items-center
        ${isDarkMode ? "bg-background-dark" : "bg-background-blue"}`}
    >
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full border flex flex-col gap-8 ${
          isDarkMode
            ? "border-stoke-dark bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]"
            : "border-gray-200 bg-white"
        } h-full sm:rounded-xl`}
      >
        {/* Search + Create Playlist */}
        <div className="flex justify-between items-center">
          <div className="relative w-[300px] focus-within:outline-regal-blue rounded-lg">
            <Search className="absolute left-3 top-2 h-4 w-4 text-basic-blue" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1 w-full bg-[#FAFAFA] rounded-md"
              placeholder="ค้นหาเพลงหายใจ..."
            />
          </div>
          <button
            className="bg-button-blue text-white px-3 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            สร้างเพลย์ลิสต์
          </button>
        </div>

        {/* ✅ Filter Buttons */}
        <div className="space-x-1">
          <button
            onClick={filterAll}
            className={`px-4 py-2 rounded-xl duration-300 ${
              breathly && playlist
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={filterPlaylist}
            className={`px-4 py-2 rounded-xl duration-300 ${
              !breathly && playlist
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            เพลยลิสต์ของฉัน
          </button>
          <button
            onClick={filterBreathly}
            className={`px-4 py-2 rounded-xl duration-300 ${
              breathly && !playlist
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            หายใจ
          </button>
        </div>

        {/* ✅ Playlist Section */}
        {playlist && (
          <div>
            <h1 className="text-xl text-basic-text mb-4">เพลยลิสต์ของฉัน</h1>
            <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
              <div className="bg-white w-full h-15 rounded-md border border-gray-200 flex gap-2">
                <div className="h-full w-18 bg-blue-500 rounded-tl-md rounded-bl-md" />
                <div className="h-full w-full flex items-center justify-start">
                  <p className="text-basic-text font-bold">เพลยลิสต์</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Breathly Content */}
        {breathly && (
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
            {filteredSounds.map((sound) => (
              <div
                key={sound.id}
                className="bg-pink-200 rounded-2xl p-4 w-80 h-64 flex flex-col justify-between"
              >
                {/* Top Section */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-semibold text-black">
                      {sound.name || "Breathly"}
                    </h1>
                    <p className="text-black/70 text-sm">เพลงสบายๆ ชีวิตๆ</p>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center">
                    <div className="w-1 h-3 bg-black rounded"></div>
                  </div>
                  <div className="bg-pink-100 px-3 py-1 rounded-md">9:41 AM</div>
                  <button className="text-xl font-bold">+</button>
                  <button className="text-xl font-bold">−</button>
                </div>

                {/* Bottom Buttons */}
                <div className="flex justify-between">
                  <button className="bg-gray-200 px-4 py-2 rounded-md">
                    Instructions
                  </button>
                  <button className="bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1">
                    Start <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <ModalPlaylist
          isModalOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default BreathlyMain;
