import { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreatePlaylist,
  GetPlaylistByID,
  GetPlaylistByUID,
  IMG_URL,
  UpdatePlaylist,
} from "../../../services/https/playlist";
import {
  Check,
  ChevronLeft,
  CirclePlus,
  Clock,
  Eye,
  Heart,
  MoveLeft,
  PenLine,
  Play,
  Search,
  SquarePen,
  X,
} from "lucide-react";
import { IPlaylist } from "../../../interfaces/IPlaylist";
import { Sound } from "../../../interfaces/ISound";
import { getSoundsByTypeID } from "../../../services/https/sounds";
import { ISoundPlaylist } from "../../../interfaces/ISoundPlaylist";
import {
  CreateSoundPlaylist,
  DeleteSoundPlaylistByID,
  GetSoundPlaylistByPID,
} from "../../../services/https/soundplaylist";
import { message } from "antd";
import SoundsCard from "./Component/SoundsCard";
import TableSoundPlaylist from "./Component/tableSoundPlaylist";

export interface CustomPlaylist extends IPlaylist {
  picture: string;
}

export interface CustomSoundPlaylist extends ISoundPlaylist {
  name?: string;
  sound?: string;
  owner?: string;
  duration?: number;
  view?: number;
  like_sound?: number;
}
function AddSoundPlaylist() {
  const params = useParams();
  const p_id = params.id;
  const [playlists, setPlaylists] = useState<CustomPlaylist | null>(null);
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([]);
  const [soundPlaylist, setSoundPlaylist] = useState<CustomSoundPlaylist[]>([]);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [deletedRowIds, setDeletedRowIds] = useState<number[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const navigate = useNavigate();

  async function DeleteSoundPlaylist(id: number) {
    try {
      await DeleteSoundPlaylistByID(id);
      message.success("ลบเพลย์ลิสต์แล้ว");
      setDeletedRowIds((prev) => [...prev, id]);
      fetchSoundPlaylist();
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  }
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSounds(chantingSounds);
    } else {
      const filtered = chantingSounds.filter(
        (sound) =>
          sound.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sound.owner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSounds(filtered);
    }
  }, [searchTerm, chantingSounds]);

  async function fetchSoundPlaylist() {
    try {
      const res = await GetSoundPlaylistByPID(Number(p_id));
      setSoundPlaylist(res);
      console.log("sound playlist is: ", res);
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }

  async function fetchPlaylist() {
    try {
      const res = await GetPlaylistByID(Number(p_id));
      setPlaylists(res);
      // console.log("playlist is: ", res);
    } catch (error) {
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

  useEffect(() => {
    fetchPlaylist();
    fetchChanting();
    fetchSoundPlaylist();
  }, []);

  useEffect(() => {
    // console.log("playlists is: ", chantingSounds);
  }, [soundPlaylist]);

  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) {
      console.warn("YouTube URL is undefined or empty");
      return null;
    }
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    } else {
      console.warn("ไม่สามารถดึง YouTube video ID จาก URL:", url);
      return null;
    }
  };

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  async function addSoundToPlaylist(soundId: number) {
    const data: ISoundPlaylist = {
      sid: soundId,
      pid: Number(p_id),
    };
    try {
      const { status, result } = await CreateSoundPlaylist(data);
      if (status === 200) {
        message.success("เพิ่มเสียงเรียบร้อย");
        fetchSoundPlaylist();
      } else if (status === 409) {
        message.warning("เสียงนี้ถูกเพิ่มในเพลย์ลิสต์แล้ว");
      } else {
        message.error(result?.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
      // message.error();
    }
  }
  async function handleSaveName() {
    if (!playlists) return;
    try {
      const updated: IPlaylist = { name: newName };
      await UpdatePlaylist(updated, Number(p_id)); // หรือใช้ UpdatePlaylist API แทน
      console.log("Playlist updated:", updated);
      setEditMode(false);
      message.success("เปลี่ยนชื่อเพลย์ลิสต์แล้ว");
      fetchPlaylist();
    } catch (error) {
      console.error("Error updating name:", error);
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนชื่อ");
    }
  }
  function prevPage(){
    navigate(-1);
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
    <div className="flex flex-col  min-h-full max-h-fit duration-300 items-center bg-background-blue dark:bg-background-dark">
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full border flex flex-col gap-8 dark:border-stoke-dark dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] duration-300
            border-gray-200 bg-white h-full sm:rounded-xl`}
      >
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          {/* เพลยลิสต์ */}
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <button onClick={prevPage} className="cursor-pointer">
                    <ChevronLeft size={40} className="text-button-blue" />
              </button>
          
              <h1 className="text-xl font-semibold dark:text-text-dark">
                เพลยลิสต์
              </h1>
            </div>
            {/*background playlist */}
            <div>
              <img
                src={`${IMG_URL}${playlists?.picture}`}
                alt=""
                className="w-full h-[300px] object-cover rounded-2xl"
              />
              <div className="flex gap-2 items-end mt-2 relative">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                      }}
                      className="text-2xl font-semibold bg-transparent border-b-1 border-button-blue focus:outline-none dark:text-text-dark"
                    />
                    <button
                      onClick={handleSaveName}
                      className="text-button-blue bg-background-button dark:bg-background-button/20 p-1 rounded-md  font-bold text-xl "
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="text-red-500 dark:bg-red-50/20 bg-red-50 p-1 rounded-md font-bold text-xl"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-semibold dark:text-text-dark">
                      {playlists?.name}
                    </p>
                    <button
                      onClick={() => {
                        setNewName(playlists?.name || "");
                        setEditMode(true);
                      }}
                      className="bg-gray-200 rounded-full p-1 dark:bg-midnight-blue "
                    >
                      <PenLine size={20} className="dark:text-button-blue text-basic-text" />
                    </button>
                  </>
                )}
                <div>
                  <button
                    onClick={() =>
                      navigate(
                        `/audiohome/chanting/playlist/play/${p_id}/${soundPlaylist[0].sid}`
                      )
                    }
                    className="absolute right-0 top-[-20px] z-50 hover:scale-105 
    text-white font-bold text-xl p-4 rounded-full 
    bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF]
    transition-all duration-300
    dark:btn-glow-play"
                  >
                    <Play />
                  </button>
                </div>
              </div>
            </div>
            <TableSoundPlaylist
              data={soundPlaylist}
              extractYouTubeID={extractYouTubeID}
              deletedRowIds={deletedRowIds}
              DeleteSoundPlaylist={DeleteSoundPlaylist}
            />
          </div>

          {/* search sound */}
          <div className="space-y-4">
            <h1 className="text-xl text-basic-text dark:text-text-dark mt-3">เพิ่มรายการบทสวดมนต์</h1>
            <div className=" relative flex items-center md:gap-4 gap-2  w-[100%] focus-within:outline-regal-blue rounded-sm md:rounded-lg transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300">
              <Search className="absolute left-3 top-2 transform-translate-y-1/2 h-5 w-5 text-basic-blue
              dark:text-text-dark" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full  bg-[#FAFAFA] rounded-md hover:outline-regal-blue hover:outline-1 transition-colors duration-300  
               focus:border-transparent outline-regal-blue focus:outline-1
               dark:bg-chat-dark   dark:hover:border-regal-blue dark:text-white dark:hover:outline-regal-blue dark:hover:outline-1"
                placeholder="ค้นหา..."
              />
              <button
                className="bg-button-blue text-white py-2 px-4 rounded-sm md:rounded-lg"
                onClick={() => setSearchTerm("")}
              >
                ล้าง
              </button>
            </div>
            {/* สิสต์sound */}
            <SoundsCard
              data={filteredSounds}
              extractYouTubeID={extractYouTubeID}
              addSoundToPlaylist={addSoundToPlaylist}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddSoundPlaylist;
