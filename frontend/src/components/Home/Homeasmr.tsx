import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, PenTool, Book, Waves } from "lucide-react";

import asmr from "../../assets/asmr.png";
import miror from "../../assets/miror.png";
import pray from "../../assets/prey.png";
import meditate from "../../assets/maditation.png";

interface Slide {
  img: string;
  title: string;
  desc: string;
  shortDesc: string;
  secondImg: string;
  secondTitle: string;
  secondDesc: string;
  secondShortDesc: string;
  bg: string;
  icon: ReactNode; 
  secondBg: string;
  secondIcon: ReactNode; 
}

const slides: Slide[] = [
  {
    img: asmr,
    title: "ASMR",
    desc: `ปล่อยตัวเองให้ลอยไปกับเสียงที่นุ่มนวลและละมุนของ ASMR  
    ไม่ว่าจะเป็นเสียงกระซิบเบา ๆ การเคาะเบา ๆ หรือเสียงสัมผัสต่าง ๆ  
    ทุกจังหวะถูกออกแบบมาเพื่อช่วยให้คุณผ่อนคลาย ลดความเครียด  
    และโฟกัสอยู่กับความสงบภายในใจ  
    นี่คือมุมเล็ก ๆ ที่คุณสามารถพักจากความวุ่นวาย  
    และฟังเสียงที่คอยโอบกอดจิตใจคุณอย่างอ่อนโยน`,
    shortDesc: `ปล่อยตัวเองให้ลอยไปกับเสียงที่นุ่มนวลและละมุนของ ASMR ช่วยให้คุณผ่อนคลาย ลดความเครียด และโฟกัสอยู่กับความสงบภายในใจ...`,
    secondImg: miror,
    secondTitle: "เขียนระบายบนกระจก",
    secondDesc: `สะท้อนความรู้สึกที่อยู่ในใจ ผ่านกระจกที่พร้อมรับฟังคุณเสมอ  
    ไม่ว่าความรู้สึกนั้นจะเป็นสุข เศร้า เหนื่อย หรือกังวล  
    นี่คือพื้นที่ที่คุณสามารถปลดปล่อยสิ่งที่อัดแน่นอยู่ข้างใน  
    โดยไม่ต้องกลัวการถูกตัดสิน  
    ปล่อยใจให้เบาลง แล้วค้นพบความสงบที่อยู่ภายในตัวคุณเองอีกครั้ง`,
    secondShortDesc: `สะท้อนความรู้สึกที่อยู่ในใจ ผ่านกระจกที่พร้อมรับฟังคุณเสมอ ปลดปล่อยสิ่งที่อัดแน่นอยู่ข้างใน โดยไม่ต้องกลัวการถูกตัดสิน...`,
    bg: "bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7]",
    icon: <Headphones className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#AED581]" />,
    secondBg: "bg-gradient-to-br from-[#E1BEE7] to-[#CE93D8]",
    secondIcon: <PenTool className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#BA68C8] " />,
  },
  {
    img: pray,
    title: "สวดมนต์เสริมพลังใจ",
    desc: `ให้เสียงสวดมนต์พาคุณเข้าสู่ความสงบภายในใจ  
    ทุกถ้อยคำคือพลังบวกที่ช่วยชำระความเหนื่อยล้า  
    ปล่อยวางเรื่องราววุ่นวาย แล้วปล่อยใจไปกับจังหวะของบทสวด  
    เพื่อเติมพลังใจ และเชื่อมโยงกับความสงบที่แท้จริง`,
    shortDesc: `ให้เสียงสวดมนต์พาคุณเข้าสู่ความสงบภายในใจ ทุกถ้อยคำคือพลังบวกที่ช่วยชำระความเหนื่อยล้า เพื่อเติมพลังใจ...`,
    secondImg: meditate,
    secondTitle: "ทำสมาธิ & ฝึกหายใจ",
    secondDesc: `หยุดพักจากความวุ่นวาย แล้วหันกลับมาโฟกัสกับลมหายใจของตัวเอง  
    การฝึกสมาธิจะช่วยให้จิตใจนิ่งขึ้น คลายความกังวล  
    เพียงหายใจเข้าออกอย่างมีสติ คุณจะพบว่าความสงบอยู่ใกล้กว่าที่คิด  
    ปล่อยให้ร่างกายได้พัก และให้หัวใจกลับมาเบาสบายอีกครั้ง`,
    secondShortDesc: `หยุดพักจากความวุ่นวาย แล้วหันกลับมาโฟกัสกับลมหายใจของตัวเอง การฝึกสมาธิจะช่วยให้จิตใจนิ่งขึ้น คลายความกังวล...`,
    bg: "bg-gradient-to-br from-[#FFF9C4] to-[#FFE082]",
    icon: <Book className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#FFD54F]" />,
    secondBg: "bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA]",
    secondIcon: <Waves className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#00B8D9]" />,
  },
];

