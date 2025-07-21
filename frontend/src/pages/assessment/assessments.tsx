import React, { useEffect, useState } from "react";
import { Steps } from "antd";
import Q2Q from "../../assets/Q2Q.png";
import EmojiSad from "../../assets/2Q1.png";
import EmojiHappy from "../../assets/2Q2.png";
import { useNavigate } from "react-router-dom";
import { fetchQuestions, fetchAnswerOptions } from "../../services/https/assessment/index";
import axios from "axios";
import { Question } from "../../interfaces/IQuestion";
import { AnswerOption } from "../../interfaces/IAnswerOption";

const { Step } = Steps;

const Assessments: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [assessmentResultID, setAssessmentResultID] = useState<number | null>(null);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8000"; // หรือใช้จาก .env

  const targetQuID = 4; // เปลี่ยนเป็น ID ของชุดแบบสอบถามที่ต้องการ เช่น 2Q

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const qRes = await fetchQuestions();
        const aRes = await fetchAnswerOptions();

        const filteredQuestions = qRes.filter((q: Question) => q.quID === targetQuID);
        setQuestions(filteredQuestions);
        setAnswerOptions(aRes);
        setAnswers(new Array(filteredQuestions.length).fill(null));

        // ✅ สร้าง AssessmentResult ไว้เลย
        const resultRes = await axios.post(
          `${API_BASE}/assessment/result`,
          { QuID: targetQuID }, // ตามโครงสร้าง entity.AssessmentResult
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAssessmentResultID(resultRes.data.ID); // ใช้ตอนส่งคำตอบ
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว", err);
      }
    };

    loadData();
  }, []);

  const handleSelect = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[current] = value;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    const token = localStorage.getItem("token");
    const question = questions[current];
    const answer = answerOptions.find(
      (opt) => opt.qid === question.id && opt.description === answers[current]
    );

    // ✅ บันทึกคำตอบลง backend
    if (assessmentResultID && answer) {
      await axios.post(
        `${API_BASE}/assessment/answer`,
        {
          ARID: assessmentResultID,
          QID: question.id,
          AOID: answer.id,
          Point: answer.point,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // ✅ ส่งผลลัพธ์
      await axios.post(
        `${API_BASE}/assessment/finish/${assessmentResultID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/result", { state: { answers, questions } });
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>กำลังโหลดคำถาม...</p>
      </div>
    );
  }

  const currentQuestion = questions[current];
  const currentOptions = answerOptions.filter((opt) => opt.qid === currentQuestion.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex flex-col items-center pt-10 px-4">
      <Steps current={current} className="max-w-sm w-full mb-6">
        {questions.map((_, index) => (
          <Step key={index} />
        ))}
      </Steps>

      <img src={Q2Q} alt="Q2Q" className="w-50 h-50 mb-10" />

      <h1 className="text-center text-lg font-bold mb-6 leading-relaxed">
        {currentQuestion.nameQuestion}
      </h1>

      <div className="flex gap-10 mb-10">
        {currentOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => handleSelect(opt.description)}
            className={`cursor-pointer flex flex-col items-center p-2 transition rounded-xl border-2 ${
              answers[current] === opt.description
                ? "border-blue-500 bg-blue-100"
                : "border-transparent"
            }`}
          >
            <img
              src={opt.description === "มี" ? EmojiSad : EmojiHappy}
              alt={opt.description}
              className="w-20 h-20"
            />
            <span className="mt-2 font-medium">{opt.description}</span>
          </div>
        ))}
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
