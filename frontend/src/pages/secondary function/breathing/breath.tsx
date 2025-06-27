import React, { useState, useEffect } from "react";
import "./breath.css";

const BreathingPage: React.FC = () => {
  const [breathing, setBreathing] = useState("BREATH IN");

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathing((prev) => (prev === "BREATH IN" ? "BREATH OUT" : "BREATH IN"));
    }, 4000); // เปลี่ยนข้อความทุกๆ 4 วินาที
    return () => clearInterval(interval); // ทำความสะอาดเมื่อคอมโพเนนต์ถูกทำลาย
  }, []);

  return (
    <div className="breathing-page">
      <h1>ฝึกหายใจ</h1>
      <div className="breathing-exercise">
        
        <div className="circle">
          <span>{breathing}</span>
        </div>
      </div>
    </div>
  );
};

export default BreathingPage;
