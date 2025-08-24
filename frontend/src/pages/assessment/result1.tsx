import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RSH from "../../assets/assessment/ResultHappy.png";
import RSS from "../../assets/assessment/ResultSad.png";
import RSB from "../../assets/assessment/ResultBored.png";

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { transaction } = location.state;

  const score = transaction?.total_score ?? 0;
  const maxScore = transaction?.max_score ?? 27;
  const resultLevel = transaction?.result_level ?? "bored";
  const testType = transaction?.test_type ?? "positive";
  const title = transaction?.result ?? "ผลการประเมิน";

  // คำนวณเปอร์เซ็นต์และวงกลม
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  // สีตาม testType
  const getScoreColor = (percentage: number) => {
    if (testType === "negative") {
      if (percentage <= 20) return "#22c55e";
      if (percentage <= 40) return "#84cc16";
      if (percentage <= 60) return "#fffb02ff";
      if (percentage <= 80) return "#ff6a00ff";
      return "#ef4444";
    } else {
      // testType === "positive"
      if (percentage <= 20) return "#ef4444";
      if (percentage <= 40) return "#ff6a00ff";
      if (percentage <= 60) return "#fffb02ff";
      if (percentage <= 80) return "#84cc16";
      return "#22c55e";
    }
  };

  // Emoji และคำอธิบายจาก resultLevel
  const getResultDetails = () => {
    switch (resultLevel) {
      case "happy":
        return {
          image: RSH,
          description:
            "เห็นได้ชัดว่าคุณดูแลตัวเองได้ดีเยี่ยมจริง ๆ 🥳\n\nขอให้ใช้ชีวิตให้มีความสุขสดใสแบบนี้ตลอดไปเลยนะคะ! 😊",
        };
      case "bored":
        return {
          image: RSB,
          description:
            "การดูแลสุขภาพจิตของตัวเองเป็นเรื่องสำคัญ เราจะอยู่เคียงข้างคุณเสมอ🫂\n\nขอเป็นกำลังใจให้คุณก้าวผ่านช่วงเวลานี้ไปได้นะคะ 😊",
        };
      case "sad":
      default:
        return {
          image: RSS,
          description:
            "การดูแลสุขภาพจิตของตัวเองเป็นเรื่องสำคัญ เราจะอยู่เคียงข้างคุณเสมอ🫂\n\nถ้าหากคุณรู้สึกไม่โอเค การขอความช่วยเหลือจากผู้เชี่ยวชาญก็เป็นเรื่องสำคัญนะคะ👩‍⚕️\n\nขอให้คุณก้าวผ่านช่วงเวลานี้ไปได้อย่างเข้มแข็งนะคะ! 😊",
        };
    }
  };

  const { image, description } = getResultDetails();
  const scoreColor = getScoreColor(percentage);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      <div className="bg-sky-200 rounded-2xl p-8 md:p-10 max-w-md text-center shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">คะแนนที่ได้คือ</h1>

        {/* Score Circle */}
        <div className="relative w-48 h-48 mx-auto mb-12 mt-20">
          <svg
            className="w-48 h-48 transform -rotate-270"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={scoreColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Emoji */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-35 h-35 flex items-center justify-center shadow-md">
              <img
                src={image}
                alt="Result"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>

          {/* Score Number */}
          <div className="absolute -top-18 left-1/2 transform -translate-x-1/2">
            <span className="text-6xl font-bold text-black">{score}</span>
          </div>

          {/* Scale Label */}
          <div className="absolute -bottom-4 right-8 text-sm font-medium text-gray-700">
            {maxScore}
          </div>
        </div>

        <p className="font-semibold text-lg mb-4 whitespace-pre-line">
          {title}
        </p>

        <p className="text-sm text-gray-800 leading-relaxed mb-6 whitespace-pre-line">
          {description}
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-gray-100 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          ➡️
        </button>
      </div>
    </div>
  );
};

export default Result;
