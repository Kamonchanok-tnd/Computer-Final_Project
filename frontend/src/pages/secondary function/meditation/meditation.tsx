import { Play, Plus, Search } from "lucide-react";
import { useDarkMode } from "../../../components/Darkmode/toggleDarkmode";
import { getMeditationSounds } from "../../../services/https/meditation";
import { getBreathingSounds } from "../../../services/https/breathing";
import { useEffect, useState } from "react";
import { Sound } from "../../../interfaces/ISound";
import MeditationContent from "./components/MeditationContent";
import BreathingCard from "../breathing/components/breathingcontent";
import { useNavigate } from "react-router-dom";
import PlaylistMeditation from "./playlistmeditation/playlistmeditation";
import { IPlaylist } from "../../../interfaces/IPlaylist";
import { getPlaylistsByUserAndType, IMG_URL } from "../../../services/https/playlist";
import { IBackground } from "../../../interfaces/IBackground";
import { message } from "antd";


function MeditationMain() {
  const { isDarkMode } = useDarkMode();
  const [meditationSounds, setMeditationSounds] = useState<Sound[]>([]);
  const [breathingSounds, setBreathingSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [meditation, setMeditation] = useState(true);
  const [playlist, setPlaylist] = useState(true);
  const [breathing, setBreathing] = useState(true);
  const [meditationPlaylists, setMeditationPlaylists] = useState<IPlaylist[]>([]);
  const [breathingPlaylists, setBreathingPlaylists] = useState<IPlaylist[]>([]); // ✅ เพิ่ม breathing playlist
  const [backgrounds, setBackgrounds] = useState<IBackground[]>([]);

  const [uid, setUid] = useState<number | null>(null);
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<
    "all" | "playlist" | "meditation" | "breathing"
  >("all");

  useEffect(() => {
    const storedUid = localStorage.getItem("id");
    if (storedUid) {
      setUid(Number(storedUid));
    }
  }, []);

  async function fetchMeditation(userId: number) {
    try {
      const res = await getMeditationSounds(userId);
      setMeditationSounds(res.sounds || []);
    } catch (error) {
      console.error("Error fetching meditation sounds:", error);
    }
  }

  async function fetchUserMeditationPlaylists(userId: number) {
    try {
      const res = await getPlaylistsByUserAndType(userId, 2); // 2 = สมาธิ
      setMeditationPlaylists(res);
    } catch (error) {
      console.error("Error fetching user meditation playlists:", error);
    }
  }

  async function fetchUserBreathingPlaylists(userId: number) {
    try {
      const res = await getPlaylistsByUserAndType(userId, 3); // ✅ 3 = ฝึกลมหายใจ
      setBreathingPlaylists(res);
    } catch (error) {
      console.error("Error fetching user breathing playlists:", error);
    }
  }

  async function fetchBreathing(userId: number) {
    try {
      const res = await getBreathingSounds(userId);
      setBreathingSounds(res.sounds || []);
    } catch (error) {
      console.error("Error fetching breathing sounds:", error);
    }
  }

  useEffect(() => {
    if (uid === null) return;
    fetchMeditation(uid);
    fetchBreathing(uid);
    fetchUserMeditationPlaylists(uid);
    fetchUserBreathingPlaylists(uid); // ✅ เรียก API เพลยลิสต์ลมหายใจ
  }, [uid]);

  const filteredMeditation = meditationSounds.filter((sound) =>
    sound.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBreathing = breathingSounds.filter((sound) =>
    sound.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function filterAll() {
    setActiveFilter("all");
    setMeditation(true);
    setPlaylist(true);
    setBreathing(true);
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
  }

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const GotoEditPlaylist = (id: number) => {
    navigate(`/editplaylist/${id}`);
  };




  return (
    <div
      className={`flex flex-col min-h-screen duration-300 items-center font-ibmthai
         ${isDarkMode ? "bg-background-dark" : "bg-background-blue"}`}
    >
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 min-h-screen sm:w-[95%] w-full border flex flex-col gap-8 ${
          isDarkMode
            ? " border-stoke-dark bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]"
            : "border-gray-200 bg-white"
        } sm:rounded-xl`}
      >
        {/* 🔍 Search + Create */}
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

        <PlaylistMeditation
  isModalOpen={openModal}
  onClose={() => setOpenModal(false)}
  onSuccess={() => {
    message.success("สร้างเพลย์ลิสต์สำเร็จ!");
    if (uid) {
      fetchUserMeditationPlaylists(uid);
      fetchUserBreathingPlaylists(uid);
    }
  }}
/>


        {/* 🔘 Filter buttons */}
        <div className="space-x-1">
          <button onClick={filterAll} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "all" ? "bg-background-button text-blue-word" : "bg-transparent text-subtitle"}`}>
            ทั้งหมด
          </button>
          <button onClick={filterPlaylist} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "playlist" ? "bg-background-button text-blue-word" : "bg-transparent text-subtitle"}`}>
            เพลยลิสต์ของฉัน
          </button>
          <button onClick={filterMeditation} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "meditation" ? "bg-background-button text-blue-word" : "bg-transparent text-subtitle"}`}>
            นั่งสมาธิ
          </button>
          <button onClick={filterBreathing} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "breathing" ? "bg-background-button text-blue-word" : "bg-transparent text-subtitle"}`}>
            ฝึกลมหายใจ
          </button>
        </div>

        {/* 🎵 Meditation Playlist */}
        {playlist && (
          <div>
            <h1 className="text-xl text-basic-text mb-4">เพลยลิสต์สมาธิของฉัน</h1>
            <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
              {meditationPlaylists.map((pl) => (
                <div
                  key={pl.ID}
                  className="bg-white w-full min-h-[70px] rounded-md border border-gray-200 flex gap-2 p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => pl.ID && GotoEditPlaylist(pl.ID)}
                >
                  <img
                    className="h-full w-18 rounded-tl-md rounded-bl-md object-cover"
                    src={
                      pl.Background && pl.Background.Picture
                        ? `${IMG_URL}${pl.Background.Picture}`
                        : `${IMG_URL}defaultPlaylist.png`
                    }
                    alt={pl.name}
                  />
                  <div className="h-full w-full flex items-center justify-start">
                    <p className="text-basic-text font-bold truncate">{pl.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎵 Breathing Playlist */}
        {playlist && breathingPlaylists.length > 0 && (
          <div>
            <h1 className="text-xl text-basic-text mb-4">เพลยลิสต์ฝึกลมหายใจของฉัน</h1>
            <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
              {breathingPlaylists.map((pl) => (
                <div
                  key={pl.ID}
                  className="bg-white w-full min-h-[70px] rounded-md border border-gray-200 flex gap-2 p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => pl.ID && GotoEditPlaylist(pl.ID)}
                >
                  <img
                    className="h-full w-18 rounded-tl-md rounded-bl-md object-cover"
                    src={
                      pl.Background && pl.Background.Picture
                        ? `${IMG_URL}${pl.Background.Picture}`
                        : `${IMG_URL}defaultPlaylist.png`
                    }
                    alt={pl.name}
                  />
                  <div className="h-full w-full flex items-center justify-start">
                    <p className="text-basic-text font-bold truncate">{pl.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🧘 Meditation Content */}
        {meditation && (
          <MeditationContent
            filteredSounds={filteredMeditation}
            extractYouTubeID={extractYouTubeID}
          />
        )}

        {/* 🌬️ Breathing Content */}
        {breathing && (
          <div className="flex flex-col w-full">
            <h1 className="text-xl text-basic-text mb-4">ฝึกลมหายใจ</h1>
            <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
              {filteredBreathing.map((sound) => (
                <BreathingCard key={sound.ID} sound={sound} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeditationMain;
