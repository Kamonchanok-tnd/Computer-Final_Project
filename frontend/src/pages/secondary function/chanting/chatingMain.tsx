import { Eye, Heart, Play, Plus, Search } from "lucide-react";
import { useDarkMode } from "../../../components/Darkmode/toggleDarkmode";
import { getSoundsByTypeID } from "../../../services/https/sounds";
import { use, useEffect, useState } from "react";
import { Sound } from "../../../interfaces/ISound";
import ChantingContent from "./components/chanting.Content";
import ModalPlaylist from "./components/modalPlaylist";
import { GetPlaylistByUID } from "../../../services/https/playlist";
import { IPlaylist } from "../../../interfaces/IPlaylist";
import PlaylistContent from "./components/PlaylistContent";
import { CustomPlaylist } from "../Playlist/Playlist";
import { useNavigate } from "react-router-dom";

function ChatingMain() {
  const { isDarkMode } = useDarkMode();
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chanting, setChanting] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const uid = localStorage.getItem("id");
  const navigate = useNavigate();


  async function fetchPlaylist() {
    try {
        const res = await GetPlaylistByUID(Number(uid));
      
        setPlaylists(res);
        console.log("playlist is: ", res);
    }
    catch (error) {
      console.error("Error fetching playlist:", error);
    }
  
  }

  async function fetchChanting() {
    try {
      const res = await getSoundsByTypeID(3); 
      setChantingSounds(res.sounds); // สำคัญ! ต้องใช้ res.sounds ตามโครงสร้าง

    } catch (error) {
      console.error("Error fetching chanting sounds:", error);
    }
  }

  function openModalPlaylist() {
    setOpenModal(true);
    console.log(openModal);
  }

  const filteredSounds = chantingSounds.filter((sound) =>
    sound.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  function filterAll() {
    setChanting(true);
    setShowPlaylist(true);
  }
  function filterChanting() {
    setChanting(true);
    setShowPlaylist(false);
  }
  function filterPlaylist() {
    setChanting(false);
    setShowPlaylist(true);
  }

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    console.log(chantingSounds);
  }, [chantingSounds,playlists]);

  useEffect(() => {
    fetchChanting();
    fetchPlaylist();
  }, []);

  function gotoplaylist(id: number) {
    console.log("id is: ",id);
    setTimeout(() => {
      navigate(`/audiohome/Playlist/${id}`);
    })
  }
  function gotoSound(id: number) {
    console.log("id is: ",id);
    setTimeout(() => {
      navigate(`/audiohome/chanting/play/${id}`);
    })
  }

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
          <div className="relative   w-[500px] focus-within:outline-regal-blue rounded-lg transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300">
            <Search className="absolute left-3 top-1 transform-translate-y-1/2 h-4 w-4 text-basic-blue" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1 w-full  bg-[#FAFAFA] rounded-md hover:outline-regal-blue hover:outline-1 transition-colors duration-300   focus:border-transparent outline-regal-blue focus:outline-1"
              placeholder="ค้นหา..."
            />
          </div>
          <button className="bg-button-blue text-white px-2 py-1 rounded-md ml-2" onClick={openModalPlaylist}>
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-white" />
              <span>สร้าง</span>
            </div>
          </button>
        </div>

          
     
        <ModalPlaylist
          isModalOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
     

        {/* filter */}
        <div className="space-x-1">
          <button
            onClick={() => {
              filterAll();
            }}
            className={`px-4 py-2 rounded-xl duration-300 ${
              chanting && showPlaylist
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => {
              filterPlaylist();
            }}
            className={`px-4 py-2 rounded-xl duration-300 ${
              !chanting && showPlaylist
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            เพลยลิสต์ของฉัน
          </button>
          <button
            onClick={() => {
              filterChanting();
            }}
            className={`px-4 py-2 rounded-xl duration-300 ${
              chanting && !showPlaylist
                ? "bg-background-button text-blue-word"
                : "bg-transparent text-subtitle"
            }`}
          >
            สวดมนต์
          </button>
        </div>

        {/* playlist */}
        {showPlaylist && (
         <PlaylistContent Playlist={playlists} GotoPlaylist={gotoplaylist}/>
        )}

        {/* chatinting content */}
        {chanting && (
          <ChantingContent filteredSounds={filteredSounds} extractYouTubeID={extractYouTubeID} gotoSound={gotoSound} />
        )}
      </div>
    </div>
  );
}
export default ChatingMain;
