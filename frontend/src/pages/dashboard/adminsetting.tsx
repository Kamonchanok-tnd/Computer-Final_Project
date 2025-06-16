import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
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
      <h2>Admin Settings</h2>
      <p>Here you can modify the settings for the application, like managing roles, permissions, etc.</p>
      
      {/* ปุ่มออกจากระบบ */}
      <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px" }}>
        ออกจากระบบ
      </Button>
    </div>
  );
};

export default AdminSettings;
