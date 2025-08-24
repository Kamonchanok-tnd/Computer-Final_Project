import { ChevronRight } from "lucide-react";
import q1 from "../../assets/assessment/depression.png";
import q2 from "../../assets/assessment/depression1.png";
import q3 from "../../assets/assessment/Mindfulness.png";
import q4 from "../../assets/assessment/happy.png";
import q5 from "../../assets/assessment/ST5.png";


const card = [
  {
    id: 1,
    name: "แบบคัดกรองโรคซึมเศร้า 2Q",
    image: q1,
  },
  {
    id: 2,
    name: "แบบคัดกรองโรคซึมเศร้า 9Q",
    image: q2,
  },
  {
    id: 3,
    name: "แบบวัดระดับสติ (State Mindfulness)",
    image: q3,
  },
  {
    id: 4,
    name: "แบบวัดระดับความสุข คะแนน 0-10",
    image: q4,
  },
  {
    id: 5,
    name: "แบบวัดระดับความเครียด (ST-5)",
    image: q5,
  },
];

function Question() {
  return (
    <div className="flex flex-col xl:px-28 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between xl:px-0 px-2">
        <p className="font-ibmthai text-2xl">แบบสอบถามทั้งหมด</p>
        <ChevronRight />
      </div>

      {/* Card List */}
      <div className="bg-white w-full xl:rounded-2xl md:p-4 py-4 shadow-sm">
        <div className="flex items-center gap-4 w-full overflow-x-auto xl:overflow-hidden lg:justify-start px-2 md:px-0">
          {card.map((item) => (
            <div
              key={item.id}
              className="min-w-[300px] max-w-full bg-cover bg-center rounded-xl p-2 w-72 h-72 flex items-end"
              style={{
                backgroundImage: `url(${item.image})`,
              }}
            >
              <div className="flex-1 flex-col space-y-2 bg-white/50 backdrop-blur-sm h-auto p-4 rounded-lg">
                <p className="font-ibmthai text-center">{item.name}</p>
                <div className="flex justify-center">
                  <button className="font-ibmthai bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] text-white py-1 px-4 rounded-lg">
                    เริ่มทำแบบทดสอบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Question;
