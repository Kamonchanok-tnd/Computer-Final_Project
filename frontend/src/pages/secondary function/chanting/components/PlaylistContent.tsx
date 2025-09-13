import { EllipsisVertical, Play, Trash2 } from "lucide-react"
import { DeletePlaylistByID, IMG_URL } from "../../../../services/https/playlist"
import { CustomPlaylist } from "../../Playlist/Playlist"
import { Dropdown, MenuProps, message } from "antd"
import { useState } from "react"
import DeleteConfirmModal from "../../Playlist/Component/DeleteConfirmModal"

interface PlaylistContentProps {
    Playlist : CustomPlaylist[]
    GotoPlaylist : (id : number) => void
    gotoPlaylistmedia : (id : number) => void
    fetchPlaylist: () => void
}


function PlaylistContent({Playlist, GotoPlaylist, gotoPlaylistmedia, fetchPlaylist}: PlaylistContentProps) {
  const [openDeletePlaylist, setOpenDeletePlaylist] = useState(false);
  const [loading, setLoading] = useState(false);
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
      fetchPlaylist()
    }
  }

    return(
        <div className="font-ibmthai " >
      <h1 className="text-xl text-basic-text dark:text-text-dark mb-4">เพลยลิสต์ของฉัน</h1>
      <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
          {
            Playlist?.map((playlist) =>{

          const items: MenuProps["items"] = [
            {
              key: "play",
              label: (
                <div
                  className="flex items-center gap-2 font-ibmthai"
                  onClick={(e) => {
                    e.stopPropagation();
                    gotoPlaylistmedia(Number(playlist.ID));
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

            return(
            <div
              key={playlist.ID}
               
                className="group bg-white w-full h-15 rounded-md shadow-sm  flex gap-2  transition-all duration-300
                dark:bg-box-dark dark:border-stoke-dark dark:text-text-dark dark:border dark:shadow-dark
                ">
            <img className="h-full w-18 rounded-tl-md rounded-bl-md" src={`${IMG_URL}${playlist.picture}`} />
          
              <div className="h-full w-full flex items-center justify-between">
              <button onClick={() => GotoPlaylist(Number(playlist.ID))} className="cursor-pointer  h-full">
                 <p className="text-basic-text font-bold ">{playlist.name}</p>
              </button>
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
                  onConfirm={() => DeletePlaylist(Number(playlist.ID))}
                  onCancel={() => setOpenDeletePlaylist(false)}
          loading={loading}
        />
      </div>
    </div>
            )})
}

        </div>
      </div>
    )
}
export default PlaylistContent;

