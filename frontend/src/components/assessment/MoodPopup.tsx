import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import QQ from "../../assets/assessment/QQ.png";
import { createAssessmentResult } from "../../services/https/assessment";

const MoodPopup: React.FC = () => {
  const navigate = useNavigate();
  const { groupId, quid } = useParams<{ groupId: string; quid: string }>();

  const gid = Number(groupId);
  const qid = Number(quid);

  // กันพารามิเตอร์หายหรือไม่ใช่ตัวเลข
  if (!gid || !qid || Number.isNaN(gid) || Number.isNaN(qid)) {
    return null; // หรือจะแสดง error สั้น ๆ ก็ได้
  }

  // 🔒 ล็อกทั้งแอป: ปิด scroll + inert ทุกอย่างนอกจาก modal
  useEffect(() => {
    const appRoot =
      document.getElementById("root") ||
      document.querySelector("[data-app-root]") ||
      document.body;

    if (appRoot) {
      appRoot.setAttribute("inert", "");
      appRoot.setAttribute("aria-hidden", "true");
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (appRoot) {
        appRoot.removeAttribute("inert");
        appRoot.removeAttribute("aria-hidden");
      }
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleStartAssessment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const uid = Number(user?.id || localStorage.getItem("id"));
      if (!uid || isNaN(uid)) {
        alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const resultID = await createAssessmentResult(qid, uid, gid);

      localStorage.setItem("assessmentResultID", resultID.toString());
      localStorage.setItem("questionnaireID", qid.toString());
      localStorage.setItem("questionnaireGroupID", gid.toString());

      navigate("/assessments");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเริ่มแบบสอบถาม:", error);
      alert("ไม่สามารถเริ่มแบบสอบถามได้ กรุณาลองใหม่ภายหลัง");
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-popup-title"
      aria-describedby="mood-popup-desc"
      style={{ pointerEvents: "auto" }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" style={{ pointerEvents: "auto" }} />
      <div
        className="relative bg-sky-300/90 p-8 rounded-xl shadow-lg text-center max-w-sm w-[90%]"
        style={{ pointerEvents: "auto" }}
      >
        <img src={QQ} alt="QQ character" className="w-24 h-24 mx-auto mb-4 select-none" />
        <h2 id="mood-popup-title" className="text-lg font-bold mb-2">
          คุณเป็นยังไงบ้างช่วงนี้ ?
        </h2>
        <p id="mood-popup-desc" className="text-sm font-medium text-gray-800 mb-6">
          เรามีแบบประเมินสั้นๆ ที่ช่วยให้คุณรู้จักอารมณ์ และความรู้สึกของตัวเองมากขึ้น
        </p>
        <button
          onClick={handleStartAssessment}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-white"
        >
          ลองทำดูเลย
        </button>
      </div>
    </div>,
    document.body
  );
};

export default MoodPopup;
