import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./homeuser.css"
import logo from "../../assets/login.png";
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
};

function Home() {
  const [feeling, setFeeling] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleFeelingChange = (emoji: string) => {
    setFeeling(emoji);
  };

  return (
    <>
      
      <div className="home-page">
       

        <div className="feeling-question">
          <h2>วันนี้คุณรู้สึกอย่างไร?</h2>
          <div className="emoji-container">
            <span
              className={`emoji ${feeling === "😊" ? "selected" : ""}`}
              onClick={() => handleFeelingChange("😊")}
            >
              😊
            </span>
            <span
              className={`emoji ${feeling === "😐" ? "selected" : ""}`}
              onClick={() => handleFeelingChange("😐")}
            >
              😐
            </span>
            <span
              className={`emoji ${feeling === "😞" ? "selected" : ""}`}
              onClick={() => handleFeelingChange("😞")}
            >
              😞
            </span>
          </div>
        </div>

        <div className="activity-container">

          <h1>แบบสอบถาม</h1>
          <div>
            <img src={logo} alt="กิจกรรม 1" />
            <h3>กิจกรรม 1</h3>
          </div>
          <div>
            <img src={logo} alt="กิจกรรม 2" />
            <h3>กิจกรรม 2</h3>
          </div>
          <div>
            <img src={logo} alt="กิจกรรม 3" />
            <h3>กิจกรรม 3</h3>
          </div>
        </div>
        <div className="content">
          <h1>กิจกรรมต่างๆ</h1>
          <div>
            <img src={logo} alt="กิจกรรม 1" />
            <h3>กิจกรรม 1</h3>
          </div>
          <div>
            <img src={logo} alt="กิจกรรม 1" />
            <h3>กิจกรรม 2</h3>
          </div>

        </div>

        
      </div>
    </>
  );
}

export default Home;
