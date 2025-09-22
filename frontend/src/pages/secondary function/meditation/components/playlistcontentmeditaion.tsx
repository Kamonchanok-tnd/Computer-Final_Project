import { IMG_URL } from "../../../../services/https/playlist"
import { CustomPlaylist } from "../../Playlist/Playlist"

interface PlaylistContentProps {
    Playlist : CustomPlaylist[]
    GotoPlaylist : (id : number) => void
}

function PlaylistContent({Playlist, GotoPlaylist}: PlaylistContentProps) {
    return(
        <div>
        <h1 className="text-xl text-basic-text mb-4">เพลยลิสต์ของฉัน</h1>
        <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
          {
            Playlist?.map((playlist) => (
               <div
               key={playlist.ID}
                className="bg-white w-full h-15 rounded-md border border-gray-200 flex gap-2">
            <img
  className="h-full w-18 rounded-tl-md rounded-bl-md"
  src={`${IMG_URL}${playlist.picture}`}
  alt={playlist.name} // Add this line
/>
            <div className="h-full w-full flex items-center justify-start">
              <button onClick={() => GotoPlaylist(Number(playlist.ID))}>
                 <p className="text-basic-text font-bold">{playlist.name}</p>
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