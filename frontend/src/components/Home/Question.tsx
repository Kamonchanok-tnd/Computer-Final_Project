import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
// import q2 from "../../assets/q2.jpg";
// import q1 from "../../assets/q1.jpg";
// import q3 from "../../assets/maditaion.jpg";
// import q4 from "../../assets/q4.jpg";
import { Questionnaire } from "../../interfaces/IQuestionnaire";
// import { fetchQuestions } from "../../services/https/assessment";
import { getAllQuestionnaires } from "../../services/https/questionnaire";
import { createAssessmentResult } from "../../services/https/assessment";

import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const totalItems = questionNaire.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);
  const showPrevButton = currentIndex > 0;
  const showNextButton = currentIndex < maxIndex;

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // แก้ฟังก์ชันให้รับได้ทั้ง number | undefined แล้วเช็คก่อน
  const handleStartAssessment = async (quid?: number) => {
    if (typeof quid !== "number") {
      alert("ไม่พบรหัสแบบสอบถาม");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = Number(user?.id || localStorage.getItem("id"));

    if (!uid) {
      alert("กรุณาเข้าสู่ระบบก่อนทำแบบสอบถาม");
      return;
    }

    try {
      const groupId = 4;
      const resultID = await createAssessmentResult(quid, uid, groupId);
      localStorage.setItem("assessmentResultID", String(resultID));

      localStorage.setItem("id", String(uid));
      localStorage.setItem("questionnaireGroupID", String(groupId));
      localStorage.setItem("questionnaireID", String(quid));

      navigate("/assessments");
    } catch (err) {
      console.error("เริ่มทำแบบทดสอบไม่สำเร็จ:", err);
      alert("เริ่มทำแบบทดสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="flex flex-col xl:px-28 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between xl:px-0 px-2">
        <p className="font-ibmthai text-2xl text-basic-text dark:text-text-dark">
          แบบสอบถามทั้งหมด
        </p>
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
                  style={
                    {
                      // backgroundImage: `url(${item.image})`,
                    }
                  }
                >
                  <div className="flex-1 flex-col space-y-2 bg-white/50 backdrop-blur-sm h-auto p-4 rounded-lg">
                    <p className="font-ibmthai text-center">
                      {item.nameQuestionnaire}
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleStartAssessment(item.id)}
                        disabled={typeof item.id !== "number"}
                        className={`font-ibmthai bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] text-white py-1 px-4 rounded-lg
    ${typeof item.id !== "number" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
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
