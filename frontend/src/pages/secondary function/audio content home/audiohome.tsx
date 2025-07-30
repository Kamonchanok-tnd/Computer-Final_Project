import React from "react";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import "./audiohome.css";
import smile from "../../../assets/maditaion.jpg"; // รูปภาพสำหรับกิจกรรม "สวดมนต์"
import meditationImage from "../../../assets/prey.jpg"; // รูปภาพสำหรับกิจกรรม "ทำสมาธิ"
import asmrImage from "../../../assets/maditaion.jpg"; // รูปภาพสำหรับกิจกรรม "ASMR"
import breathInImage from "../../../assets/prey.jpg"; // รูปภาพสำหรับกิจกรรม "ฝึกหายใจ"
import userImage from "../../../assets/user.png"; // รูปคนสวัสดี

const HomePage: React.FC = () => {
  const navigate = useNavigate(); // เรียกใช้งาน useNavigate

  const handleNavigate = (path: string) => {
    navigate(path); // นำทางไปยัง path ที่ต้องการ
  };

  return (
    <>
      <div className="home-page">
        {/* ส่วนของหัวข้อและรูปคน */}
        <div className="header-section">
          <img src={userImage} alt="User" />
          <div>
            <h1>สวัสดี!</h1>
            <p>ลองเล่นกิจกรรมผ่อนคลายของเรา เพื่อความสงบและฟื้นฟูจิตใจ</p>
          </div>
        </div>

        {/* ส่วนของกิจกรรม */}
        <div className="activity-cards">
          <div className="activity-card" onClick={() => handleNavigate("/audiohome/chanting")}>
            <img src={smile} alt="สวดมนต์" />
            <p>ร่วมสวดมนต์เพื่อความสงบและผ่อนคลายจิตใจ</p>
          </div>
          <div className="activity-card" onClick={() => handleNavigate("/meditation")}>
            <img src={meditationImage} alt="ทำสมาธิ" />
            <p>ฝึกสมาธิเพื่อการผ่อนคลายและการฟื้นฟูจิตใจ</p>
          </div>
          <div className="activity-card" onClick={() => handleNavigate("/asmr")}>
            <img src={asmrImage} alt="ASMR" />
            <p>รับฟังเสียงที่ผ่อนคลายจิตใจผ่าน ASMR</p>
          </div>
          <div className="activity-card" onClick={() => handleNavigate("/breath-in")}>
            <img src={breathInImage} alt="ฝึกหายใจ" />
            <p>ฝึกการหายใจเพื่อความสงบและการลดความเครียด</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