function Homeasmr() {
  const [index, setIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = slides[index];

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-30 font-ibmthai">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl px-2 text-basic-text dark:text-text-dark">พื้นที่ผ่อนคลาย</h1>
        <button
          className="bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white py-2 px-6 sm:px-8 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 dark:text-background-dark mr-2 xl:mr-0 text-sm sm:text-base"
          onClick={() => navigate("/audiohome")}
        >
          ดูกิจกรรมทั้งหมด
        </button>
      </div>

      <div className="mt-4 bg-button-blue/20 dark:bg-chat-dark font-ibmthai p-3 sm:p-4 lg:p-6 xl:px-30 rounded-2xl">
        
        {/* Mobile Layout (Stack vertically) */}
        <div className="block lg:hidden space-y-4 transition-all duration-700 ease-in-out mt-4">
          {/* First Card */}
          <div className={`${currentSlide.bg} rounded-xl p-4 flex flex-col`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-full shadow-sm">
                {currentSlide.icon}
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#1F1F22]">{currentSlide.title}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img 
                src={currentSlide.img} 
                alt={currentSlide.title} 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover flex-shrink-0" 
              />
              <p className="text-sm sm:text-base text-center sm:text-left">
                {currentSlide.shortDesc}
              </p>
            </div>
          </div>

          {/* Second Card */}
          <div className={`${currentSlide.secondBg} rounded-xl p-4 flex flex-col`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-full shadow-sm">
                {currentSlide.secondIcon}
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#1F1F22]">{currentSlide.secondTitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={currentSlide.secondImg}
                alt={currentSlide.secondTitle}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover flex-shrink-0"
              />
              <p className="text-sm sm:text-base text-center sm:text-left">
                {currentSlide.secondShortDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout (Grid) */}
        <div className="hidden lg:grid grid-cols-2 gap-6 transition-all duration-700 ease-in-out mt-4">
          {/* Left side */}
          <div className="flex justify-center items-center">
            <img 
              src={currentSlide.img} 
              alt={currentSlide.title} 
              className="w-48 xl:w-60 rounded-xl object-cover" 
            />
          </div>
          <div className={`${currentSlide.bg} rounded-xl p-6 min-h-[300px] flex flex-col`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm">
                {currentSlide.icon}
              </div>
              <p className="text-xl xl:text-2xl font-bold text-[#1F1F22]">{currentSlide.title}</p>
            </div>
            <p className="text-lg xl:text-xl mt-6 whitespace-pre-line leading-relaxed">
              {currentSlide.desc}
            </p>
          </div>

          {/* Right side */}
          <div className={`${currentSlide.secondBg} rounded-xl p-6 min-h-[300px] flex flex-col`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm">
                {currentSlide.secondIcon}
              </div>
              <p className="text-xl xl:text-2xl font-bold text-[#1F1F22]">{currentSlide.secondTitle}</p>
            </div>
            <p className="text-lg xl:text-xl mt-6 whitespace-pre-line leading-relaxed">
              {currentSlide.secondDesc}
            </p>
          </div>
          <div className="flex justify-center items-center">
            <img
              src={currentSlide.secondImg}
              alt={currentSlide.secondTitle}
              className="w-48 xl:w-60 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Dot navigation */}
        <div className="flex justify-center mt-6 space-x-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === i ? "bg-button-blue/50 scale-110" : "bg-gray-400/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Homeasmr;