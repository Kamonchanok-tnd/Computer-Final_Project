import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { validateApi } from "../../../services/https/resetpassword"; // import ฟังก์ชัน validateApi จาก service
const { Title, Text } = Typography;

const ValidateUuidPage: React.FC = () => {
  const [uuid, setUuid] = useState(Array(6).fill('')); // รหัสยืนยันที่ผู้ใช้กรอก
  const [loading, setLoading] = useState(false); // โหลดข้อมูล
  const [timer, setTimer] = useState(5 * 60); // กำหนดเวลา 5 นาที
  const navigate = useNavigate();
  const [messageApi] = message.useMessage();

  // จับเวลานับถอยหลัง
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval); // หยุดจับเวลาเมื่อ component unmount หรือเวลาหมด
    }
  }, [timer]);

  // แปลงเวลาให้เป็นรูปแบบ mm:ss
  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleUuidSubmit = async () => {
  const uuidString = uuid.join(''); // รวมค่ารหัสยืนยันที่กรอกเป็น string
  if (!uuidString) {
    return messageApi.error("กรุณากรอกรหัสยืนยัน");
  }

  setLoading(true);
  try {
    const response = await validateApi({ token: uuidString }); // ตรวจสอบรหัสยืนยัน
    console.log(response); // เพื่อตรวจสอบข้อมูลจาก API
    if (response.status === 200) {
      // เก็บ id และ jwt ใน localStorage
      localStorage.setItem("userId", response.data.id);  // เก็บ id ของผู้ใช้
      localStorage.setItem("jwt", response.data.jwt);    // เก็บ jwt ที่ได้รับจาก backend
      messageApi.success("รหัสยืนยันถูกต้อง กรุณาตั้งรหัสผ่านใหม่");
      navigate("/update-password"); // นำทางไปยังหน้าเปลี่ยนรหัสผ่าน
    } else {
      messageApi.error(response.data.error || "รหัสยืนยันไม่ถูกต้องหรือหมดอายุ");
    }
  } catch (error) {
    messageApi.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน");
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: any, index: number) => {
    const newUuid = [...uuid];
    newUuid[index] = e.target.value;
    setUuid(newUuid);
  };

  const handleFocusNext = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Backspace' && uuid[index] !== '' && index < uuid.length - 1) {
      const nextInput = document.getElementById(`uuid-input-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleResendToken = () => {
    // ฟังก์ชันสำหรับส่งรหัสยืนยันใหม่
    setTimer(5 * 60); // รีเซ็ตเวลาเป็น 5 นาที
    messageApi.success("ส่งรหัสยืนยันใหม่ไปที่อีเมลของคุณแล้ว");
  };

  return (
    <div>
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Title level={3}>กรอกรหัสยืนยัน</Title>
      </Row>

      <Form onFinish={handleUuidSubmit}>
        <Form.Item label="รหัสยืนยัน" name="uuid">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {uuid.map((value, index) => (
              <Input
                key={index}
                id={`uuid-input-${index}`}
                value={value}
                onChange={(e) => handleChange(e, index)}
                maxLength={1}
                onKeyUp={(e) => handleFocusNext(e, index)}
                style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '18px', margin: '0 5px' }}
              />
            ))}
          </div>
        </Form.Item>

        {/* แสดงเวลาที่เหลือ */}
        <Row justify="space-between" style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14 }}>
            เวลาที่เหลือ: <b>{formatTimer()}</b>
          </Text>
          <Button
            type="link"
            onClick={handleResendToken}
            style={{
              fontSize: 14,
              padding: 0,
              color: "#0288d1",
              textDecoration: "underline",
            }}
          >
            ส่งรหัสใหม่
          </Button>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 10 }}>
            ตรวจสอบรหัส
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ValidateUuidPage;
