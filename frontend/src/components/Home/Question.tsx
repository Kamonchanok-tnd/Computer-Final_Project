import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import q2 from "../../assets/q2.jpg";
import q1 from "../../assets/q1.jpg";
import q3 from "../../assets/maditaion.jpg";
import q4 from "../../assets/q4.jpg";
import { Questionnaire } from "../../interfaces/IQuestionnaire";
import { fetchQuestions } from "../../services/https/assessment";
import { getAllQuestionnaires } from "../../services/https/questionnaire";



function Question() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [questionNaire, setQuestionNaire] = useState<Questionnaire[]>([]);

async function fetchQuestions() {
  const res: Questionnaire[] = await getAllQuestionnaires();
  setQuestionNaire(res);
  console.log(res);
}

useEffect(() => {
  fetchQuestions();
}, []);


  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(5);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const totalItems = questionNaire.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);
  const showPrevButton = currentIndex > 0;
  const showNextButton = currentIndex < maxIndex;

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="flex flex-col xl:px-28 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between xl:px-0 px-2">
        <p className="font-ibmthai text-2xl">แบบสอบถามทั้งหมด</p>
      </div>

      {/* Card List Carousel */}
      <div className="bg-white w-full xl:rounded-2xl md:p-4 py-4 shadow-sm relative">
        {/* Previous Button */}
        {showPrevButton && (
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-basic-text" />
          </button>
        )}

        {/* Next Button */}
        {showNextButton && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 text-basic-text" />
          </button>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex / totalItems) * 100}%)`,
              width: `${(totalItems / itemsPerView) * 100}%`,
            }}
          >
            {questionNaire.map((item) => (
              <div
                key={item.id}
                className="p-2"
                style={{ width: `${100 / itemsPerView}%` }} // แก้ไขตรงนี้
              >
                <div
                  className="border max-w-full bg-cover bg-center rounded-xl p-2 w-60 h-68 flex items-end
                  hover:scale-105 transition-all duration-500 ease-in-out bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF]"
                  style={{
                    // backgroundImage: `url(${item.image})`,
                  }}
                >
                  <div className="flex-1 flex-col space-y-2 bg-white/50 backdrop-blur-sm h-auto p-4 rounded-lg">
                    <p className="font-ibmthai text-center">{item.nameQuestionnaire}</p>
                    <div className="flex justify-center">
                      <button className="font-ibmthai bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] text-white py-1 px-4 rounded-lg">
                        เริ่มทำแบบทดสอบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Question;