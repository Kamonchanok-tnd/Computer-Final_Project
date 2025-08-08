import { CirclePlus, Clock, Eye, Heart } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";

interface SoundDataprops {
    data : Sound[]
    extractYouTubeID : (url: string) => string | null
    addSoundToPlaylist : (soundId: number) => void

}
function SoundsCard({ data , extractYouTubeID, addSoundToPlaylist   }: SoundDataprops) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 ">
        {data.map((sound) => {
    
            const soundId = extractYouTubeID(sound.sound!);
            const thumbnail = `https://img.youtube.com/vi/${soundId}/mqdefault.jpg`;

            return(
            <div
            key={sound.ID}
            className="bg-white dark:bg-box-dark w-full h-18 dark:border-stoke-dark  border-gray-200 border rounded-lg   flex justify-between  gap-2"
            >
            <img
                src={thumbnail}
                alt={sound.name}
                className="md:w-24 lg:w-20 h-full object-cover w-[30%] rounded-l-lg "
            />
            <div className="flex flex-col w-[50%]  justify-center  p-2">
                <div>
                <h1 className="text-md font-medium  truncate text-basic-text dark:text-text-dark">{sound.name}</h1>
                 <p className="text-sm truncate text-basic-text dark:text-text-dark">{sound.owner}</p>  
                </div>
                
                <div className="flex gap-2  ">
                        <div className="flex gap-1 text-sm items-center text-text-basic dark:text-text-dark">
                        <Clock size={14} />
                        <p>{sound.duration}</p>
                        </div>
                        <div className="flex gap-1 text-sm items-center text-text-basic dark:text-text-dark">
                        <Eye size={14} />
                        <p>{sound.view}</p>
                        </div>
                        <div className="flex gap-1 text-sm items-center text-text-basic dark:text-text-dark">
                        <Heart size={14} />
                        <p>{sound.duration}</p>
                        </div>
                    </div>
                 
            </div>
            <div className="flex items-center justify-center  mr-4 md:mr-1">
                <button onClick={() => addSoundToPlaylist(Number(sound.ID))}>
                    <CirclePlus size={20} className="text-gray-600 dark:text-text-dark hover:text-button-blue transition-all duration-300"/>
                </button>
                  
                 </div>
           
           
            </div>
        )})}
        </div>
    )
}   
export default SoundsCard