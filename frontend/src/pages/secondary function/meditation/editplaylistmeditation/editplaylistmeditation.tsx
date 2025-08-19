// import {  useEffect, useState } from "react";
// import { useParams,useNavigate } from "react-router-dom";
// import {
//   GetPlaylistByID,
//   IMG_URL,
//   UpdatePlaylist,
// } from "../../../../services/https/playlist";
// import {
//   Check,
//   ChevronLeft,
//   PenLine,
//   Search,
//   X,
// } from "lucide-react";
// import { IPlaylist } from "../../../../interfaces/IPlaylist";
// import { Sound } from "../../../../interfaces/ISound";
// import { getSoundsByTypeID } from "../../../../services/https/sounds";
// import { ISoundPlaylist } from "../../../../interfaces/ISoundPlaylist";
// // import { IBackground } from "../../../../interfaces/IBackground";
// import {
//   CreateSoundPlaylist,
//   DeleteSoundPlaylistByID,
//   GetSoundPlaylistByPID,
// } from "../../../../services/https/soundplaylist";
// import { message } from "antd";


// import SoundsCardmeditation from "./components/soundcardmeditation";

// import TableSoundPlaylist from "./components/tableplaylistmeditation";
// export interface CustomPlaylist extends IPlaylist {
//   picture: string;
// }

// export interface CustomSoundPlaylist extends ISoundPlaylist {
//   name?: string;
//   sound?: string;
//   owner?: string;
//   duration?: number;
// }
// function AddSoundPlaylistMeditation() {
//   const params = useParams();
//   const p_id = params.id;
//   const [playlists, setPlaylists] = useState<CustomPlaylist | null>(null);
//   const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [filteredSounds, setFilteredSounds] = useState<Sound[]>([]);
//   const [soundPlaylist, setSoundPlaylist] = useState<CustomSoundPlaylist[]>([]);

//   const [deletedRowIds, setDeletedRowIds] = useState<number[]>([]);
//   const [editMode, setEditMode] = useState<boolean>(false);
//   const [newName, setNewName] = useState<string>("");
//   const navigate = useNavigate();

//   async function DeleteSoundPlaylist(id: number) {
//     try {
//       await DeleteSoundPlaylistByID(id);
//       message.success("ลบเพลย์ลิสต์แล้ว");
//       setDeletedRowIds((prev) => [...prev, id]);
//       fetchSoundPlaylist();
//     }catch (error) {
//       console.error("Error deleting playlist:", error);
//     }
//   }
//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredSounds(chantingSounds);
//     } else {
//       const filtered = chantingSounds.filter(
//         (sound) =>
//           sound.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           sound.owner?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredSounds(filtered);
//     }
//   }, [searchTerm, chantingSounds]);

//   async function fetchSoundPlaylist() {
//     try {
//       const res = await GetSoundPlaylistByPID(Number(p_id));
//       setSoundPlaylist(res);
//       console.log("sound playlist is: ", res);
//     } catch (error) {
//       console.error("Error fetching playlist:", error);
//     }
//   }

//   async function fetchPlaylist() {
//     try {
//       const res = await GetPlaylistByID(Number(p_id));
//       setPlaylists(res);
//       // console.log("playlist is: ", res);
//     } catch (error) {
//       console.error("Error fetching playlist:", error);
//     }
//   }
//   async function fetchChanting() {
//     try {
//       const res = await getSoundsByTypeID(2);

//       setChantingSounds(res.sounds); // สำคัญ! ต้องใช้ res.sounds ตามโครงสร้าง
//     } catch (error) {
//       console.error("Error fetching chanting sounds:", error);
//     }
//   }

//   useEffect(() => {
//     fetchPlaylist();
//     fetchChanting();
//     fetchSoundPlaylist();
//   }, []);

//   useEffect(() => {
//     // console.log("playlists is: ", chantingSounds);
//   }, [soundPlaylist]);



