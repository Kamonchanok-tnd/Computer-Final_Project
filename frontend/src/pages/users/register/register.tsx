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
import logo from "../../../assets/ยินดีต้อนรับ.png";

const { Title, Text } = Typography;

function SignUpPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const genderOptions = [
    { value: "Male", label: "ชาย" },
    { value: "Female", label: "หญิง" },
    { value: "Other", label: "อื่นๆ" },
  ];

  const [isConsentVisible, setIsConsentVisible] = useState(true);

  const handleConsentOk = () => setIsConsentVisible(false);
  const handleConsentCancel = () =>
    messageApi.warning("คุณต้องยินยอมก่อนสมัครสมาชิก");

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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 relative">
      {contextHolder}

      {/* Left Image Side */}
      <div className="flex-2 relative overflow-hidden hidden md:block">
        <img
          src={logo}
          alt="Register"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form Side */}
      <div
        className={`flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-white to-cyan-100 transition duration-300 ${
          isConsentVisible ? "brightness-75 pointer-events-none" : ""
        }`}
      >
        <Card
          className="w-full max-w-2xl rounded-2xl shadow-xl border-0 bg-white"
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

              <Col xs={24} md={12}>
                <Form.Item
                  label="อายุ"
                  name="age"
                  rules={[{ required: true, message: "กรุณากรอกอายุ !" }]}
                >
                  <InputNumber min={0} max={99} className="w-full" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
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

              <Col xs={24} md={12}>
                <Form.Item label="Facebook (ไม่จำเป็น)" name="facebook">
                  <Input placeholder="Facebook" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Line (ไม่จำเป็น)" name="line">
                  <Input placeholder="Line ID" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
                    สมัครสมาชิก
                  </Button>
                  <Text className="block mt-2">
                    หรือ{" "}
                    <a onClick={() => navigate("/")} className="text-blue-600">
                      เข้าสู่ระบบ
                    </a>
                  </Text>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>

      {/* Custom Popup */}
{isConsentVisible && (
  <div className="fixed inset-0 bg-gray-200/80 flex items-center justify-center z-[9999] animate-fadeIn">
    <Card className="w-96 rounded-2xl p-6 text-center shadow-2xl animate-scaleUp">
      <Title level={3}>ขอความยินยอม</Title>
      <Text>
        เว็บไซต์เกี่ยวกับสุขภาพจิต ข้อมูลของคุณจะถูกเก็บเป็นความลับ
        กรุณายืนยันความยินยอมก่อนสมัครสมาชิก
      </Text>
      <div className="mt-6 flex justify-around">
        <Button type="default" onClick={handleConsentCancel}>
          ปฏิเสธ
        </Button>
        <Button type="primary" onClick={handleConsentOk}>
          ยินยอม
        </Button>
      </div>
    </Card>
  </div>
)}

{/* Animations */}
<style>{`
  @keyframes fadeIn {
    from {opacity:0;}
    to {opacity:1;}
  }
  @keyframes scaleUp {
    from {transform: scale(0.8); opacity:0;}
    to {transform: scale(1); opacity:1;}
  }
  .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
  .animate-scaleUp { animation: scaleUp 0.3s ease-in-out; }
`}</style>

    </div>
  );
}

export default SignUpPages;
