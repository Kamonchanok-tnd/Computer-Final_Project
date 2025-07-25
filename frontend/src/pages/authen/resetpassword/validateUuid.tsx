// ✅ ไฟล์ ValidateUuidPage.tsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Typography, Row } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { validateApi } from "../../../services/https/resetpassword";
import { RequestPasswordReset } from "../../../services/https/login";
import "./ValidateUuidPage.css";

const { Title, Text } = Typography;

const ValidateUuidPage: React.FC = () => {
  const [uuid, setUuid] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(5 * 60); // 5 นาที
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  console.log("location.state", location.state);
  console.log("email หน้าตรวจสอบรหัสผ่าน",email)
  

useEffect(() => {
  const stateEmail = location.state?.email || null;
  setEmail(stateEmail);
}, [location.state]);


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleUuidSubmit = async () => {
    const uuidString = uuid.join("");
    if (uuidString.length < 6) {
      return messageApi.error("กรุณากรอกรหัสให้ครบ 6 หลัก");
    }

    setLoading(true);
    try {
      const response = await validateApi({ token: uuidString });
      if (response.status === 200) {
        localStorage.setItem("userId", response.data.id);
        localStorage.setItem("jwt", response.data.jwt);
        messageApi.success("รหัสยืนยันถูกต้อง กรุณาตั้งรหัสผ่านใหม่");
        navigate("/update-password");
      } else {
        messageApi.error(response.data.error || "รหัสยืนยันไม่ถูกต้องหรือหมดอายุ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (/^[0-9a-zA-Z]{0,1}$/.test(val)) {
      const newUuid = [...uuid];
      newUuid[index] = val;
      setUuid(newUuid);
      if (val && index < 5) {
        const nextInput = document.getElementById(`uuid-input-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && uuid[index] === "" && index > 0) {
      const prevInput = document.getElementById(`uuid-input-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleResendToken = async () => {
     console.log("email ใน handleResendToken =", email);
    if (!email) {
      
      return messageApi.error("ไม่พบอีเมลสำหรับส่งรหัสใหม่");
    }
    setResendLoading(true);
    try {
      const response = await RequestPasswordReset(email);

      if (response.status === 200) {
        setTimer(5 * 60);
        messageApi.success("ส่งรหัสยืนยันใหม่ไปที่อีเมลของคุณแล้ว");
      } else {
        messageApi.error(response.data?.error || "ส่งรหัสยืนยันไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการส่งรหัสยืนยันใหม่");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="validate-container">
      {contextHolder}
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Title level={3}>กรอกรหัสยืนยัน</Title>
      </Row>

      <Form onFinish={handleUuidSubmit} className="validate-form">
        <Form.Item label="รหัสยืนยัน" name="uuid">
          <div className="uuid-input-group">
            {uuid.map((value, index) => (
              <Input
                key={index}
                id={`uuid-input-${index}`}
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="uuid-input"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </Form.Item>

        <Row justify="space-between" style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14 }}>
            เวลาที่เหลือ: <b>{formatTimer()}</b>
          </Text>
          <Button
            type="link"
            onClick={handleResendToken}
            loading={resendLoading}
            disabled={resendLoading || timer > 0}
          >
            ส่งรหัสใหม่
          </Button>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="submit-btn"
          >
            ตรวจสอบรหัส
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ValidateUuidPage;
