import {  useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import {
  GetPlaylistByID,
  IMG_URL,
  UpdatePlaylist,
} from "../../../../services/https/playlist";
import {
  Check,
  ChevronLeft,
  PenLine,
  Search,
  X,
} from "lucide-react";
import { IPlaylist } from "../../../../interfaces/IPlaylist";
import { Sound } from "../../../../interfaces/ISound";
import { getSoundsByTypeID } from "../../../../services/https/sounds";
import { ISoundPlaylist } from "../../../../interfaces/ISoundPlaylist";
// import { IBackground } from "../../../../interfaces/IBackground";
import {
  CreateSoundPlaylist,
  DeleteSoundPlaylistByID,
  GetSoundPlaylistByPID,
} from "../../../../services/https/soundplaylist";
import { message } from "antd";


import SoundsCardmeditation from "./components/soundcardmeditation";

import TableSoundPlaylist from "./components/tableplaylistmeditation";
export interface CustomPlaylist extends IPlaylist {
  picture: string;
}

export interface CustomSoundPlaylist extends ISoundPlaylist {
  name?: string;
  sound?: string;
  owner?: string;
  duration?: number;
}
function AddSoundPlaylistMeditation() {
  const params = useParams();
  const p_id = params.id;
  const [playlists, setPlaylists] = useState<CustomPlaylist | null>(null);
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([]);
  const [soundPlaylist, setSoundPlaylist] = useState<CustomSoundPlaylist[]>([]);

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
    }catch (error) {
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
      const res = await getSoundsByTypeID(2);

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
      const res = await CreateSoundPlaylist(data);
      console.log("playlist is: ", res);
      console.log("playlist is: ", data);
      message.success("เพิ่มเสียงเรียบร้อย");
      fetchSoundPlaylist();
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }
  async function handleSaveName() {
  if (!playlists) return;
  try {
    const updated: IPlaylist = {
      ...playlists,     // ดึงข้อมูลที่มีอยู่
      name: newName,    // แก้ชื่อใหม่
    };

    await UpdatePlaylist(updated, Number(p_id));
    console.log("Playlist updated:", updated);
    setEditMode(false);
    message.success("เปลี่ยนชื่อเพลย์ลิสต์แล้ว");
    fetchPlaylist();
  } catch (error) {
    console.error("Error updating name:", error);
    message.error("เกิดข้อผิดพลาดในการเปลี่ยนชื่อ");
  }
}


  return (
    <div className="flex flex-col h-full duration-300 items-center bg-background-blue dark:bg-background-dark">
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full border flex flex-col gap-8 dark:border-stoke-dark dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] duration-300
            border-gray-200 bg-white h-full sm:rounded-xl`}
      >
        <div className="grid grid-cols-2 gap-12">
          {/* เพลยลิสต์ */}
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
             <ChevronLeft
                size={40}
                className="text-button-blue cursor-pointer"
                onClick={() => navigate("/audiohome/meditation")} // ✅ เพิ่ม onClick
              />
              <h1 className="text-xl font-semibold">เพลยลิสต์</h1>
            </div>
            {/*background playlist */}
            <div>
              <img
                src={`${IMG_URL}${playlists?.picture}`}
                alt=""
                className="w-full h-[300px] object-cover rounded-2xl"
              />
              <div className="flex gap-4 items-end">
                {editMode ? (
                  <>
                    <input
  type="text"
  value={newName}
  onChange={(e) => setNewName(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handleSaveName();
  }}
  className="text-4xl font-semibold bg-transparent border-b-2 border-gray-400 focus:outline-none"
  placeholder="เปลี่ยนชื่อเพลย์ลิสต์"
  aria-label="เปลี่ยนชื่อเพลย์ลิสต์"
/>

                    <button
  type="button"
  onClick={handleSaveName}
  className="text-green-600 font-bold text-xl"
  aria-label="บันทึกชื่อเพลย์ลิสต์"
  title="บันทึกชื่อเพลย์ลิสต์"
>
  <Check />
</button>

                    <button
  type="button"
  onClick={() => setEditMode(false)}
  className="text-red-500 font-bold text-xl"
  aria-label="ยกเลิกการแก้ไขชื่อ"
  title="ยกเลิก"
>
  <X />
</button>

                  </>
                ) : (
                  <>
                    <p className="text-4xl font-semibold">{playlists?.name}</p>
                    <button
  type="button"
  onClick={() => {
    setNewName(playlists?.name || "");
    setEditMode(true);
  }}
  aria-label="แก้ไขชื่อเพลย์ลิสต์"
  title="แก้ไขชื่อ"
>
  <PenLine size={30} />
</button>

                  </>
                )}
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
            <h1 className="text-xl mt-3">เพิ่มรายการเสียง</h1>
            <div className="relative flex items-center gap-4   w-[70%] focus-within:outline-regal-blue rounded-lg transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300">
              <Search className="absolute left-3 top-2 transform-translate-y-1/2 h-5 w-5 text-basic-blue" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full   bg-[#FAFAFA] rounded-xl hover:outline-regal-blue hover:outline-1 transition-colors duration-300   focus:border-transparent outline-regal-blue focus:outline-1"
                placeholder="ค้นหา..."
              />
              <button
                className="bg-button-blue text-white py-2 px-4 rounded-xl"
                onClick={() => setSearchTerm("")}
              >
                ล้าง
              </button>
            </div>
            {/* สิสต์sound */}
            <SoundsCardmeditation
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
export default AddSoundPlaylistMeditation;
