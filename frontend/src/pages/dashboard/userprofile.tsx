import React, { useState, useEffect } from "react";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก API (ในที่นี้เราใช้ข้อมูลตัวอย่าง)
    const fetchUserData = async () => {
      const response = await fetch("/api/user/profile"); // เปลี่ยน URL ตามที่ต้องการ
      const data = await response.json();
      setUserData(data);
    };
    fetchUserData();
  }, []);

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
    </div>
  );
};

export default UserProfile;
