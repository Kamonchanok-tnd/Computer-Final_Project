import React, { useState } from "react";
import { Steps } from "antd";
import Q2Q from "../../assets/Q2Q.png";
import EmojiSad from "../../assets/2Q1.png";
import EmojiHappy from "../../assets/2Q2.png";
import { useNavigate } from "react-router-dom"; // เพิ่มด้านบนสุด

const { Step } = Steps;

const Assessments: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null]);
  const navigate = useNavigate();

  const questions = [
    "ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ ท่านรู้สึก หดหู่ เศร้า หรือท้อแท้สิ้นหวังหรือไม่",
    "ใน 2 สัปดาห์ที่ผ่านมา รวมวันนี้ ท่านรู้สึก เบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือไม่",
  ];

  const handleSelect = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[current] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
  if (answers[current] !== null && current < questions.length - 1) {
    setCurrent(current + 1);
  } else {
    // ไปหน้าสรุปผล
    navigate("/result");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex flex-col items-center pt-10 px-4">
      <Steps current={current} className="max-w-sm w-full mb-6">
        <Step />
        <Step />
      </Steps>

      <img src={Q2Q} alt="Q2Q" className="w-50 h-50 mb-10" />

      <h1 className="text-center text-lg font-bold mb-6 leading-relaxed">
        {questions[current]}
      </h1>

      <div className="flex gap-40 mb-10">
        <div
          onClick={() => handleSelect("yes")}
          className={`cursor-pointer flex flex-col items-center p-2 transition rounded-xl border-2 ${
            answers[current] === "yes"
              ? "border-blue-500 bg-blue-100"
              : "border-transparent"
          }`}
        >
          <img src={EmojiSad} alt="มี" className="w-20 h-20" />
          <span className="mt-2 font-medium">มี</span>
        </div>

        <div
          onClick={() => handleSelect("no")}
          className={`cursor-pointer flex flex-col items-center p-2 transition rounded-xl border-2 ${
            answers[current] === "no"
              ? "border-green-500 bg-green-100"
              : "border-transparent"
          }`}
        >
          <img src={EmojiHappy} alt="ไม่มี" className="w-20 h-20" />
          <span className="mt-2 font-medium">ไม่มี</span>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={answers[current] === null}
        className={`px-8 py-2 text-white font-semibold rounded-full transition ${
          answers[current]
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {current < questions.length - 1 ? "ถัดไป" : "ส่งคำตอบ"}
      </button>
    </div>
  );
};

export default Assessments;
