import { Eye, Heart, Play, Plus, Search } from "lucide-react";
import { useDarkMode } from "../../../components/Darkmode/toggleDarkmode";
import { getSoundsByTypeID } from "../../../services/https/sounds";
import { use, useEffect, useState } from "react";
import { Sound } from "../../../interfaces/ISound";
import ChantingContent from "./components/chantingContent";
import ModalPlaylist from "./components/modalPlaylist";
import { GetPlaylistByUID } from "../../../services/https/playlist";
import { IPlaylist } from "../../../interfaces/IPlaylist";
import PlaylistContent from "./components/PlaylistContent";
import { CustomPlaylist } from "../Playlist/Playlist";
import { useNavigate } from "react-router-dom";
import { GetTopSoundPlaylist } from "../../../services/https/soundplaylist";
import { message } from "antd";

function ChantingMain() {
  const { isDarkMode } = useDarkMode();
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chanting, setChanting] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const uid = localStorage.getItem("id");
  const navigate = useNavigate();
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);



  async function fetchPlaylist() {
    setIsLoadingPlaylist(true); // เริ่มโหลด
  
    try {
      const res = await GetPlaylistByUID(Number(uid));
      if (Array.isArray(res)) {
        setPlaylists(res);
      } else if (Array.isArray(res.data)) {
        setPlaylists(res.data);
      } else {
        console.warn("unexpected response:", res);
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setIsLoadingPlaylist(false); // โหลดเสร็จแล้ว
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
  async function gotoPlaylistmedia(id: number) {
    console.log("id is: ",id);
    const res = await GetTopSoundPlaylist(id);
    if (res === false) {
      console.error("Error fetching playlist");
      message.error("เกิดข้อผิดพลาด");
      return;
    }
  
    if (res.noVdo) {
      message.error("ไม่มี vdo ใน playlist นี้:");
      setTimeout(() => {
        navigate(`/audiohome/Playlist/${id}`);
      },1000)
     
      return;
    }
  
    // กรณีมีข้อมูล playlist จริง ๆ
    
    setTimeout(() => {
      navigate(`/audiohome/chanting/playlist/play/${id}/${res.data.sid}`);
    },1000)
  }
  function gotoPlaylist(id: number) {
    console.log("id is: ",id);
    setTimeout(() => {
      navigate(`/audiohome/Playlist/${id}`);
    })
  }
  function topPage() {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // เลื่อนแบบนุ่ม ๆ
    });
  }
  
  useEffect(() => {
    topPage();
  }, []);

  return (
    <div
      className={`flex flex-col  duration-300 items-center  min-h-full max-h-fit font-ibmthai  
         ${isDarkMode ? "bg-background-dark" : "bg-background-blue"}`}
    >
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full  flex flex-col gap-8 ${
          isDarkMode
            ? " border-stoke-dark bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]"
            : "  "
        } min-h-screen max-h-fit sm:rounded-t-xl`}
      >
        {/* search + create */}
        <div className="flex md:justify-end ">
        <div className="relative w-[500px] focus-within:outline-regal-blue rounded-lg transition-all duration-300">
  <Search className="absolute left-3 top-2 transform-translate-y-1/2 h-5 w-5 text-basic-blue 
  pointer-events-none dark:text-text-dark" />
  <input
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="ค้นหา..."
    className="pl-10 pr-4  w-full py-2  bg-[#FAFAFA] rounded-md hover:outline-regal-blue hover:outline-1 transition-colors duration-300  
               focus:border-transparent outline-regal-blue focus:outline-1
               dark:bg-chat-dark  dark:border dark:hover:border-regal-blue dark:text-white dark:hover:outline-regal-blue dark:hover:outline-1"
  />
</div>
          <button className="bg-button-blue text-white px-2 py-1 rounded-md ml-2" onClick={openModalPlaylist}>
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-white " />
              <span>สร้าง</span>
            </div>
          </button>
        </div>

          
     
        <ModalPlaylist
          isModalOpen={openModal}
          onClose={() => setOpenModal(false)}
          gotoPlaylist={gotoPlaylist}
        />
     

        {/* filter */}
        <div className="space-x-1">
          <button
            onClick={() => {
              filterAll();
            }}
            className={`px-4 py-2 rounded-xl duration-300  ${
              chanting && showPlaylist
                ? "bg-background-button text-blue-word dark:bg-button-dark/20 "
                : "bg-transparent text-subtitle dark:text-text-dark"
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
                ? "bg-background-button text-blue-word dark:bg-button-dark/20 "
                : "bg-transparent text-subtitle dark:text-text-dark"
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
                ? "bg-background-button text-blue-word dark:bg-button-dark/20 "
                : "bg-transparent text-subtitle dark:text-text-dark"
            }`}
          >
            สวดมนต์
          </button>
        </div>

        {/* playlist */}
        {showPlaylist && (
  isLoadingPlaylist ? (
    <div className="text-center text-subtitle">กำลังโหลดเพลย์ลิสต์...</div>
  ) : (
    <PlaylistContent
      Playlist={playlists}
      GotoPlaylist={gotoplaylist}
      gotoPlaylistmedia={gotoPlaylistmedia}
      fetchPlaylist={fetchPlaylist}
    />
  )
)}

        {/* chatinting content */}
        {chanting && (
          <ChantingContent filteredSounds={filteredSounds} extractYouTubeID={extractYouTubeID} gotoSound={gotoSound}  />
        )}
      </div>
    </div>
  );
}
export default ChantingMain;
