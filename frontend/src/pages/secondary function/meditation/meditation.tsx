import { EllipsisVertical, Play, Plus, Search, Trash2 } from "lucide-react";
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
import { DeletePlaylistByID, getPlaylistsByUserAndType, IMG_URL } from "../../../services/https/playlist";
import { IBackground } from "../../../interfaces/IBackground";
import { Dropdown, MenuProps, message } from "antd";
import DeleteConfirmModal from "../Playlist/Component/DeleteConfirmModal";


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
  const [openDeletePlaylist, setOpenDeletePlaylist] = useState(false);
  const [loading, setLoading] = useState(false);

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
  async function DeletePlaylist(id: number) {
      try {
        await DeletePlaylistByID(Number(id));
        message.success("ลบเพลย์ลิสต์แล้ว");
      } catch (error) {
        console.error("Error deleting playlist:", error);
        message.error("เกิดข้อผิดพลาดในการลบเพลย์ลิสต์");
      }finally{
        setLoading(false);
        setOpenDeletePlaylist(false)
        if (uid !== null) {
          fetchUserMeditationPlaylists(uid);
        } else {
          console.error("uid is null, cannot fetch user meditation playlists");
        }
      }
    }




  return (
    <div
      className={`flex flex-col min-h-screen duration-300 items-center font-ibmthai  
         ${isDarkMode ? "bg-background-dark" : "bg-background-blue"}`}
    >
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 min-h-screen sm:w-[95%] w-full  flex flex-col gap-8 ${
          isDarkMode
            ? " border-stoke-dark bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]"
            : ""
        } sm:rounded-xl`}
      >
        {/* 🔍 Search + Create */}
        <div className="flex justify-end">
          <div className="relative w-[500px] focus-within:outline-regal-blue rounded-lg transition-all duration-300">
            <Search className="absolute left-3 top-2 transform-translate-y-1/2 h-5 w-5 text-basic-blue 
  pointer-events-none dark:text-text-dark" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4  w-full py-2  bg-[#FAFAFA] rounded-md hover:outline-regal-blue hover:outline-1 transition-colors duration-300  
               focus:border-transparent outline-regal-blue focus:outline-1
               dark:bg-chat-dark  dark:border dark:hover:border-regal-blue dark:text-white dark:hover:outline-regal-blue dark:hover:outline-1"
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
          <button onClick={filterAll} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "all" ? "bg-background-button text-blue-word dark:bg-button-dark/20" : "bg-transparent text-subtitle dark:text-text-dark"}`}>
            ทั้งหมด
          </button>
          <button onClick={filterPlaylist} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "playlist" ? "bg-background-button text-blue-word dark:bg-button-dark/20" : "bg-transparent text-subtitle dark:text-text-dark"}`}>
            เพลยลิสต์ของฉัน
          </button>
          <button onClick={filterMeditation} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "meditation" ? "bg-background-button text-blue-word dark:bg-button-dark/20" : "bg-transparent text-subtitle dark:text-text-dark"}`}>
            นั่งสมาธิ
          </button>
          <button onClick={filterBreathing} className={`px-4 py-2 rounded-xl duration-300 ${activeFilter === "breathing" ? "bg-background-button text-blue-word dark:bg-button-dark/20" : "bg-transparent text-subtitle dark:text-text-dark"}`}>
            ฝึกลมหายใจ
          </button>
        </div>

        {/* 🎵 Meditation Playlist */}
        {playlist && (
          <div>
            <h1 className="text-xl text-basic-text mb-4 dark:text-text-dark">เพลยลิสต์สมาธิของฉัน</h1>
            <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
              {meditationPlaylists.map((pl) => {
                 const items: MenuProps["items"] = [
                  {
                    key: "play",
                    label: (
                      <div
                        className="flex items-center gap-2 font-ibmthai"
                        onClick={(e) => {
                          e.stopPropagation();
                          GotoEditPlaylist(Number(pl.ID));
                        }}
                      >
                        <Play size={16} /> เล่น
                      </div>
                    ),
                  },
                  {
                    key: "delete",
                    label: (
                      <div className="flex items-center gap-2 font-ibmthai"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDeletePlaylist(true);
                      }}
                      >
                        <Trash2 size={16} /> ลบ
                      </div>
                    ),
                    danger: true,
                  },
                ]

        //         return(
        //         <div
        //           key={pl.ID}
        //           className="group bg-white w-full h-15 rounded-md shadow-sm  flex gap-2  transition-all duration-300
        //         dark:bg-box-dark dark:border-stoke-dark dark:text-text-dark dark:border dark:shadow-dark"
        //           onClick={() => pl.ID && GotoEditPlaylist(pl.ID)}
        //         >
        //           <img
        //             className="h-full w-18 rounded-tl-md rounded-bl-md object-cover"
        //             src={
        //               pl.Background && pl.Background.Picture
        //                 ? `${IMG_URL}${pl.Background.Picture}`
        //                 : `${IMG_URL}defaultPlaylist.png`
        //             }
        //             alt={pl.name}
        //           />
        //           <div className="h-full w-full flex items-center justify-start">
        //             <p className="text-basic-text font-bold truncate">{pl.name}</p>
        //           </div>
        //           <Dropdown menu={{ items }} trigger={["click"]}  overlayClassName="custom-dropdown">
        //           <button className="mr-4 cursor-pointer h-full  "
        //            onClick={(e) => {
        //             e.stopPropagation();
        //           }}>
        //             <EllipsisVertical size={20}  />
        //           </button>
        //         </Dropdown>
        //         <DeleteConfirmModal
        //           open={openDeletePlaylist}
        //           onConfirm={() => DeletePlaylist(Number(pl.ID))}
        //           onCancel={() => setOpenDeletePlaylist(false)}
        //           loading={loading}
        //         />
        //         </div>
        //       )})}
        //     </div>
        //   </div>
        // )}

        // 🎵 Breathing Playlist
        // {playlist && breathingPlaylists.length > 0 && (
        //   <div className="font-ibmthai">
        //     <h1 className="text-xl text-basic-text mb-4 dark:text-text-dark">เพลยลิสต์ฝึกลมหายใจของฉัน</h1>
        //     <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
        //       {breathingPlaylists.map((pl) => {
        //          const items: MenuProps["items"] = [
        //           {
        //             key: "play",
        //             label: (
        //               <div
        //                 className="flex items-center gap-2 font-ibmthai"
        //                 onClick={(e) => {
        //                   e.stopPropagation();
        //                   GotoEditPlaylist(Number(pl.ID));
        //                 }}
        //               >
        //                 <Play size={16} /> เล่น
        //               </div>
        //             ),
        //           },
        //           {
        //             key: "delete",
        //             label: (
        //               <div className="flex items-center gap-2 font-ibmthai"
        //               onClick={(e) => {
        //                 e.stopPropagation();
        //                 setOpenDeletePlaylist(true);
        //               }}
        //               >
        //                 <Trash2 size={16} /> ลบ
        //               </div>
        //             ),
        //             danger: true,
        //           },
        //         ]

                return  (
                <div
                  key={pl.ID}
                  className="group bg-white w-full h-15 rounded-md shadow-sm  flex gap-2  transition-all duration-300
                dark:bg-box-dark dark:border-stoke-dark dark:text-text-dark dark:border dark:shadow-dark"
                  onClick={() => pl.ID && GotoEditPlaylist(pl.ID)}
                >
                  <img
                    className="h-full w-18 rounded-tl-md rounded-bl-md"
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
                  <Dropdown menu={{ items }} trigger={["click"]}  overlayClassName="custom-dropdown">
                  <button className="mr-4 cursor-pointer h-full  "
                   onClick={(e) => {
                    e.stopPropagation();
                  }}>
                    <EllipsisVertical size={20}  />
                  </button>
                </Dropdown>
                <DeleteConfirmModal
                  open={openDeletePlaylist}
                  onConfirm={() => DeletePlaylist(Number(pl.ID))}
                  onCancel={() => setOpenDeletePlaylist(false)}
                  loading={loading}
                />
                </div>
              )})}
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
            <h1 className="text-xl text-basic-text mb-4 dark:text-text-dark">ฝึกลมหายใจ</h1>
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
