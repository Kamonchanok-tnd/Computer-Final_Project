import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card, message} from "antd";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
export const logout = () => {
  localStorage.removeItem("token"); // ลบ token ออกจาก localStorage
  localStorage.removeItem("token_type"); // ลบ token_type (หากมี)
};

function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const handleLogout = () => {
    // ลบข้อมูลทั้งหมดจาก localStorage
    localStorage.clear();
    message.success("Logged out successfully");
    // นำทางไปที่หน้า Login
    navigate("/")
};
  // ฟังก์ชันล็อกเอาต์
  

  return (
    <>
      {/* ใส่ Navbar ลงในหน้า Home */}
      <Navbar /> 

      <Row justify="center" style={{ marginTop: "20px" }}>
        <Col span={12}>
          <Card title="Welcome to the Home Page" bordered={false} style={{ width: "100%" }}>
            <p>Welcome to the user portal. We are happy to have you here!</p>

            <Button 
              type="primary" 
              onClick={handleLogout} 
              loading={loading} 
              style={{ marginTop: "20px" }}
            >
              Logout
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Home;
