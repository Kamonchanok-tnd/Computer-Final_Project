import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก API (ในที่นี้เราใช้ข้อมูลตัวอย่าง)
  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch("/api/user/profile"); // เปลี่ยน URL ตามที่ต้องการ
      const data = await response.json();
      setUserData(data);
    };
    fetchUserData();
  }, []);

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.clear();
    
    // นำทางไปที่หน้า Login
    navigate("/");
  };

  return (
    <div>
      <h2>User Profile</h2>
      {userData ? (
        <div>
          <p>Name: {userData.firstName} {userData.lastName}</p>
          <p>Email: {userData.email}</p>
          <p>Age: {userData.age}</p>
          <p>Gender: {userData.gender}</p>
        </div>
      ) : (
        <p>Loading your profile...</p>
      )}
      
      {/* ปุ่มออกจากระบบ */}
      <Button onClick={handleLogout} type="primary" style={{ marginTop: "20px" }}>
        ออกจากระบบ
      </Button>
    </div>
  );
};

export default UserProfile;
