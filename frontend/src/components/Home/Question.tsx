import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
// import q2 from "../../assets/q2.jpg";
// import q1 from "../../assets/q1.jpg";
// import q3 from "../../assets/maditaion.jpg";
// import q4 from "../../assets/q4.jpg";
import { Questionnaire } from "../../interfaces/IQuestionnaire";
// import { fetchQuestions } from "../../services/https/assessment";
import { getAllQuestionnaires } from "../../services/https/questionnaire";


// import { ChevronRight } from "lucide-react";
// import q1 from "../../assets/assessment/depression.png";
// import q2 from "../../assets/assessment/depression1.png";
// import q3 from "../../assets/assessment/Mindfulness.png";
// import q4 from "../../assets/assessment/happy.png";
// import q5 from "../../assets/assessment/ST5.png";


// const card = [
//   {
//     id: 1,
//     name: "แบบคัดกรองโรคซึมเศร้า 2Q",
//     image: q1,
//   },
//   {
//     id: 2,
//     name: "แบบคัดกรองโรคซึมเศร้า 9Q",
//     image: q2,
//   },
//   {
//     id: 3,
//     name: "แบบวัดระดับสติ (State Mindfulness)",
//     image: q3,
//   },
//   {
//     id: 4,
//     name: "แบบวัดระดับความสุข คะแนน 0-10",
//     image: q4,
//   },
//   {
//     id: 5,
//     name: "แบบวัดระดับความเครียด (ST-5)",
//     image: q5,
//   },
// ];

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
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
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

  // helper: รับ base64 ที่อาจไม่มี prefix -> คืน data URL พร้อม fallback
const toImgSrc = (s?: string) => {
  if (!s) return "/default.png";                 // ใส่รูป fallback ไว้ใน public/
  const trimmed = s.trim();
  return trimmed.startsWith("data:")
    ? trimmed
    : `data:image/png;base64,${trimmed}`;
};

  return (
    <div className="flex flex-col xl:px-28 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between xl:px-0 px-2">
        <p className="font-ibmthai text-2xl text-basic-text dark:text-text-dark">แบบสอบถามทั้งหมด</p>
      </div>

      {/* Card List Carousel */}
      <div className=" w-full xl:rounded-2xl md:p-4 py-4  relative">
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
                  className=" max-w-full bg-cover bg-center rounded-xl p-2 w-60 h-68 flex items-end
                  hover:scale-105 transition-all duration-500 ease-in-out bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF]"
                  style={{
                    // backgroundImage: `url(${item.image})`,
                    backgroundImage: `url(${toImgSrc(item.picture)})`
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