import React from "react";
import { useNavigate } from "react-router-dom";
import QQ from "../../assets/QQ.png";

const MoodPopup: React.FC = () => {
  const navigate = useNavigate(); // ✅ ใช้ navigate

  const handleClick = () => {
    navigate("/assessments"); // ✅ ไปที่หน้าประเมิน
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      <div className="bg-sky-200 p-6 rounded-xl shadow-lg text-center max-w-sm">
        <img src={QQ} alt="QQ character" className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">คุณเป็นยังไงบ้างช่วงนี้ ?</h2>
        <p className="text-sm font-medium text-gray-800 mb-7">
          เรามีแบบประเมินสั้นๆ ที่ช่วยให้คุณรู้จักอารมณ์ และความรู้สึกของตัวเองมากขึ้น
        </p>
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
        >
          ลองทำดูเลย
        </button>
      </div>
    </div>
  );
};

export default MoodPopup;