//   const extractYouTubeID = (url: string): string | null => {
//     const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//     const match = url.match(regex);
//     return match ? match[1] : null;
//   };

//   async function addSoundToPlaylist(soundId: number) {
//     const data: ISoundPlaylist = {
//       sid: soundId,
//       pid: Number(p_id),
//     };
//     try {
//       const res = await CreateSoundPlaylist(data);
//       console.log("playlist is: ", res);
//       console.log("playlist is: ", data);
//       message.success("เพิ่มเสียงเรียบร้อย");
//       fetchSoundPlaylist();
//     } catch (error) {
//       console.error("Error fetching playlist:", error);
//     }
//   }
//   async function handleSaveName() {
//   if (!playlists) return;
//   try {
//     const updated: IPlaylist = {
//       ...playlists,     // ดึงข้อมูลที่มีอยู่
//       name: newName,    // แก้ชื่อใหม่
//     };

//     await UpdatePlaylist(updated, Number(p_id));
//     console.log("Playlist updated:", updated);
//     setEditMode(false);
//     message.success("เปลี่ยนชื่อเพลย์ลิสต์แล้ว");
//     fetchPlaylist();
//   } catch (error) {
//     console.error("Error updating name:", error);
//     message.error("เกิดข้อผิดพลาดในการเปลี่ยนชื่อ");
//   }
// }


//   return (
//     <div className="flex flex-col h-full duration-300 items-center bg-background-blue dark:bg-background-dark">
//       <div
//         className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full border flex flex-col gap-8 dark:border-stoke-dark dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] duration-300
//             border-gray-200 bg-white h-full sm:rounded-xl`}
//       >
//         <div className="grid grid-cols-2 gap-12">
//           {/* เพลยลิสต์ */}
//           <div className="space-y-4">
//             <div className="flex gap-4 items-center">
//              <ChevronLeft
//                 size={40}
//                 className="text-button-blue cursor-pointer"
//                 onClick={() => navigate("/audiohome/meditation")} // ✅ เพิ่ม onClick
//               />
//               <h1 className="text-xl font-semibold">เพลยลิสต์</h1>
//             </div>
//             {/*background playlist */}
//             <div>
//               <img
//                 src={`${IMG_URL}${playlists?.picture}`}
//                 alt=""
//                 className="w-full h-[300px] object-cover rounded-2xl"
//               />
//               <div className="flex gap-4 items-end">
//                 {editMode ? (
//                   <>
//                     <input
//   type="text"
//   value={newName}
//   onChange={(e) => setNewName(e.target.value)}
//   onKeyDown={(e) => {
//     if (e.key === "Enter") handleSaveName();
//   }}
//   className="text-4xl font-semibold bg-transparent border-b-2 border-gray-400 focus:outline-none"
//   placeholder="เปลี่ยนชื่อเพลย์ลิสต์"
//   aria-label="เปลี่ยนชื่อเพลย์ลิสต์"
// />

//                     <button
//   type="button"
//   onClick={handleSaveName}
//   className="text-green-600 font-bold text-xl"
//   aria-label="บันทึกชื่อเพลย์ลิสต์"
//   title="บันทึกชื่อเพลย์ลิสต์"
// >
//   <Check />
// </button>

//                     <button
//   type="button"
//   onClick={() => setEditMode(false)}
//   className="text-red-500 font-bold text-xl"
//   aria-label="ยกเลิกการแก้ไขชื่อ"
//   title="ยกเลิก"
// >
//   <X />
// </button>

//                   </>
//                 ) : (
//                   <>
//                     <p className="text-4xl font-semibold">{playlists?.name}</p>
//                     <button
//   type="button"
//   onClick={() => {
//     setNewName(playlists?.name || "");
//     setEditMode(true);
//   }}
//   aria-label="แก้ไขชื่อเพลย์ลิสต์"
//   title="แก้ไขชื่อ"
// >
//   <PenLine size={30} />
// </button>

