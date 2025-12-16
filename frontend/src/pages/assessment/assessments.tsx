import React, { useEffect, useState } from "react";
import Q2Q from "../../assets/assessment/Q2Q.png";
import AssessmentNameIcon from "../../assets/assessment/Assessment_Name.png";
import { useNavigate } from "react-router-dom";
import {
  fetchQuestions,
  fetchAnswerOptions,
  submitAnswer,
  finishAssessment,
  getQuestionnaireByID,
  getAllEmotionChoices,
} from "../../services/https/assessment/index";
import { Question } from "../../interfaces/IQuestion";
import { AnswerOption } from "../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../interfaces/IEmotionChoices";
import { message } from "antd";

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
  const [isBusy, setIsBusy] = useState(false); // 🚦กันคลิกซ้ำระหว่างส่งคำตอบ
  const navigate = useNavigate();

  const [assessmentResultID] = useState<number | null>(() => {
    const storedID = localStorage.getItem("assessmentResultID");
    return storedID ? parseInt(storedID) : null;
  });

  const [targetQuID] = useState<number | null>(() => {
    const storedQuID = localStorage.getItem("questionnaireID");
    return storedQuID ? parseInt(storedQuID) : null;
  });

  const [questionnaireName, setQuestionnaireName] = useState<string>(() => {
    return localStorage.getItem("questionnaireName") || "";
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const qRes = await fetchQuestions();
        const aRes = await fetchAnswerOptions();

        try {
          if (targetQuID) {
            const qn = await getQuestionnaireByID(targetQuID);
            if (qn?.nameQuestionnaire) {
              setQuestionnaireName(qn.nameQuestionnaire);
              localStorage.setItem("questionnaireName", qn.nameQuestionnaire);
            }
          }
        } catch (e) {
          console.warn("โหลดชื่อแบบคัดกรองไม่สำเร็จ ใช้ fallback:", e);
          if (!questionnaireName && targetQuID) {
            setQuestionnaireName(`แบบคัดกรองสุขภาพจิต #${targetQuID}`);
          }
        }

        if (!assessmentResultID || !targetQuID) {
          alert("ไม่พบข้อมูลแบบคัดกรองสุขภาพจิต กรุณาเริ่มใหม่อีกครั้ง");
          navigate("/");
          return;
        }

        if (!questionnaireName) {
          setQuestionnaireName(`แบบคัดกรองสุขภาพจิต #${targetQuID}`);
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
          id: a.ID ?? a.id,
          description: a.description ?? a.Description,
          point: a.point ?? a.Point,
          qid: a.qid ?? a.QID ?? a.q_id,
          EmotionChoiceID:
            a.emotionChoiceId ??
            a.EmotionChoiceID ??
            a.emotion_choice_id ??
            null,
        }));

        setQuestions(filteredQuestions);
        setAnswerOptions(mappedAnswerOptions);
        setAnswers(new Array(filteredQuestions.length).fill(null));
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว", err);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 🧠 คลิกอิโมจิ = ตอบ + ส่ง + เด้งไปข้อต่อไป / จบแบบคัดกรองสุขภาพจิต
  const handleSelectAndAdvance = async (opt: AnswerOption) => {
    if (isBusy) return;
    if (assessmentResultID == null) return;

    const question = questions[current];
    if (!question) return;

    const newAnswers = [...answers];
    newAnswers[current] = opt.id ?? null;

    setIsBusy(true);
    try {
      const payload = {
        arid: assessmentResultID,
        qid: question.id,
        answerOptionID: opt.id!,
        point: opt.point,
        question_number: current + 1,
      };
      // console.log("📤 ส่ง submitAnswer:", payload);
      await submitAnswer(payload);
      setAnswers(newAnswers);

      if (current < questions.length - 1) {
        setCurrent((prev) => prev + 1);
      } else {
        // ✅ ใช้ message.success ของ Ant Design แทน alert
        message.success("ขอบคุณสำหรับการทำแบบคัดกรองจนเสร็จเรียบร้อยค่ะ ✨", 3);

        const transaction = await finishAssessment(assessmentResultID);
        // console.log("✅ บันทึก Transaction สำเร็จ:", transaction);
        navigate("/result", {
          state: { answers: newAnswers, questions, transaction },
        });
      }
    } catch (err) {
      console.error("ส่งคำตอบล้มเหลว:", err);
      message.error("ส่งคำตอบไม่สำเร็จ ลองใหม่อีกครั้งนะคะ", 3);
    } finally {
      setIsBusy(false);
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
    <div
      className="font-ibmthai fixed inset-0 z-[2147483647] h-dvh overflow-y-auto overscroll-y-contain bg-gradient-to-b from-sky-100 to-white flex flex-col items-center pt-10 px-4 pb-24"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* ชื่อแบบคัดกรองสุขภาพจิต */}
      <div className="flex items-center justify-center gap-3 mb-3 max-w-md w-full px-2">
        <img
          src={AssessmentNameIcon}
          alt="Assessment Name"
          className="w-8 h-8 object-contain"
        />
        <h2 className="text-xl font-semibold truncate">
          {questionnaireName || ("แบบคัดกรองสุขภาพจิต")}
        </h2>
        <img
          src={AssessmentNameIcon}
          alt="Assessment Name"
          className="w-8 h-8 object-contain"
        />
      </div>

      {/* Steps */}
      {questions.length > 1 && (
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(1.5rem,_1fr))] gap-2 max-w-md w-full mb-6 px-2">
          {questions.map((_, index) => {
            const isCompleted = index < current;
            const isCurrent = index === current;

            return (
              <div
                key={index}
                className={`w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-bold
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
                  }`}
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

      {/* ตัวเลือกอิโมจิ: คลิก = ตอบ + ไปต่อ */}
      <div
        className={`flex gap-4 flex-wrap justify-center mb-10 ${
          isBusy ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {currentOptions.map((opt) => {
          const emotionChoice = emotionChoices.find(
            (e) => e.id === opt.EmotionChoiceID
          );
          const imageSrc = emotionChoice?.picture
            ? buildImageSrc(emotionChoice.picture)
            : "";

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectAndAdvance(opt)}
              className={`cursor-pointer flex flex-col items-center p-2 transition rounded-xl border-2 hover:scale-95 active:scale-95
    ${
      answers[current] === opt.id
        ? "border-blue-500 bg-blue-50"
        : "border-transparent"
    }
  `}
            >
              <img
                src={imageSrc}
                alt={opt.description}
                className="w-20 h-20 object-contain"
                draggable={false}
              />
              <span className="mt-2 font-medium">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Assessments;
