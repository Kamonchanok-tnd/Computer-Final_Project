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

  // ฟังก์ชันสำหรับไปหน้า createadmin
  const goToCreateAdmin = () => {
    navigate("/admin/create"); // Change the route to your create admin page
  };

  return (
    <div>
      <h2>Admin Settings</h2>
      <p>Here you can modify the settings for the application, like managing roles, permissions, etc.</p>
      
      {/* ปุ่มออกจากระบบ */}
      <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px" }}>
        ออกจากระบบ
      </Button>

      {/* ปุ่มไปหน้า Create Admin */}
      <Button onClick={goToCreateAdmin} type="default" style={{ marginTop: "20px", marginLeft: "10px" }}>
        ไปหน้า Create Admin
      </Button>
    </div>
  );
};

export default AdminSettings;