//                   </>
//                 )}
//               </div>
//             </div>
//             <TableSoundPlaylist
//               data={soundPlaylist}
//               extractYouTubeID={extractYouTubeID}
//               deletedRowIds={deletedRowIds}
//               DeleteSoundPlaylist={DeleteSoundPlaylist}
//             />
//           </div>

//           {/* search sound */}
//           <div className="space-y-4">
//             <h1 className="text-xl mt-3">เพิ่มรายการเสียง</h1>
//             <div className="relative flex items-center gap-4   w-[70%] focus-within:outline-regal-blue rounded-lg transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300">
//               <Search className="absolute left-3 top-2 transform-translate-y-1/2 h-5 w-5 text-basic-blue" />
//               <input
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 w-full   bg-[#FAFAFA] rounded-xl hover:outline-regal-blue hover:outline-1 transition-colors duration-300   focus:border-transparent outline-regal-blue focus:outline-1"
//                 placeholder="ค้นหา..."
//               />
//               <button
//                 className="bg-button-blue text-white py-2 px-4 rounded-xl"
//                 onClick={() => setSearchTerm("")}
//               >
//                 ล้าง
//               </button>
//             </div>
//             {/* สิสต์sound */}
//             <SoundsCardmeditation
//               data={filteredSounds}
//               extractYouTubeID={extractYouTubeID}
//               addSoundToPlaylist={addSoundToPlaylist}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// export default AddSoundPlaylistMeditation;


import {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  
  DeletePlaylistByID,
  GetPlaylistByID,
  UpdatePlaylist,
} from "../../../../services/https/playlist";
import {
  Check,
  ChevronLeft,
  Images,
  PenLine,
  Play,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { IPlaylist } from "../../../../interfaces/IPlaylist";
import { Sound } from "../../../../interfaces/ISound";
import { getSoundsByTypeID } from "../../../../services/https/sounds";
import { ISoundPlaylist } from "../../../../interfaces/ISoundPlaylist";
import {
  CreateSoundPlaylist,
  DeleteSoundPlaylistByID,
  DeleteSoundPlaylistByPID,
  GetSoundPlaylistByPID,
} from "../../../../services/https/soundplaylist";
import { message, Tooltip } from "antd";
// import SoundsCard from "../.././Component/SoundsCard";
import SoundsCard from "../../Playlist/Component/SoundsCard";
// import TableSoundPlaylist from "./Component/tableSoundPlaylist";
import TableSoundPlaylist from "../../Playlist/Component/tableSoundPlaylist";
// import NoData from "./Component/noSoundplaylist";
import NoData from "../../Playlist/Component/noSoundplaylist";
// import ClearPlaylistModal from "./Component/ClearPlaylistModal";
import ClearPlaylistModal from "../../Playlist/Component/ClearPlaylistModal";
import { GetBackground } from "../../../../services/https/background";
// import BackgroundPlaylist from "./Component/background";
import BackgroundPlaylist from "../../Playlist/Component/background";
import { IBackground } from "../../../../interfaces/IBackground";
// import DeleteConfirmModal from "./Component/DeleteConfirmModal";
import DeleteConfirmModal from "../../Playlist/Component/DeleteConfirmModal";

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
function AddSoundPlaylistMeditation() {
  const params = useParams();
  const p_id = params.id;
  const [playlists, setPlaylists] = useState<CustomPlaylist | null>(null);
  const [chantingSounds, setChantingSounds] = useState<Sound[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([]);
  const [soundPlaylist, setSoundPlaylist] = useState<CustomSoundPlaylist[]>([]);
  // const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [deletedRowIds, setDeletedRowIds] = useState<number[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const navigate = useNavigate();
  const [showPreview,setShowPreview] = useState(false)//mode preview
  const [currentBackgrounds, setCurrentBackgrounds] = useState<string>("");
  const [selectedPicture, setSelectedPicture] = useState<string>("");
  const [selectedID , setSelectedID] = useState<number | null>(null);
  const [allPicture, setAllPicture] = useState<IBackground[]>([]);

  const [openDeletePlaylist, setOpenDeletePlaylist] = useState(false);
  const [loading, setLoading] = useState(false);
 
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
      setCurrentBackgrounds(res.picture);
      setSelectedPicture(res.picture);
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
    GetBg();
  }, []);

  useEffect(() => {
    // console.log("playlists is: ", chantingSounds);
  }, [soundPlaylist]);

  // const getYouTubeEmbedUrl = (url?: string): string | null => {
  //   if (!url) {
  //     console.warn("YouTube URL is undefined or empty");
  //     return null;
  //   }
  //   const regExp =
  //     /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  //   const match = url.match(regExp);

  //   if (match && match[1]) {
  //     return `https://www.youtube.com/embed/${match[1]}`;
  //   } else {
  //     console.warn("ไม่สามารถดึง YouTube video ID จาก URL:", url);
  //     return null;
  //   }
  // };

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
  function prevPage() {
    navigate(-1);
  }

  function topPage() {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // เลื่อนแบบนุ่ม ๆ
    });
  }

  useEffect(() => {
    topPage();
  }, []);

  //clear playlist
  async function clearPlaylist() {
    try {
      await DeleteSoundPlaylistByPID(Number(p_id));
      message.success("ลบเพลย์ลิสต์แล้ว");
      fetchSoundPlaylist();
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  }

  async function GetBg(){
    try {
      const res = await GetBackground();
      setAllPicture(res)
     
    } catch (error) {
      console.error("Error fetching backgrounds:", error);
    }
  }

  const handlePictureSelect = (picture: IBackground) => {
    setSelectedPicture(picture.Picture);
    setSelectedID(picture.ID);
  };
  async function changeBg(b_id:number){ {

    try {
      const updated: IPlaylist = { bid: b_id };
      await UpdatePlaylist(updated, Number(p_id)); // หรือใช้ UpdatePlaylist API แทน
      console.log("Playlist updated:", updated);
      setEditMode(false);
      message.success("เปลียนพื้นหลังเพลย์ลิสต์แล้ว");
      fetchPlaylist();
    } catch (error) {
      console.error("Error updating name:", error);
      message.error("เกิดข้อผิดพลาดในการเปลี่ยนพื้นหลัง");
    }
  }
}

 async function DeletePlaylist() {
    try {
      await DeletePlaylistByID(Number(p_id));
      message.success("ลบเพลย์ลิสต์แล้ว");
      setTimeout(() => {
        navigate("/audiohome/chanting");
      })
      
    } catch (error) {
      console.error("Error deleting playlist:", error);
      message.error("เกิดข้อผิดพลาดในการลบเพลย์ลิสต์");
    }finally{
      setLoading(false);
      setOpenDeletePlaylist(false)
    }
  }

  
  

  return (
    <div className="flex flex-col  min-h-full max-h-fit duration-300 items-center bg-background-blue dark:bg-background-dark ">
      <div
        className={`sm:mt-2 sm:py-4 px:2 py-2 px-1 sm:px-8 sm:w-[95%] w-full  flex flex-col gap-8 dark:border-stoke-dark dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] duration-300
            bg-transparent  sm:rounded-xl  min-h-[90vh] max-h-fit `}
      >
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 min-h-[85vh]   h-full">
          {/* เพลยลิสต์ */}
          <div className="space-y-4  bg-white dark:bg-background-dark rounded-2xl shadow-sm px-4 py-2 flex flex-col">
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
              {/* ปก playlist */}
              <BackgroundPlaylist currentBackgrounds={currentBackgrounds.toString() ?? ''} showPreview={showPreview} AllPicture={allPicture}
              selectedPicture={selectedPicture} handlePictureSelect={handlePictureSelect} changeBg={changeBg}/>

<div className="flex items-center mt-2 relative  justify-between">
  {/* ชื่อ playlist และ edit */}
  <div className="flex gap-2 items-end">
    {editMode ? (
      <div className="flex gap-2">
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
          className="text-button-blue bg-background-button dark:bg-background-button/20 p-2 rounded-md font-bold text-xl"
        >
          <Check size={20} />
        </button>
        <button
          onClick={() => setEditMode(false)}
          className="text-red-500 dark:bg-red-50/20 bg-red-50 p-2 rounded-md font-bold text-xl"
        >
          <X size={20} />
        </button>
      </div>
    ) : (
      <div className="flex gap-2">
        <p className="ml-4 text-2xl font-semibold dark:text-text-dark">
          {playlists?.name}
        </p>
        <button
          onClick={() => {
            setNewName(playlists?.name || "");
            setEditMode(true);
          }}
          className="bg-gray-200 rounded-full p-2 dark:bg-midnight-blue"
        >
          <PenLine
            size={20}
            className="dark:text-button-blue text-basic-text"
          />
        </button>
      </div>
    )}
  </div>
    {/* ปุ่ม Play อยู่ขวาบน absolute */}
    <button
    onClick={() =>
      navigate(
        `/audiohome/chanting/playlist/play/${p_id}/${soundPlaylist[0].sid}`
      )
    }
    className="absolute -top-5 right-0 z-50 hover:scale-105 
      text-white font-bold text-xl p-4 rounded-full 
      bg-gradient-to-tl from-[#BBF0FC] to-[#5DE2FF]
      transition-all duration-300
      dark:btn-glow-play"
  >
    <Play />
  </button>

  {/* ปุ่ม Clear / Image อยู่ทางขวา */}
  <div className="flex gap-2 items-center pr-20">
    {
       soundPlaylist && soundPlaylist.length > 0 && (
        <>
         <ClearPlaylistModal pid={Number(p_id)} onConfirm={clearPlaylist} />
        </>
      )
    }

   
    {!showPreview ? (
       <Tooltip placement="top" title="เปลี่ยนภาพพื้นหลัง" color="#5DE2FF">
      <button
        className="dark:text-text-dark dark:hover:bg-midnight-blue dark:hover:text-button-blue transition-colors duration-300
         p-2 rounded-full hover:bg-background-button hover:text-blue-word"
        onClick={() => setShowPreview(!showPreview)}
      >
        <Images size={20} />
      </button>
      </Tooltip>
    ) : (
      <div className="flex gap-2">
        <button
          className="text-blue-word dark:text-blue-word py-1 px-2 rounded-md bg-background-button
          dark:bg-midnight-blue/50"
          onClick={() => selectedID !== null && changeBg(selectedID)}
        >
          ยืนยัน
        </button>
        <button
          className="text-red-500"
          onClick={() => setShowPreview(!showPreview)}
        >
          ยกเลิก
        </button>
      </div>
    )}
       
   
  </div>
</div>

            </div>
            <div className=" flex-1">
              {!soundPlaylist || soundPlaylist.length === 0 ? (
                <NoData message="ไม่มีบทสวดมนต์ในเพลย์ลิสต์" />
              ) : (
                <TableSoundPlaylist
                  data={soundPlaylist}
                  extractYouTubeID={extractYouTubeID}
                  deletedRowIds={deletedRowIds}
                  DeleteSoundPlaylist={DeleteSoundPlaylist}
                />
              )}
            </div>
          </div>

          {/* search sound */}
          <div className="space-y-4">
            <h1 className="text-xl text-basic-text dark:text-text-dark mt-3">
              เพิ่มรายการบทสวดมนต์
            </h1>
            <div className=" relative flex items-center md:gap-4 gap-2  w-[100%] focus-within:outline-regal-blue rounded-sm md:rounded-lg transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300">
              <Search
                className="absolute left-3 top-2 transform-translate-y-1/2 h-5 w-5 text-basic-blue
              dark:text-text-dark"
              />
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
export default AddSoundPlaylistMeditation;
