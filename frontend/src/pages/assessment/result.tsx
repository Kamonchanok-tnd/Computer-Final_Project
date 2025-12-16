import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RSH from "../../assets/assessment/ResultHappy.png";
import RSS from "../../assets/assessment/ResultSad.png";
import RSB from "../../assets/assessment/ResultBored.png";
import { getAvailableGroupsAndNext, getAssessmentResultByID, getCriteriaByQuID } from "../../services/https/assessment";
import { GroupOut } from "../../interfaces/IQuestionnaireGroup";

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { transaction } = (location.state as any) || { transaction: null };

  const score = transaction?.total_score ?? 0;
  const maxScore = transaction?.max_score ?? 27;
  const resultLevel = transaction?.result_level ?? "bored";
  const testType = transaction?.test_type ?? "positive";
  const title = transaction?.result ?? "ผลการประเมิน";
  const arid = transaction?.arid;

  // QID/Group ถัดไปที่ “พร้อมทำจริงๆ”
  const [nextQid, setNextQid] = useState<number | null>(null);
  const [nextGroupId, setNextGroupId] = useState<number | null>(null);

  const [recommendation, setRecommendation] = useState<string>("");

  // ✅ เก็บ QID จาก localStorage ตั้งแต่ mount แรก (กันโดน effect อื่นล้าง)
  const initialQidRef = useRef<number | null>(null);
  if (initialQidRef.current === null) {
    const lsQid = Number(localStorage.getItem("questionnaireID"));
    initialQidRef.current = Number.isNaN(lsQid) ? null : lsQid;
  }

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = Number(userObj?.id || localStorage.getItem("id"));

    const groupIdLS = Number(localStorage.getItem("questionnaireGroupID"));
    const lastQidLS = Number(localStorage.getItem("questionnaireID"));

    if (!uid) return;

    const safeGroupId = isNaN(groupIdLS) ? 0 : groupIdLS;
    const safeLastQid = isNaN(lastQidLS) ? 0 : lastQidLS;

    getAvailableGroupsAndNext(uid, "", safeLastQid)
      .then((groups: GroupOut[]) => {
        const found =
          groups.find((g) => g.id === safeGroupId) ||
          groups.find((g) => g.available);

        if (!found) {
          setNextQid(null);
          setNextGroupId(null);
          return;
        }

        const candidates = (found.pending_quids || []).filter(
          (id) => id !== safeLastQid
        );

        if (found.available && candidates.length > 0) {
          setNextQid(candidates[0]);
          setNextGroupId(found.id);
        } else {
          setNextQid(null);
          setNextGroupId(null);
          // ทำครบแล้ว ล้างสถานะชุดเก่า
          localStorage.removeItem("questionnaireGroupID");
          localStorage.removeItem("questionnaireID");
          localStorage.removeItem("assessmentResultID");
        }
      })
      .catch((err) => {
        console.error("❌ getAvailableGroupsAndNext error:", err);
        setNextQid(null);
        setNextGroupId(null);
      });
  }, []);

  // ไปทำแบบคัดกรอง “ถัดไป” —> แวะหน้ารายการก่อน
  const handleNext = () => {
    if (!nextQid || !nextGroupId) return;
    navigate(`/assessmentlists/${nextGroupId}/${nextQid}`);
  };

  // ✅ โหลด Recommendation ตามเกณฑ์ของ qu_id ที่แมตช์คะแนน (มี fallback หา quId หลายแหล่ง)
  useEffect(() => {
    (async () => {
      try {
        // 0) คะแนนที่จะใช้ match กับช่วง
        const currentScore = Number(score);

        // 1) พยายามใช้ qu_id จาก transaction ก่อน (ถ้า backend มีส่งมา)
        let quId: number | null =
          (transaction?.qu_id ??
            transaction?.QuID ??
            null) as number | null;

        // 2) ถ้ายังไม่มี ลองใช้ค่าแรกเริ่มจาก localStorage (ก่อนโดนล้าง)
        if (!quId && initialQidRef.current) {
          quId = initialQidRef.current;
          // console.log("[Result] use quId from localStorage:", quId);
        }

        // 3) ถ้ายังไม่เจอ และมี arid → โหลด AssessmentResult เพื่อคาย QuID ออกมา
        if (!quId && arid) {
          const ar = await getAssessmentResultByID(Number(arid));
          quId =
            ar?.QuID ??
            ar?.qu_id ??
            ar?.Questionnaire?.ID ??
            ar?.Questionnaire?.id ??
            null;
          // console.log("[Result] use quId from AssessmentResult:", quId);
        }

        if (!quId) {
          console.warn("⚠️ Cannot resolve QuID from any source");
          setRecommendation("ไม่พบแบบคัดกรองที่สัมพันธ์กับผลลัพธ์นี้ (QuID) กรุณาลองใหม่อีกครั้ง");
          return;
        }

        // 4) ดึง criteria ของ qu_id นี้
        const criteriaList = await getCriteriaByQuID(Number(quId));

        // 5) หา criteria ที่ช่วงคะแนนครอบคลุม score → ดึง Recommendation
        type CriteriaLike = {
          min?: number;
          max?: number;
          MinCriteriaScore?: number;
          MaxCriteriaScore?: number;
          min_criteria_score?: number;
          max_criteria_score?: number;
          Recommendation?: string;
          recommendation?: string;
        };

        const matched = (criteriaList as CriteriaLike[]).find((cr) => {
          const min =
            cr.MinCriteriaScore ??
            cr.min_criteria_score ??
            (cr as any).min ??
            0;
          const max =
            cr.MaxCriteriaScore ??
            cr.max_criteria_score ??
            (cr as any).max ??
            0;
          return currentScore >= Number(min) && currentScore <= Number(max);
        });

        const reco =
          matched?.Recommendation ??
          matched?.recommendation ??
          "";

        setRecommendation(
          reco ||
            ""
        );
      } catch (e) {
        console.error("❌ load recommendation failed:", e);
        setRecommendation(
          "เกิดข้อผิดพลาดในการโหลดคำแนะนำ (Recommendation) กรุณาลองใหม่ภายหลัง"
        );
      }
    })();
  }, [arid, transaction?.qu_id, transaction?.QuID, score]);

  // ===== UI เดิมของหน้าผลลัพธ์ =====
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = (p: number) => {
    if (testType === "negative") {
      if (p <= 20) return "#22c55e";
      if (p <= 40) return "#84cc16";
      if (p <= 60) return "#fffb02ff";
      if (p <= 80) return "#ff6a00ff";
      return "#ef4444";
    } else {
      if (p <= 20) return "#ef4444";
      if (p <= 40) return "#ff6a00ff";
      if (p <= 60) return "#fffb02ff";
      if (p <= 80) return "#84cc16";
      return "#22c55e";
    }
  };

  const getResultDetails = () => {
    switch (resultLevel) {
      case "happy":
        return {
          image: RSH,
        };
      case "bored":
        return {
          image: RSB,
        };
      case "sad":
      default:
        return {
          image: RSS,
        };
    }
  };

  const { image } = getResultDetails();
  const scoreColor = getScoreColor(percentage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        if (nextQid) {
          handleNext();
        } else if (
          transaction?.description === "แบบคัดกรองโรคซึมเศร้า 9Q" ||
          transaction?.questionnaire_group === "Post-test"
        ) {
          navigate("/chat");
        } else {
          navigate("/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextQid, transaction, navigate]);

  return (
    <div className="font-ibmthai fixed inset-0 z-[2147483647] min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      <div className="bg-sky-200 rounded-2xl p-6 md:p-10 w-11/12 max-w-sm md:max-w-xl text-center shadow-xl">
        <h1 className="text-2xl md:text-4xl font-bold mb-6">คะแนนที่ได้คือ</h1>

        <div className="relative w-48 h-48 mx-auto mb-12 mt-20">
          <svg className="w-48 h-48 transform -rotate-270" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="8" fill="none" />
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

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-35 h-35 flex items-center justify-center shadow-md">
              <img src={image} alt="Result" className="w-40 h-40 object-contain" />
            </div>
          </div>

          <div className="absolute -top-18 left-1/2 transform -translate-x-1/2">
            <span className="text-6xl font-bold text-black">{score}</span>
          </div>

          <div className="absolute -bottom-4 right-8 text-sm font-medium text-gray-700">
            {maxScore}
          </div>
        </div>

        <p className="font-semibold text-3xl mb-4 whitespace-pre-line">{title}</p>
        <p className="text-xl text-gray-800 leading-relaxed mb-6 whitespace-pre-line">
          {recommendation}
        </p>

        {nextQid ? (
          <button
            onClick={handleNext}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-700 transition mb-2"
          >
            ทำแบบคัดกรองถัดไป
          </button>
        ) : transaction?.description === "แบบคัดกรองโรคซึมเศร้า 9Q" ? (
          <button
            onClick={() => navigate("/chat")}
            className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
          >
            เข้าสู่ห้องสนทนา
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            กลับหน้าแรก
          </button>
        )}
      </div>
    </div>
  );
};

export default Result;
