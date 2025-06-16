import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.clear();
    
    // นำทางไปที่หน้า Login
    navigate("/");
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome to your user dashboard</p>
      <p>Here you can manage your personal information, view your activity, and more!</p>

      {/* ปุ่มออกจากระบบ */}
      <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px" }}>
        ออกจากระบบ
      </Button>
    </div>
  );
};

export default UserDashboard;
