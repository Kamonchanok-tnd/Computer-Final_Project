import React, { useEffect, useState } from "react";
import ChatBan from "../../components/Home/ChatBan";
import Question from "../../components/Home/Question";
import Activity from "../../components/Home/Activity";
import Footer from "../../components/Home/Footer";
import MoodPopup from "../../components/assessment/MoodPopup"; // ✅ นำเข้า popup
import HomeMeditation from "../../components/Home/Homemedation";
import HomeChanting from "../../components/Home/Homechanting";
import Homeasmr from "../../components/Home/Homeasmr";
import Homemiror from "../../components/Home/Homemiror";
import Homemessage from "../../components/Home/Homemessage";
import Homedoctor from "../../components/Home/Homedoctor";

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

  useEffect(() => {
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-[#F4FFFF] relative dark:bg-background-dark ">
      {/* ✅ Popup เด้งทันทีเมื่อยังไม่เคยแสดง */}
      {showPopup && <MoodPopup />}

      <ChatBan />
      <Question />
     {/* <HomeMeditation/>
     <HomeChanting/> */}
      <Homeasmr/>
      {/* <Homemiror/> */}
      <Homemessage/>
     <Homedoctor/>
      {/* <Activity /> */}
      <Footer />
    </div>
  );
}

export default Home;
