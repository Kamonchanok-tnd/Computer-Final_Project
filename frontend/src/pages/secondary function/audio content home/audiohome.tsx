import React from "react";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import "./audiohome.css";
import Navbar from "../../../components/Navbar/Navbar";
const HomePage: React.FC = () => {
  const navigate = useNavigate(); // เรียกใช้งาน useNavigate

  const handleNavigate = (path: string) => {
    navigate(path); // นำทางไปยัง path ที่ต้องการ
  };

  return (
    <>
    
    <div className="home-page">
       
      <h1>สวัสดี</h1>
       <div className="topic activity-card" >
          <h3>กิจกรรมผ่อนคลาย</h3>
        </div>
      <div className="activity-cards">
       
        <div className="activity-card" onClick={() => handleNavigate("/chanting")}>
          <h3>สวดมนต์</h3>
        </div>
        <div className="activity-card" onClick={() => handleNavigate("/user/meditation")}>
          <h3>ทำสมาธิ</h3>
        </div>
        <div className="activity-card" onClick={() => handleNavigate("/asmr")}>
          <h3>ASMR</h3>
        </div>
        <div className="activity-card" onClick={() => handleNavigate("/user/breath-in")}>
          <h3>ฝึกหายใจ</h3>
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;
