import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, message, Row } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RequestPasswordReset } from "../../../services/https/login";
import { validateApi, resetPassword } from "../../../services/https/resetpassword";
import { Steps } from 'antd';
import "./ForgotPasswordPage.css";

const { Title, Text } = Typography;


// Step Indicator Component
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <div className="step-indicator-wrapper">
      <Steps
        size="default"
        current={currentStep - 1}
        direction="horizontal"
        progressDot={(dot, { index, status }) => (
          <div className="custom-dot">
            {index + 1}
          </div>
        )}
        items={[
          { title: 'กรอกอีเมล' },
          { title: 'ตรวจสอบรหัส' },
          { title: 'ตั้งรหัสผ่านใหม่' },
        ]}
      />
    </div>
  );
};


const ForgotPasswordStepPage: React.FC = () => {
  const [step, setStep] = useState(1);

  // Step 1: Email
  const [email, setEmail] = useState("");
  // Step 2: UUID input 6 หลัก
  const [uuid, setUuid] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(5 * 60);
  const [resendLoading, setResendLoading] = useState(false);
  // Step 3: Password reset
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // Timer countdown สำหรับ step 2
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, step]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // --- Step 1: ส่งอีเมลขอรหัสยืนยัน ---
  const handleEmailSubmit = async () => {
    if (!email) return messageApi.error("กรุณากรอกอีเมลของคุณ");
    setLoading(true);
    try {
      const response = await RequestPasswordReset(email);
      if (response.status === 200) {
        messageApi.success("ส่งรหัสยืนยันไปที่อีเมลของคุณแล้ว");
        setStep(2);
        setTimer(5 * 60);
      } else {
        messageApi.error(response.data.error || "ไม่สามารถส่งรหัสยืนยันได้");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: ตรวจสอบรหัสยืนยัน ---
  const handleUuidSubmit = async () => {
    const uuidString = uuid.join("");
    if (uuidString.length < 6) {
      return messageApi.error("กรุณากรอกรหัสให้ครบ 6 หลัก");
    }

    setLoading(true);
    try {
      const response = await validateApi({ token: uuidString });
      if (response.status === 200) {
        // เก็บข้อมูลไว้ใช้ step 3
        localStorage.setItem("userId", response.data.id);
        localStorage.setItem("jwt", response.data.jwt);
        messageApi.success("รหัสยืนยันถูกต้อง กรุณาตั้งรหัสผ่านใหม่");
        setStep(3);
      } else {
        messageApi.error(response.data.error || "รหัสยืนยันไม่ถูกต้องหรือหมดอายุ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน");
    } finally {
      setLoading(false);
    }
  };

  // การเปลี่ยนค่า uuid 6 ตัว และเลื่อนไป input ถัดไป
  const handleChangeUuid = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
  const handleKeyDownUuid = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && uuid[index] === "" && index > 0) {
      const prevInput = document.getElementById(`uuid-input-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleResendToken = async () => {
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

  // --- Step 3: ตั้งรหัสผ่านใหม่ ---
  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      return messageApi.error("รหัสผ่านไม่ตรงกัน");
    }
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const jwtToken = localStorage.getItem("jwt");
      if (!userId || !jwtToken) {
        messageApi.error("ไม่พบข้อมูลผู้ใช้หรือไม่พบ token");
        return;
      }
      const response = await resetPassword(Number(userId), newPassword, jwtToken);
      if (response.status === 200) {
        messageApi.success("ตั้งรหัสผ่านใหม่สำเร็จ");
        localStorage.removeItem("userId");
        localStorage.removeItem("jwt");
        navigate("/"); // กลับหน้า login
      } else {
        messageApi.error(response.data.error || "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่");
    } finally {
      setLoading(false);
    }
  };

  // --- UI Step ต่างๆ ---

  const renderStep1 = () => (
    <>
      <Title level={3} className="title">🔐 ลืมรหัสผ่าน</Title>
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
         <div className="back-to-login">
            <Text>หรือ </Text>
            <a onClick={() => navigate("/")}>กลับสู่หน้าล็อกอิน</a>
          </div>
      </Form>
    </>
  );

  const renderStep2 = () => (
    <>
      <Title level={3}>กรอกรหัสยืนยัน</Title>
      <Form onFinish={handleUuidSubmit} className="validate-form">
        <Form.Item label="รหัสยืนยัน" name="uuid">
          <div className="uuid-input-group">
            {uuid.map((value, index) => (
              <Input
                key={index}
                id={`uuid-input-${index}`}
                value={value}
                onChange={(e) => handleChangeUuid(e, index)}
                onKeyDown={(e) => handleKeyDownUuid(e, index)}
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
    </>
  );

  const renderStep3 = () => (
    <>
      <Title level={3}>ตั้งรหัสผ่านใหม่</Title>
      <Form layout="vertical" onFinish={handlePasswordReset}>
        <Form.Item
          label="รหัสผ่านใหม่"
          name="newPassword"
          rules={[
            { required: true, message: "กรุณากรอกรหัสผ่านใหม่" },
            { min: 8, message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัว" },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: "รหัสผ่านต้องมีตัวอักษรตัวเล็ก ตัวใหญ่ และตัวเลข" }
          ]}
        >
          <Input.Password
            placeholder="กรอกรหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="ยืนยันรหัสผ่าน"
          name="confirmPassword"
          rules={[
            { required: true, message: "กรุณายืนยันรหัสผ่านใหม่" },
            () => ({
              validator(_, value) {
                if (!value || newPassword === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 10 }}>
            ตั้งรหัสผ่านใหม่
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  return (
    <>
      {contextHolder}
      <div className="forgot-password-wrapper">
        <StepIndicator currentStep={step} />

        <Card className="forgot-password-card1">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

      
        </Card>
      </div>
    </>
  );
};

export default ForgotPasswordStepPage;
