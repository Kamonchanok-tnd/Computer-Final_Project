import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

import { RequestPasswordReset } from "../../../services/https/login";
import { MailOutlined } from "@ant-design/icons";



const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // จัดการการส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของผู้ใช้
  const handleEmailSubmit = async () => {
    if (!email) return messageApi.error("กรุณากรอกอีเมลของคุณ");

    setLoading(true);
    try {
      // ใช้ฟังก์ชัน RequestPasswordReset จาก service
      const response = await RequestPasswordReset(email);
      if (response.status === 200) {
        messageApi.success("ส่งรหัสยืนยันไปที่อีเมลของคุณแล้ว");
        setTimeout(() => navigate("/reset-password"), 1500); // หลังจากส่งสำเร็จจะนำทางไปยังหน้าตั้งรหัสผ่านใหม่
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
          <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
            ลืมรหัสผ่าน
          </Title>
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
                placeholder="กรอกอีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  borderRadius: 10,
                  height: 40,
                  backgroundColor: "#0288d1",
                  border: "none",
                }}
                loading={loading}
              >
                ส่งรหัสยืนยัน
              </Button>
            </Form.Item>
          </Form>
          <Text style={{ textAlign: "center" }}>
            หรือ{" "}
            <a onClick={() => navigate("/login")} style={{ color: "#0288d1" }}>
              กลับสู่หน้าล็อกอิน
            </a>
          </Text>
        </Card>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
