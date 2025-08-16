import { useEffect, useState } from "react";
import { IBackground } from "../../../../interfaces/IBackground";
import { IMG_URL } from "../../../../services/https/playlist";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BackgroundPlaylistProps{
  currentBackgrounds: string;
  showPreview?: boolean;
  AllPicture?:IBackground[]
  selectedPicture?:string
  handlePictureSelect?: (picture: IBackground) => void;
  changeBg?: (b_id:number) => void

  
   
}

function BackgroundPlaylist({currentBackgrounds, showPreview, AllPicture, selectedPicture, handlePictureSelect, changeBg}: BackgroundPlaylistProps){
  useEffect(() => {
    console.log(selectedPicture);
  }, [selectedPicture]); 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    console.log(selectedPicture);
  }, [selectedPicture]);

  // Calculate responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const totalItems = AllPicture?.length || 0;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleImageSelect = (item: IBackground) => {
    handlePictureSelect && handlePictureSelect(item);
  };
  return(
        <div className="relative cursor-pointer rounded-2xl overflow-hidden transition-transform duration-300">
      {showPreview ? (
        <div className="space-y-4">
          {/* Main preview image */}
          <div className="relative">
            <img
              src={`${IMG_URL}${selectedPicture}`}
              alt="Selected background"
              className="w-full h-[300px] object-cover rounded-2xl transform hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
            
          </div>

          {/* Carousel section */}
          <div className="relative bg-background-button/20 dark:bg-chat-dark backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="dark:text-text-dark font-medium text-basic-text text-lg">เลือกรูปพื้นหลัง</h4>
              <div className="flex gap-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-full dark:bg-white/10 dark:hover:bg-white/20  bg-background-button 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 dark:text-white text-blue-word" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex >= maxIndex}
                  className="p-2 rounded-full dark:bg-white/10 dark:hover:bg-white/20 bg-background-button 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 dark:text-white text-blue-word" />
                </button>
              </div>
            </div>

            {/* Carousel container */}
            <div className="relative overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                  width: `${(totalItems / itemsPerView) * 100}%`
                }}
              >
                {AllPicture?.map((item) => {
                  const isSelected = selectedPicture === item.Picture;
                  return (
                    <div
                      key={item.ID}
                      className="relative group cursor-pointer"
                      style={{ width: `${100 / totalItems}%` }}
                      onClick={() => handleImageSelect(item)}
                    >
                      <div className="p-1">
                        <img
                          src={`${IMG_URL}${item.Picture}`}
                          alt={item.Name || `Background ${item.ID}`}
                          className={`w-full h-20 object-cover rounded-lg transform hover:scale-105 transition-all duration-300 ${
                            isSelected 
                              ? 'ring-2 ring-button-blue' 
                              : 'hover:ring-2 hover:ring-white/30'
                          }`}
                        />
                        
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-3 h-3 bg-button-blue rounded-full border-2 border-white shadow-lg" />
                        )}
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-1 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium text-black">
                            {item.Name || 'Select'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center mt-3 gap-1">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    currentIndex === index 
                      ? 'dark:bg-white bg-button-blue' 
                      : 'dark:bg-white/30 dark:hover:bg-white/50 bg-button-blue/30 hover:bg-button-blue/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <img
            src={`${IMG_URL}${currentBackgrounds}`}
            alt="Current background"
            className="w-full h-[300px] object-cover rounded-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
    )
}

export default BackgroundPlaylist