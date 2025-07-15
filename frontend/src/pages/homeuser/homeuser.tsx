import React, { useEffect, useState } from "react";
import ChatBan from "../../components/Home/ChatBan";
import Question from "../../components/Home/Question";
import Activity from "../../components/Home/Activity";
import Footer from "../../components/Home/Footer";
import MoodPopup from "../../components/assessment/MoodPopup"; // ✅ นำเข้า popup

function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("mood_popup_shown");

    if (!alreadyShown) {
      // ✅ แสดง popup ครั้งแรกเท่านั้น
      setShowPopup(true);
      sessionStorage.setItem("mood_popup_shown", "true");
    }
  }, []);

  return (
    <div className="bg-[#F4FFFF] relative">
      {/* ✅ Popup เด้งทันทีเมื่อยังไม่เคยแสดง */}
      {showPopup && <MoodPopup />}

      <ChatBan />
      <Question />
      <Activity />
      <Footer />
    </div>
  );
}

export default Home;
