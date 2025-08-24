import React, { useEffect, useState } from "react";
import Q2Q from "../../assets/assessment/Q2Q.png";

import { useNavigate } from "react-router-dom";
import {
  fetchQuestions,
  fetchAnswerOptions,
  submitAnswer,
  finishAssessment,
} from "../../services/https/assessment/index";
import { Question } from "../../interfaces/IQuestion";
import { AnswerOption } from "../../interfaces/IAnswerOption";
import { getAllEmotionChoices } from "../../services/https/questionnaire/index";
import { EmotionChoice } from "../../interfaces/IEmotionChoices";

// ✅ Utils
const apiUrl = import.meta.env.VITE_API_URL as string;

const joinUrl = (base: string, path: string): string => {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const buildImageSrc = (picture: string): string => {
  if (/^https?:\/\//i.test(picture)) return picture;
  if (/^\/?images\/emotion_choice\//i.test(picture)) {
    return joinUrl(apiUrl, picture);
  }
  return joinUrl(apiUrl, `images/emotion_choice/${picture}`);
};

const Assessments: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [emotionChoices, setEmotionChoices] = useState<EmotionChoice[]>([]);
  const navigate = useNavigate();

  // ✅ ดึงจาก localStorage
  const [assessmentResultID, setAssessmentResultID] = useState<number | null>(
    () => {
      const storedID = localStorage.getItem("assessmentResultID");
      return storedID ? parseInt(storedID) : null;
    }
  );

  const [targetQuID, setTargetQuID] = useState<number | null>(() => {
    const storedQuID = localStorage.getItem("questionnaireID");
    return storedQuID ? parseInt(storedQuID) : null;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const qRes = await fetchQuestions();
        const aRes = await fetchAnswerOptions();

        // ✅ เช็กว่ามีข้อมูลครบไหม
        if (!assessmentResultID || !targetQuID) {
          alert("ไม่พบข้อมูลแบบสอบถาม กรุณาเริ่มใหม่อีกครั้ง");
          navigate("/");
          return;
        }

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
          EmotionChoiceID: a.EmotionChoiceID,
        }));

        setQuestions(filteredQuestions);
        setAnswerOptions(mappedAnswerOptions);
        setAnswers(new Array(filteredQuestions.length).fill(null));
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว", err);
      }
    };

    loadData();
  }, [assessmentResultID, targetQuID, navigate]);

  useEffect(() => {
    const fetchEmotionChoices = async () => {
      try {
        const data = await getAllEmotionChoices();
        setEmotionChoices(data);
      } catch (e) {
        console.error("โหลด EmotionChoices ล้มเหลว", e);
      }
    };
    fetchEmotionChoices();
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
      const payload = {
        arid: assessmentResultID,
        qid: question.id,
        answerOptionID: answer.id!,
        point: answer.point,
        question_number: current + 1, // ✅ จุดที่ต้องถูกส่งไป
      };

      console.log("📤 ส่งข้อมูล submitAnswer:", payload); // ✅ Log ตรงนี้

      await submitAnswer(payload);
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
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const currentOptions = answerOptions.filter(
    (opt) => opt.qid === currentQuestion.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex flex-col items-center pt-10 px-4">
      {questions.length > 1 && (
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(1.5rem,_1fr))] gap-2 max-w-md w-full mb-6 px-2">
          {questions.map((_, index) => {
            const isCompleted = index < current;
            const isCurrent = index === current;

            return (
              <div
                key={index}
                className={`
                  w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-bold
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : ""
                  }
                  ${isCurrent ? "bg-blue-600 border-blue-600 text-white" : ""}
                  ${
                    !isCompleted && !isCurrent
                      ? "bg-white border-blue-300 text-blue-300"
                      : ""
                  }
                `}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
            );
          })}
        </div>
      )}

      <img src={Q2Q} alt="Q2Q" className="w-50 h-50 mb-10" />

      <h1 className="text-center text-lg font-bold mb-6 leading-relaxed">
        {currentQuestion.nameQuestion}
      </h1>

      <div className="flex gap-4 flex-wrap justify-center mb-10">
        {currentOptions.map((opt) => {
          const emotionChoice = emotionChoices.find(
            (e) => e.id === opt.EmotionChoiceID
          );

          const imageSrc = emotionChoice?.picture
            ? buildImageSrc(emotionChoice.picture)
            : "";

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
                className="w-20 h-20 object-contain"
              />
              <span className="mt-2 font-medium">{opt.description}</span>
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
