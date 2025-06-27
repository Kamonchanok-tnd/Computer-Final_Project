import React from "react";
import "./meditation.css";
import meditationImage1 from "../../../assets/login.png"; // นำเข้ารูปภาพ

const MeditationPage: React.FC = () => {
  return (
    <div className="meditation-page">
      <h1>นั่งสมาธิ</h1>
      <div className="meditation-session">
        <div className="session-card">
          <h3>ทำสมาธิ 1</h3>
          <img src={meditationImage1} alt="Meditation 1" className="session-image" />
    
          <div className="session-info">
            <div className="clip-title">ทำสมาธิ 1</div>
            <div className="clip-duration">15:30</div>
          </div>
          <button className="play-button">►</button>
        </div>
        <div className="session-card">
          <h3>ทำสมาธิ 2</h3>
          <img src={meditationImage1} alt="Meditation 2" className="session-image" />
          
          <div className="session-info">
            <div className="clip-title">ทำสมาธิ 2</div>
            <div className="clip-duration">20:15</div>
          </div>
          <button className="play-button">►</button>
        </div>
        <div className="session-card">
          <h3>ทำสมาธิ 3</h3>
          <img src={meditationImage1} alt="Meditation 3" className="session-image" />
          
          <div className="session-info">
            <div className="clip-title">ทำสมาธิ 3</div>
            <div className="clip-duration">25:00</div>
          </div>
          <button className="play-button">►</button>
        </div>
      </div>
    </div>
  );
};

export default MeditationPage;
