import { Eye, Heart, Play, Plus, Search } from "lucide-react";
import { useDarkMode } from "../../../components/Darkmode/toggleDarkmode";
import { getMeditationSounds } from "../../../services/https/meditation";
import { useEffect, useState } from "react";
import { Sound } from "../../../interfaces/ISound";
import MeditationContent from "./components/MeditationContent";
import { useNavigate } from "react-router-dom";
import ModalPlaylist from "../chanting/components/modalPlaylist";

function MeditationMain() {
  const { isDarkMode } = useDarkMode();
  const [meditationSounds, setMeditationSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [meditation, setMeditation] = useState(true);
  const [playlist, setPlaylist] = useState(true);
  const [breathing, setBreathing] = useState(false);

  // เก็บปุ่มที่ถูกเลือก: "all" | "playlist" | "meditation" | "breathing"
  const [activeFilter, setActiveFilter] = useState<"all" | "playlist" | "meditation" | "breathing">("all");

  const navigate = useNavigate();

  async function fetchMeditation() {
    try {
      const res = await getMeditationSounds();
      setMeditationSounds(res.sounds || []);
    } catch (error) {
      console.error("Error fetching meditation sounds:", error);
    }
  }

  const filteredSounds = meditationSounds.filter((sound) =>
    sound.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function filterAll() {
    setActiveFilter("all");
    setMeditation(true);
    setPlaylist(true);
    setBreathing(false);
  }

  function filterPlaylist() {
    setActiveFilter("playlist");
    setMeditation(false);
    setPlaylist(true);
    setBreathing(false);
  }

  function filterMeditation() {
    setActiveFilter("meditation");
    setMeditation(true);
    setPlaylist(false);
    setBreathing(false);
  }

  function filterBreathing() {
    setActiveFilter("breathing");
    setMeditation(false);
    setPlaylist(false);
    setBreathing(true);
    navigate("/audiohome/breath-in");
  }

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetchMeditation();
  }, []);

  return (
    <div
      className={`flex flex-col h-full duration-300 items-center
         ${isDarkMode ? "bg-background-dark" : "bg-background-blue"}`}
    >
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full border flex flex-col gap-8 ${
          isDarkMode
            ? " border-stoke-dark bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]"
            : "border-gray-200 bg-white"
        } h-full sm:rounded-xl`}
      >
        {/* search + create */}
        <div className="flex justify-end">
          <div className="relative w-[500px] focus-within:outline-regal-blue rounded-lg transition-all duration-300">
            <Search className="absolute left-3 top-1 transform-translate-y-1/2 h-4 w-4 text-basic-blue" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1 w-full bg-[#FAFAFA] rounded-md hover:outline-regal-blue hover:outline-1 transition-colors duration-300 focus:border-transparent outline-regal-blue focus:outline-1"
              placeholder="ค้นหาเสียงสมาธิ..."
            />
          </div>
          <button
            className="bg-button-blue text-white px-2 py-1 rounded-md ml-2"
            onClick={() => setOpenModal(true)}
          >
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-white" />
              <span>สร้าง</span>
            </div>
          </button>
        </div>

        {openModal && (
          <ModalPlaylist
            isModalOpen={openModal}
            onClose={() => setOpenModal(false)}
          />
        )}

        {/* filter buttons */}
        <div className="space-x-1">
          <button
            onClick={filterAll}
            className={`px-4 py-2 rounded-xl duration-300 ${
              activeFilter === "all"
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={filterPlaylist}
            className={`px-4 py-2 rounded-xl duration-300 ${
              activeFilter === "playlist"
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            เพลยลิสต์ของฉัน
          </button>
          <button
            onClick={filterMeditation}
            className={`px-4 py-2 rounded-xl duration-300 ${
              activeFilter === "meditation"
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            นั่งสมาธิ
          </button>
          <button
            onClick={filterBreathing}
            className={`px-4 py-2 rounded-xl duration-300 ${
              activeFilter === "breathing"
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            ฝึกลมหายใจ
          </button>
        </div>

        {/* playlist */}
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

        {/* meditation content */}
        {meditation && (
          <MeditationContent
            filteredSounds={filteredSounds}
            extractYouTubeID={extractYouTubeID}
          />
        )}
      </div>
    </div>
  );
}

export default MeditationMain;
