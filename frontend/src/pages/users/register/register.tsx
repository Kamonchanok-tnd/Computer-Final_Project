// SignUpPages.tsx

import {
  Button,
  Card,
  Form,
  Input,
  message,
  Row,
  Col,
  InputNumber,
  Select,
  Typography,
  Divider,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { UsersInterface } from "../../../interfaces/IUser";
import { CreateUser } from "../../../services/https/login";
import "./register.css";
import logo from "../../../assets/สมาธิผู้หญิง.png"; 

const { Title, Text } = Typography;

function SignUpPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const genderOptions = [
    { value: "Male", label: "ชาย" },
    { value: "Female", label: "หญิง" },
    { value: "Other", label: "อื่นๆ" },
  ];

  const onFinish = async (values: UsersInterface) => {
    values.Role = "user";

    let res = await CreateUser(values);

    if (res.status === 201) {
      messageApi.success("ลงทะเบียนสำเร็จ!");
      setTimeout(() => navigate("/"), 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f0f2f5",
      }}
    >
      {contextHolder}

      {/* Left Image Side */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#dbeafe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <img
          src={logo}
          alt="Register"
          style={{ maxWidth: "100%", maxHeight: "90%", borderRadius: 12 }}
        />
      </div>

      {/* Right Form Side */}
      <div
        style={{
          flex: 1,
          padding: "60px 40px",
          background: "linear-gradient(135deg, #FFF 0%, #C2F4FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 700,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "none",
            backgroundColor: "#FFF"
          }}
        >
          <Title level={2}>สมัครสมาชิก</Title>
          <Text type="secondary">กรอกข้อมูลเพื่อสร้างบัญชีของคุณ</Text>
          <Divider />

          <Form layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="ชื่อผู้ใช้งาน"
                  name="username"
                  rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน !" }]}
                >
                  <Input placeholder="Username" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="อีเมล"
                  name="email"
                  rules={[
                    { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง !" },
                    { required: true, message: "กรุณากรอกอีเมล !" },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="รหัสผ่าน"
                  name="password"
                  rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน !" }]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="อายุ"
                  name="age"
                  rules={[{ required: true, message: "กรุณากรอกอายุ !" }]}
                >
                  <InputNumber min={0} max={99} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="เพศ"
                  name="gender"
                  rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}
                >
                  <Select placeholder="เลือกเพศ">
                    {genderOptions.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="เบอร์โทรศัพท์"
                  name="phone_number"
                  rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์ !" }]}
                >
                  <Input placeholder="Phone Number" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Facebook (ไม่จำเป็น)" name="facebook">
                  <Input placeholder="Facebook" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Line (ไม่จำเป็น)" name="line">
                  <Input placeholder="Line ID" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
                    สมัครสมาชิก
                  </Button>
                  <Text style={{ display: "block", marginTop: 10 }}>
                    หรือ <a onClick={() => navigate("/")}>เข้าสู่ระบบ</a>
                  </Text>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default SignUpPages;
