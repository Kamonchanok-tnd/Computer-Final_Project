import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import { RequestPasswordReset } from "../../../services/https/login";

import "./ForgotPasswordPage.css"; // <-- เพิ่มไฟล์ CSS แยกสำหรับสไตล์

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleEmailSubmit = async () => {
    if (!email) return messageApi.error("กรุณากรอกอีเมลของคุณ");
    setLoading(true);
    try {
      const response = await RequestPasswordReset(email);
      if (response.status === 200) {
        messageApi.success("ส่งรหัสยืนยันไปที่อีเมลของคุณแล้ว");
        setTimeout(() => navigate("/reset-password"), 1500);
      } else {
        messageApi.error(response.data.error || "ไม่สามารถส่งรหัสยืนยันได้");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="forgot-password-wrapper">
        <Card className="forgot-password-card">
          <Title level={3} className="title">
            🔐 ลืมรหัสผ่าน
          </Title>
          <Text className="subtitle">
            กรุณากรอกอีเมลที่คุณใช้สมัครสมาชิก ระบบจะส่งลิงก์เพื่อรีเซ็ตรหัสผ่านให้คุณ
          </Text>
          <Form layout="vertical" onFinish={handleEmailSubmit}>
            <Form.Item
              label="อีเมล"
              name="email"
              rules={[
                { required: true, message: "กรุณากรอกอีเมลของคุณ" },
                { type: "email", message: "กรุณากรอกอีเมลที่ถูกต้อง" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="submit-btn"
                loading={loading}
              >
                ส่งรหัสยืนยัน
              </Button>
            </Form.Item>
          </Form>
          <div className="back-to-login">
            <Text>หรือ </Text>
            <a onClick={() => navigate("/")}>กลับสู่หน้าล็อกอิน</a>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
