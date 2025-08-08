import { Play } from "lucide-react"
import { IPlaylist } from "../../../../interfaces/IPlaylist"
import { IMG_URL } from "../../../../services/https/playlist"
import { CustomPlaylist } from "../../Playlist/Playlist"

interface PlaylistContentProps {
    Playlist : CustomPlaylist[]
    GotoPlaylist : (id : number) => void
    gotoPlaylistmedia : (id : number) => void
}

function PlaylistContent({Playlist, GotoPlaylist, gotoPlaylistmedia}: PlaylistContentProps) {
    return(
        <div>
        <h1 className="text-xl text-basic-text dark:text-text-dark mb-4">เพลยลิสต์ของฉัน</h1>
        <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
          {
            Playlist?.map((playlist) => (
               <div
               key={playlist.ID}
                className="group bg-white w-full h-15 rounded-md border border-gray-200 flex gap-2  transition-all duration-300
                dark:bg-box-dark dark:border-stoke-dark dark:text-text-dark
                ">
            <img className="h-full w-18 rounded-tl-md rounded-bl-md" src={`${IMG_URL}${playlist.picture}`} />
          
            <div className="h-full w-full flex items-center justify-between">
              <button onClick={() => GotoPlaylist(Number(playlist.ID))} className="cursor-pointer">
                 <p className="text-basic-text font-bold">{playlist.name}</p>
              </button>
              <button 
              onClick={() => gotoPlaylistmedia(Number(playlist.ID))}
              className="  right-3 w-10 h-10 bg-button-blue flex items-center justify-center rounded-full shadow-lg text-white
    relative overflow-visible
    opacity-0 scale-75 translate-y-1
    group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 
    transition-all duration-300 ease-out
    dark:before:content-[''] dark:before:absolute dark:before:-inset-0 dark:before:rounded-full
    dark:before:bg-blue-400 dark:before:blur-xl dark:before:opacity-50 dark:before:z-[-1]">
  <Play className="w-4 h-4"/>
</button>
            </div>
          </div>
            ))
          }
         
        </div>
      </div>
    )
}
export default PlaylistContent