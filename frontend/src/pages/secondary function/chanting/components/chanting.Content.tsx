import { Eye, Heart, Play } from "lucide-react";
import { Sound } from "../../../../interfaces/ISound";

interface ChantingContentProps {
    filteredSounds: Sound[];
    extractYouTubeID: (url: string) => string | null;
}


function ChantingContent({filteredSounds, extractYouTubeID}: ChantingContentProps) {
    return  (
        <div>
        <h1 className="text-xl  text-basic-text mb-4">สวดมนต์</h1>
        <div className="grid lg:grid-cols-5 sm:grid-cols-3 md:grid-cols-4 grid-cols-2 sm:gap-2 gap-1">
          {filteredSounds?.map((sound) => {
            const videoId = extractYouTubeID(sound.sound!);
            const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

            return (
              <div
                key={sound.id}
                className="bg-white w-full h-60 rounded-xl border border-gray-200 "
              >
                <div className="h-[70%] bg-blue-500 w-full rounded-t-xl relative ">
                  <img
                    src={thumbnail}
                    alt=""
                    className="w-full h-full object-center rounded-t-xl"
                  />

                  <div className="absolute  bottom-[-20px] right-3  w-12 h-12 bg-button-blue flex items-center hover:transform(200) hover:scale-105 duration-300 justify-center rounded-full shadow-sm">
                    <Play className="text-white" />
                  </div>
                  <div>
                    <Heart className="absolute top-3 right-3 text-white" />
                  </div>
                </div>
                <div className="p-2 space-y-2">
                  <div className="text-basic-text   w-[70%] line-clamp-1">
                    <h1>{sound.name}</h1>
                  </div>
                  <div className="flex justify-between text-subtitle">
                    <p>{sound.duration} min</p>
                    <div className="flex gap-2">
                      <div className="flex gap-1 items-center">
                        <Eye className="text-subtitle h-4 w-4  " />
                        <p>{sound.view}</p>
                      </div>
                      <div className="flex gap-1 items-center">
                        <Heart className="text-subtitle h-4 w-4   " />
                        <p>{sound.like_sound}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
}
export default ChantingContent