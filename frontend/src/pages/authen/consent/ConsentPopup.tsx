// ConsentPopup.tsx
import React, { useState, useEffect } from "react";

const ConsentPopup: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem("consentGiven");
    if (!consentGiven) {
      setShowPopup(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("consentGiven", "true");
    setShowPopup(false);
  };

  const handleDecline = () => {
    localStorage.setItem("consentGiven", "false");
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg text-left shadow-lg overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-4 text-center">ความยินยอมในการใช้ข้อมูลส่วนบุคคล</h2>
        <p className="mb-4 text-gray-700">
          เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ ข้อมูลส่วนบุคคลที่คุณกรอก เช่น ชื่อ อายุ ข้อมูลสุขภาพจิต หรือกิจกรรมการใช้งาน
          จะถูกเก็บและใช้เพื่อวัตถุประสงค์ดังต่อไปนี้:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>ปรับปรุงประสบการณ์การใช้งานเว็บไซต์ให้เหมาะสมกับคุณ</li>
          <li>ให้คำแนะนำด้านสุขภาพจิตหรือกิจกรรมที่เหมาะสม</li>
          <li>วิเคราะห์ข้อมูลเพื่อพัฒนาเนื้อหาและฟีเจอร์ของเว็บ</li>
        </ul>
        <p className="mb-4 text-gray-700">
          ข้อมูลของคุณจะไม่ถูกเปิดเผยให้บุคคลภายนอกโดยไม่ได้รับความยินยอม เว้นแต่เป็นไปตามข้อกฎหมาย
          คุณสามารถเลือกไม่ให้ความยินยอม และยังคงเข้าชมเว็บไซต์ได้ แต่บางฟีเจอร์อาจใช้งานไม่ได้
        </p>
        <p className="mb-6 text-gray-700">
          หากคุณยอมรับ ให้กดปุ่ม "ยอมรับ" ด้านล่าง เพื่อเริ่มใช้งานเว็บไซต์ได้ตามปกติ
          หากไม่ยอมรับ ให้กด "ไม่ยอมรับ" เพื่อปิด Popup และใช้เว็บไซต์ด้วยข้อจำกัดบางอย่าง
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold"
            onClick={handleAccept}
          >
            ยอมรับ
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 font-semibold"
            onClick={handleDecline}
          >
            ไม่ยอมรับ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;
