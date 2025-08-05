import { CirclePlus, Clock, Eye, Heart } from "lucide-react";
import { Sound } from "../../../../../interfaces/ISound";

interface SoundDataprops {
    data : Sound[]
    extractYouTubeID : (url: string) => string | null
    addSoundToPlaylist : (soundId: number) => void

}
function SoundsCardmeditation({ data , extractYouTubeID, addSoundToPlaylist   }: SoundDataprops) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((sound) => {
    
            const soundId = extractYouTubeID(sound.sound!);
            const thumbnail = `https://img.youtube.com/vi/${soundId}/mqdefault.jpg`;

            return(
            <div
            key={sound.ID}
            className="bg-white w-full h-25 border-gray-200 border rounded-lg   flex  gap-4"
            >
            <img
                src={thumbnail}
                alt={sound.name}
                className="w-24 h-full object-cover rounded-l-lg "
            />
            <div className="flex flex-col w-[50%] justify-between p-2">
                <div>
                <h1 className="text-lg font-medium  truncate ">{sound.name}</h1>
                 <p className="text-sm truncate">{sound.owner}</p>  
                </div>
                
                 <div className="flex gap-4">
                    <div className="flex gap-2">
                        <Clock size={20}/>
                        <p>{sound.duration}</p>
                    </div>
                    <div className="flex gap-2">
                        <Eye size={20}/>
                        <p>{sound.view}</p>
                    </div>
                    <div className="flex gap-2">
                        <Heart size={20}/>
                        <p>{sound.duration}</p>
                    </div>
                    
                 </div>
                 
            </div>
            <div className="flex items-center justify-center w-full">
                <button onClick={() => addSoundToPlaylist(Number(sound.ID))}>
                    <CirclePlus size={30}/>
                </button>
                  
                 </div>
           
           
            </div>
        )})}
        </div>
    )
}   
export default SoundsCardmeditation