import React from "react";
import { useNavigate } from "react-router-dom";
import RSH from "../../assets/assessment/RSH.png";

const Result: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      <div className="bg-sky-200 rounded-2xl p-8 md:p-10 max-w-md text-center shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">ผลลัพธ์ของคุณคือ!!</h1>

        <img src={RSH} alt="Happy Result" className="w-45 h-45 mx-auto mb-6" />

        <p className="font-semibold text-lg mb-4">
          ยินดีด้วย ช่วงนี้คุณมีความสุขกับชีวิต !!! 🥳
        </p>

        <p className="text-sm text-gray-800 leading-relaxed mb-6">
          ผลการประเมินของคุณแสดงให้เห็นว่า<br />
          คุณไม่มีภาวะหรือแนวโน้มที่จะเป็นโรคซึมเศร้า 🎉<br />
          <br />
          เห็นได้ชัดว่าคุณดูแลตัวเองได้ดีเยี่ยมจริง ๆ<br />
          ขอให้ใช้ชีวิตให้มีความสุขสดใสแบบนี้ตลอดไปเลยนะคะ! 😊
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-blue-50 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          ➡️
        </button>
      </div>
    </div>
  );
};

export default Result;
