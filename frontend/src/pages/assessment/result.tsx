import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RSH from "../../assets/assessment/ResultHappy.png";
import RSS from "../../assets/assessment/ResultSad.png";
import RSB from "../../assets/assessment/ResultBored.png";
import {
  getAvailableGroupsAndNext,
  createAssessmentResult,
} from "../../services/https/assessment";
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

  // QID/Group ถัดไปที่ “พร้อมทำจริงๆ”
  const [nextQid, setNextQid] = useState<number | null>(null);
  const [nextGroupId, setNextGroupId] = useState<number | null>(null);

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = Number(userObj?.id || localStorage.getItem("id"));

    const groupIdLS = Number(localStorage.getItem("questionnaireGroupID"));
    const lastQidLS = Number(localStorage.getItem("questionnaireID"));

    console.log(
      "🔑 uid:",
      uid,
      "groupId(LS):",
      groupIdLS,
      "lastQid(LS):",
      lastQidLS
    );

    if (!uid) {
      console.warn("⚠️ ไม่พบ uid ใน localStorage");
      return;
    }

    const safeGroupId = isNaN(groupIdLS) ? 0 : groupIdLS;
    const safeLastQid = isNaN(lastQidLS) ? 0 : lastQidLS;

    getAvailableGroupsAndNext(uid, "", safeLastQid)
      .then((groups: GroupOut[]) => {
        console.log("📦 groups from API:", groups);

        // ถ้า groupId ใน LS หาย ให้ fallback เป็นกลุ่มแรกที่ available
        const found =
          groups.find((g) => g.id === safeGroupId) ||
          groups.find((g) => g.available);

        console.log("🔎 found group:", found);

        if (!found) {
          console.log("⛔ ไม่เจอกลุ่มที่กำลังทำอยู่");
          setNextQid(null);
          setNextGroupId(null);
          return;
        }

        console.log("🧩 ชื่อกลุ่ม:", found.name);
        console.log("🟢 available:", found.available);
        console.log("📌 pending_quids:", found.pending_quids);

        // กรองไม่ให้ชนกับข้อที่เพิ่งทำ (กันกรณี backend ส่ง lastQid ติดมา)
        const candidates = (found.pending_quids || []).filter(
          (id) => id !== safeLastQid
        );
        console.log("🧼 candidates (ตัด lastQid ออก):", candidates);

        if (found.available && candidates.length > 0) {
          const qid = candidates[0];
          console.log("➡️ nextQid ที่จะให้ทำ:", qid);
          setNextQid(qid);
          setNextGroupId(found.id);

          // ❌ ห้ามเซ็ต questionnaireID/assessmentResultID ตรงนี้
          //    รอให้กดปุ่มแล้วค่อย create AR ใหม่
        } else {
          console.log("✅ ทำครบกลุ่มแล้ว (หรือไม่ available) → ล้างค่า");
          setNextQid(null);
          setNextGroupId(null);
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

  // เริ่มแบบถัดไป: ต้องสร้าง AssessmentResult ใหม่ทุกครั้ง
  // เริ่มแบบถัดไป: ต้องสร้าง AssessmentResult ใหม่ทุกครั้ง
  const handleNext = async () => {
    if (!nextQid || !nextGroupId) {
      console.log("⛔ ไม่มี nextQid/nextGroupId ไม่สามารถเริ่มแบบถัดไปได้");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const uid = Number(user?.id || localStorage.getItem("id"));
      if (!uid) {
        alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      console.log("🆕 เริ่ม AR ใหม่สำหรับแบบถัดไป:", {
        nextQid,
        nextGroupId,
        uid,
      });

      const newArId = await createAssessmentResult(nextQid, uid, nextGroupId);
      console.log("✅ createAssessmentResult สำเร็จ newArId =", newArId);

      // เซ็ตชุดใหม่ให้ assessments ไปอ่าน
      localStorage.setItem("assessmentResultID", String(newArId));
      localStorage.setItem("questionnaireID", String(nextQid));
      localStorage.setItem("questionnaireGroupID", String(nextGroupId));

      navigate("/assessments");
    } catch (e) {
      console.error("❌ เริ่มแบบถัดไปไม่สำเร็จ:", e);
      alert("เริ่มแบบทดสอบถัดไปไม่สำเร็จ กรุณาลองใหม่");
    }
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        if (nextQid) {
          handleNext();
        } else if (transaction?.description === "แบบคัดกรองโรคซึมเศร้า 9Q") {
          navigate("/chat/new");
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
    <div className="fixed inset-0 z-[2147483647] min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      <div className="bg-sky-200 rounded-2xl p-6 md:p-10 w-11/12 max-w-sm md:max-w-xl text-center shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">คะแนนที่ได้คือ</h1>

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

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-35 h-35 flex items-center justify-center shadow-md">
              <img
                src={image}
                alt="Result"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>

          <div className="absolute -top-18 left-1/2 transform -translate-x-1/2">
            <span className="text-6xl font-bold text-black">{score}</span>
          </div>

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

        {nextQid ? (
          <button
            onClick={handleNext}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-700 transition mb-2"
          >
            ทำแบบทดสอบถัดไป
          </button>
        ) : transaction?.description === "แบบคัดกรองโรคซึมเศร้า 9Q" ? (
          <button
            onClick={() => navigate("/chat/new")}
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
