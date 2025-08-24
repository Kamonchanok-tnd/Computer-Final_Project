import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, PenTool, Book, Waves } from "lucide-react";

import asmr from "../../assets/asmr.png";
import miror from "../../assets/miror.jpg";
import pray from "../../assets/pray.jpg";
import meditate from "../../assets/pray.jpg";

interface Slide {
  img: string;
  title: string;
  desc: string;
  secondImg: string;
  secondTitle: string;
  secondDesc: string;
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
    secondImg: miror,
    secondTitle: "เขียนระบายบนกระจก",
    secondDesc: `สะท้อนความรู้สึกที่อยู่ในใจ ผ่านกระจกที่พร้อมรับฟังคุณเสมอ  
    ไม่ว่าความรู้สึกนั้นจะเป็นสุข เศร้า เหนื่อย หรือกังวล  
    นี่คือพื้นที่ที่คุณสามารถปลดปล่อยสิ่งที่อัดแน่นอยู่ข้างใน  
    โดยไม่ต้องกลัวการถูกตัดสิน  
    ปล่อยใจให้เบาลง แล้วค้นพบความสงบที่อยู่ภายในตัวคุณเองอีกครั้ง`,
    bg: "bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7]",
    icon: <Headphones className="w-10 h-10 text-[#AED581]" />,
    secondBg: "bg-gradient-to-br from-[#E1BEE7] to-[#CE93D8]",
    secondIcon: <PenTool className="w-10 h-10 text-[#BA68C8]" />,
  },
  {
    img: pray,
    title: "สวดมนต์เสริมพลังใจ",
    desc: `ให้เสียงสวดมนต์พาคุณเข้าสู่ความสงบภายในใจ  
    ทุกถ้อยคำคือพลังบวกที่ช่วยชำระความเหนื่อยล้า  
    ปล่อยวางเรื่องราววุ่นวาย แล้วปล่อยใจไปกับจังหวะของบทสวด  
    เพื่อเติมพลังใจ และเชื่อมโยงกับความสงบที่แท้จริง`,
    secondImg: meditate,
    secondTitle: "ทำสมาธิ & ฝึกหายใจ",
    secondDesc: `หยุดพักจากความวุ่นวาย แล้วหันกลับมาโฟกัสกับลมหายใจของตัวเอง  
    การฝึกสมาธิจะช่วยให้จิตใจนิ่งขึ้น คลายความกังวล  
    เพียงหายใจเข้าออกอย่างมีสติ คุณจะพบว่าความสงบอยู่ใกล้กว่าที่คิด  
    ปล่อยให้ร่างกายได้พัก และให้หัวใจกลับมาเบาสบายอีกครั้ง`,
    bg: "bg-gradient-to-br from-[#FFF9C4] to-[#FFE082]",
    icon: <Book className="w-10 h-10 text-[#FFD54F]" />,
    secondBg: "bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA]",
    secondIcon: <Waves className="w-10 h-10 text-[#00B8D9]" />,
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
    <div className="mt-4 bg-button-blue/20 font-ibmthai px-30 p-2">
      <div className="flex justify-between items-center">
        <h1 className="font-ibmthai text-2xl px-2 text-gray-900">กิจกรรมต่างๆ</h1>
        <button
          className="bg-gradient-to-tl from-[#99EDFF] to-[#5FE2FF] hover:to-[#2BD9FF] text-white font-bold py-2 px-8 rounded-lg  transition-all duration-300 
            cursor-pointer  hover:scale-105"
          onClick={() => navigate("/audiohome")}
        >
          ดูกิจกรรมทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 transition-all duration-700 ease-in-out mt-4">
        {/* Left side */}
        <div className="flex justify-center items-center">
          <img src={currentSlide.img} alt={currentSlide.title} className="w-60 rounded-xl" />
        </div>
        <div
          className={`${currentSlide.bg} rounded-xl p-6 min-h-[300px] flex flex-col`}
        >
          <div className="flex items-center gap-3">
            {currentSlide.icon}
            <p className="text-2xl font-bold text-[#1F1F22]">{currentSlide.title}</p>
          </div>
          <p className="text-xl mt-6 whitespace-pre-line">{currentSlide.desc}</p>
        </div>

        {/* Right side */}
        <div
          className={`${currentSlide.secondBg} rounded-xl p-6 min-h-[300px] flex flex-col`}
        >
          <div className="flex items-center gap-3">
            {currentSlide.secondIcon}
            <p className="text-2xl font-bold text-[#1F1F22]">{currentSlide.secondTitle}</p>
          </div>
          <p className="text-xl mt-6 whitespace-pre-line">{currentSlide.secondDesc}</p>
        </div>
        <div className="flex justify-center items-center">
          <img
            src={currentSlide.secondImg}
            alt={currentSlide.secondTitle}
            className="w-60 rounded-xl"
          />
        </div>
      </div>

      {/* dot navigation */}
      <div className="flex justify-center mt-6 space-x-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === i ? "bg-button-blue/50 scale-110" : "bg-gray-400/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Homeasmr;
