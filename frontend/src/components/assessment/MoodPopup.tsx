import React from "react";
import { useNavigate } from "react-router-dom";
import QQ from "../../assets/assessment/QQ.png";

// ✅ เพิ่ม service
import { createAssessmentResult } from "../../services/https/assessment";

// ✅ สมมุติว่าได้ quID จาก backend หรือ prop
const sampleQuestionnaireID = 2;

const MoodPopup: React.FC = () => {
  const navigate = useNavigate();

  const handleStartAssessment = async () => {
    try {
      // ✅ ดึง UID จาก localStorage
      const uid = Number(localStorage.getItem("id"));
      if (!uid) {
        alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      // ✅ สร้างวันที่ในรูปแบบ YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      // ✅ เรียก API พร้อมส่ง UID, QuID, Date
      const resultID = await createAssessmentResult(sampleQuestionnaireID, uid, today);

      // ✅ เก็บไว้ใน localStorage (หรือ context/state ถ้ามี)
      localStorage.setItem("assessmentResultID", resultID.toString());
      localStorage.setItem("questionnaireID", sampleQuestionnaireID.toString());

      // ✅ ไปหน้าแบบสอบถาม
      navigate("/assessments");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเริ่มแบบสอบถาม:", error);
      alert("ไม่สามารถเริ่มแบบสอบถามได้ กรุณาลองใหม่ภายหลัง");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      {/* กล่อง popup */}
      <div className="bg-sky-300 bg-opacity-90 p-8 rounded-xl shadow-lg text-center max-w-sm">
        <img src={QQ} alt="QQ character" className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">คุณเป็นยังไงบ้างช่วงนี้ ?</h2>
        <p className="text-sm font-medium text-gray-800 mb-6">
          เรามีแบบประเมินสั้นๆ ที่ช่วยให้คุณรู้จักอารมณ์ และความรู้สึกของตัวเองมากขึ้น
        </p>
        <button
          onClick={handleStartAssessment}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          ลองทำดูเลย
        </button>
      </div>
    </div>
  );
};

export default MoodPopup;
