import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";

import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../../services/https/resetpassword";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState(""); // รหัสผ่านใหม่
  const [confirmPassword, setConfirmPassword] = useState(""); // ยืนยันรหัสผ่าน
  const [loading, setLoading] = useState(false); // โหลดข้อมูล
  const navigate = useNavigate();
  const [messageApi] = message.useMessage();

  const handlePasswordReset = async () => {
  if (newPassword !== confirmPassword) {
    return messageApi.error("รหัสผ่านไม่ตรงกัน");
  }

  setLoading(true);
  try {
    const userId = localStorage.getItem("userId");
    console.log("userid",userId)
    const jwtToken = localStorage.getItem("jwt");  // ดึง jwt จาก localStorage
    console.log("jwt",jwtToken)

    if (!userId || !jwtToken) {
      messageApi.error("ไม่พบข้อมูลผู้ใช้หรือไม่พบ token");
      return;
    }

    const response = await resetPassword(Number(userId), newPassword, jwtToken); // เปลี่ยนรหัสผ่านโดยใช้ userId และ jwt
    if (response.status === 200) {
      messageApi.success("ตั้งรหัสผ่านใหม่สำเร็จ");
      navigate("/"); // นำทางไปที่หน้า Login
    } else {
      messageApi.error(response.data.error || "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
    }
  } catch (error) {
    messageApi.error("เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่");
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
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
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
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
    </div>
  );
};

export default ResetPasswordPage;
