import React, { useEffect, useState } from "react";
import { Steps } from "antd";
import Q2Q from "../../assets/Q2Q.png";
import EmojiSad from "../../assets/2Q1.png";
import EmojiHappy from "../../assets/2Q2.png";
import EmotionLevel0 from "../../assets/0.png"
import EmotionLevel1 from "../../assets/1.png"
import EmotionLevel2 from "../../assets/2.png"
import EmotionLevel3 from "../../assets/3.png"
import EmotionLevel4 from "../../assets/4.png"
import EmotionLevel5 from "../../assets/5.png"
import EmotionLevel6 from "../../assets/6.png"
import EmotionLevel7 from "../../assets/7.png"
import EmotionLevel8 from "../../assets/8.png"
import EmotionLevel9 from "../../assets/9.png"
import EmotionLevel10 from "../../assets/10.png"

import { useNavigate } from "react-router-dom";
import {
  fetchQuestions,
  fetchAnswerOptions,
  createAssessmentResult,
  submitAnswer,
  finishAssessment,
} from "../../services/https/assessment/index";
import { Question } from "../../interfaces/IQuestion";
import { AnswerOption } from "../../interfaces/IAnswerOption";

const { Step } = Steps;

const Assessments: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [assessmentResultID, setAssessmentResultID] = useState<number | null>(null);
  const navigate = useNavigate();

  const targetQuID: number = 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        const qRes = await fetchQuestions();
        console.log("Questions fetched:", qRes);

        const aRes = await fetchAnswerOptions();
        console.log("Answer options fetched:", aRes);

        const filteredQuestions: Question[] = qRes
          .filter((q: Question) => q.quID === targetQuID)
          .map((q: any) => ({
            id: q.ID,
            nameQuestion: q.nameQuestion,
            quID: q.quID,
            priority: q.priority,
          }));

        const mappedAnswerOptions: AnswerOption[] = aRes.map((a: any) => ({
          id: a.ID,
          description: a.description,
          point: a.point,
          qid: a.qid,
        }));

        setQuestions(filteredQuestions); 
        setAnswerOptions(mappedAnswerOptions);
        setAnswers(new Array(filteredQuestions.length).fill(null));

        const resultID = await createAssessmentResult(targetQuID);
        console.log("Assessment Result ID:", resultID);
        setAssessmentResultID(resultID);
      } catch (err: any) {
        console.error("โหลดข้อมูลล้มเหลว", err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
          console.error("Response headers:", err.response.headers);
        } else if (err.request) {
          console.error("Request made but no response:", err.request);
        } else {
          console.error("Error message:", err.message);
        }
      }
    };

    loadData();
  }, []);

  const handleSelect = (aoid: number) => {
    const newAnswers = [...answers];
    newAnswers[current] = aoid;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    const question = questions[current];
    const aoid = answers[current];

    if (assessmentResultID != null && aoid != null) {
      const answer = answerOptions.find((opt) => opt.id === aoid);
      if (answer) {
        await submitAnswer(
          assessmentResultID,
          question.id,
          answer.id!,
          answer.point
        );
      }
    }

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      if (assessmentResultID != null) {
        await finishAssessment(assessmentResultID);
      }
      navigate("/result", { state: { answers, questions } });
    }
  };

  const currentQuestion = questions[current];

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center text-lg">กำลังโหลดข้อมูล...</div>;
  }

  const currentOptions = answerOptions.filter((opt) => opt.qid === currentQuestion.id);

  const emotionImages = [
    EmotionLevel0,
    EmotionLevel1,
    EmotionLevel2,
    EmotionLevel3,
    EmotionLevel4,
    EmotionLevel5,
    EmotionLevel6,
    EmotionLevel7,
    EmotionLevel8,
    EmotionLevel9,
    EmotionLevel10,
  ];

  console.log("Current Question ID:", currentQuestion.id);
  console.log("All AnswerOptions:", answerOptions);
  console.log("Filtered Options:", currentOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex flex-col items-center pt-10 px-4">
        {questions.length > 1 && (
            <Steps current={current} className="max-w-sm w-full mb-6">
            {questions.map((_, index) => (
                <Step key={index} />
            ))}
            </Steps>
        )}

      <img src={Q2Q} alt="Q2Q" className="w-50 h-50 mb-10" />

      <h1 className="text-center text-lg font-bold mb-6 leading-relaxed">
        {currentQuestion.nameQuestion}
      </h1>

      <div className="flex gap-4 flex-wrap justify-center mb-10">
        {currentOptions.map((opt) => {
          const isEmotion = targetQuID === 4;
          const imageSrc = isEmotion
            ? emotionImages[opt.point ?? 0]
            : opt.description === "มี"
            ? EmojiSad
            : EmojiHappy;

          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id!)}
              className={`cursor-pointer flex flex-col items-center p-2 transition rounded-xl border-2 ${
                answers[current] === opt.id
                  ? "border-blue-500 bg-blue-100"
                  : "border-transparent"
              }`}
            >
              <img
                src={imageSrc}
                alt={opt.description}
                className="w-20 h-20"
              />
              <span className="mt-2 font-medium">
                {isEmotion ? opt.point : opt.description}
              </span>
            </div>
          );
        })}
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
