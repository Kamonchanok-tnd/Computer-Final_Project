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
import "./register.css";
const { Title, Text } = Typography;

function SignUpPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const genderOptions = [
    { value: "Male", label: "ชาย" },
    { value: "Female", label: "หญิง" },
    { value: "Other", label: "อื่นๆ" },
  ];

  // state สำหรับ consent
  const [isConsentVisible, setIsConsentVisible] = useState(true);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<Date | null>(null);

  // ฟังก์ชันกดยอมรับ
  const handleConsentOk = () => {
    const now = new Date();
    setConsentAccepted(true);
    setConsentAcceptedAt(now);
    setIsConsentVisible(false);
  };

  const handleConsentCancel = () =>
    messageApi.warning("คุณต้องยินยอมก่อนสมัครสมาชิก");

  const onFinish = async (values: UsersInterface) => {
    if (!consentAccepted || !consentAcceptedAt) {
      messageApi.error("คุณต้องยินยอมก่อนสมัครสมาชิก");
      return;
    }

    const payload = {
    ...values,
    consent_accepted: consentAccepted,
    consent_accepted_at: consentAcceptedAt,
    role: "user"
  };

  let res = await CreateUser(payload);
    console.log("ข้อมูลผู้ใช้",res);

    if (res.status === 201) {
      messageApi.success("ลงทะเบียนสำเร็จ!");
      setTimeout(() => navigate("/"), 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-gray-100 relative"
      style={{ fontFamily: "'IBM Plex Sans Thai', ui-sans-serif, system-ui, sans-serif" }}
    >
      {contextHolder}

      {/* Left Image Side */}
      <div className="hidden md:flex md:flex-2 relative overflow-hidden">
        <img
          src={logo}
          alt="Register"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form Side */}
      <div
        className={`flex-1 flex items-center justify-center bg-gradient-to-br from-white to-cyan-100 transition duration-300 ${
          isConsentVisible ? "brightness-75 pointer-events-none" : ""
        }`}
      >
        <Card
          className="w-full h-full rounded-none shadow-none border-0 bg-white overflow-auto !bg-gradient-to-t from-cyan-100 to-white"
          bodyStyle={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="w-full">
            {/* SVG หน้าอารมณ์ */}
          <div className="flex justify-center gap-6 mb-8">
            {/* ยิ้ม สีฟ้า */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              <circle cx="12" cy="12" r="10" fill="#BBDEFB" />
              <path
                d="M8 15 C10 17, 14 17, 16 15"
                stroke="#1976D2"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="9" cy="10" r="1" fill="#1976D2" />
              <circle cx="15" cy="10" r="1" fill="#1976D2" />
            </svg>

            {/* เศร้า สีชมพู */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              style={{ animationDuration: "2.5s" }}
            >
              <circle cx="12" cy="12" r="10" fill="#F8BBD0" />
              <path
                d="M8 17 C10 15, 14 15, 16 17"
                stroke="#C2185B"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="9" cy="10" r="1" fill="#C2185B" />
              <circle cx="15" cy="10" r="1" fill="#C2185B" />
            </svg>

            {/* โกรธ สีส้ม */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              style={{ animationDuration: "1.5s" }}
            >
              <circle cx="12" cy="12" r="10" fill="#FFCC80" />
              <path
                d="M8 15 C10 17, 14 17, 16 15"
                stroke="#F57C00"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="9" cy="10" r="1" fill="#F57C00" />
              <circle cx="15" cy="10" r="1" fill="#F57C00" />
            </svg>
            {/* เขียว สดชื่น */}
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="48"
  height="48"
  viewBox="0 0 24 24"
  fill="none"
  className="animate-bounce"
  style={{ animationDuration: "2.2s" }}
>
  <circle cx="12" cy="12" r="10" fill="#C8E6C9" />
  <path
    d="M8 17 C10 15, 14 15, 16 17"
    stroke="#388E3C"
    strokeWidth="2"
    fill="none"
  />
  <circle cx="9" cy="10" r="1" fill="#388E3C" />
  <circle cx="15" cy="10" r="1" fill="#388E3C" />
</svg>

{/* ม่วง สงบ */}
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="48"
  height="48"
  viewBox="0 0 24 24"
  fill="none"
  className="animate-bounce"
  style={{ animationDuration: "1.8s" }}
>
  <circle cx="12" cy="12" r="10" fill="#E1BEE7" />
  <path
    d="M8 15 C10 17, 14 17, 16 15"
    stroke="#7B1FA2"
    strokeWidth="2"
    fill="none"
  />
  <circle cx="9" cy="10" r="1" fill="#7B1FA2" />
  <circle cx="15" cy="10" r="1" fill="#7B1FA2" />
</svg>

            
          </div>
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
                    <InputNumber min={0} max={99} className="!w-full" />
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
                        กลับสู่หน้าล็อกอิน
                      </a>
                    </Text>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Card>
      </div>

      {isConsentVisible && (
  <div className="fixed inset-0 bg-gray-200/90 flex items-center justify-center z-[9999] animate-fadeIn overflow-auto p-4">
    <Card className="max-w-3xl w-full rounded-2xl p-6 shadow-2xl animate-scaleUp leading-relaxed">
      <Title level={3} className="text-center mb-6">
        แบบฟอร์มยินยอมการใช้งานแอปพลิเคชัน SUT Healjai
      </Title>

      <div className="text-justify space-y-5 max-h-[70vh] overflow-y-auto pr-2">
        <p>
          ขอเสนอโครงการวิจัยเรื่อง <b>“ผลของแอปพลิเคชัน SUT Healjai ที่มีต่อภาวะซึมเศร้าและการตระหนักรู้ในตนเองของนักศึกษาพยาบาลศาสตร์
          มหาวิทยาลัยเทคโนโลยีสุรนารี”</b> โดยมีวัตถุประสงค์เพื่อเปรียบเทียบระดับคะแนนเฉลี่ยภาวะซึมเศร้าและการตระหนักรู้ในตนเองก่อนและหลังการใช้แอปพลิเคชัน SUT Healjai
        </p>

        <p>
          <b>ประโยชน์โดยตรง:</b> ผู้เข้าร่วมวิจัยจะได้รับการส่งเสริมสุขภาพจิต ลดระดับภาวะซึมเศร้า และพัฒนาความสามารถในการตระหนักรู้ตนเอง
          ซึ่งเป็นทักษะสำคัญในการจัดการกับอารมณ์ ความเครียด และปัญหาชีวิต
        </p>

        <p>
          ท่านมีอิสระที่จะตัดสินใจเข้าร่วมการวิจัยหรือไม่ก็ได้ หากตัดสินใจเข้าร่วม ท่านจะต้องตอบแบบสอบถามผ่านแอปพลิเคชัน SUT Healjai 
          และสามารถถอนตัวเมื่อใดก็ได้โดยไม่ต้องแจ้งล่วงหน้า การไม่เข้าร่วมหรือถอนตัวจะไม่กระทบต่อการเรียน
        </p>

        <p>
          ข้อมูลที่ได้จะถูกเก็บรักษาอย่างปลอดภัย ไม่เปิดเผยต่อสาธารณะเป็นรายบุคคล รายงานผลเฉพาะภาพรวม 
          อย่างไรก็ตาม อาจมีบางหน่วยงาน เช่น คณะกรรมการจริยธรรมการวิจัยในมนุษย์ หรือเจ้าหน้าที่ตรวจสอบ เข้าดูข้อมูลเพื่อความถูกต้องได้ 
          ข้อมูลจะถูกทำลายหลังเสร็จสิ้นการวิจัย
        </p>

        <p>
          ผู้เข้าร่วมจะไม่ได้รับค่าตอบแทนและไม่เสียค่าใช้จ่ายใด ๆ ทั้งสิ้น
        </p>

        <p>
          หากมีข้อสงสัย โปรดติดต่อ <b>ผศ. ดร.ศุภาพิชญ์ มณีสาคร โฟน โบร์แมนน์ <br/>โทรศัพท์: 081-2070788</b>
        </p>

        <p>
          หากต้องการทราบสิทธิ โปรดติดต่อ <b>สำนักงานจริยธรรมการวิจัยในมนุษย์ มหาวิทยาลัยเทคโนโลยีสุรนารี <br /> 
          โทรศัพท์: 044-224757 <br /> E-mail: ecsut@sut.ac.th </b>
        </p>

        <Divider />

        <p>
          <b>
          ข้าพเจ้าได้อ่านหรือรับฟังคำอธิบาย เข้าใจวัตถุประสงค์ ขั้นตอน ประโยชน์ ความเสี่ยง และมาตรการต่าง ๆ แล้ว 
          ข้อมูลส่วนบุคคลจะถูกเก็บเป็นความลับและใช้เพื่อประโยชน์ทางวิชาการเท่านั้น ข้าพเจ้าสามารถถอนตัวได้ทุกเมื่อโดยไม่เสียสิทธิ์ใด ๆ  
          ข้าพเจ้าขอแสดงความยินยอมเข้าร่วมการวิจัยครั้งนี้โดยสมัครใจ
          </b>
        </p>
      </div>

      <div className="mt-8 flex justify-around">
        <Button type="default" danger onClick={handleConsentCancel}>
          ไม่ยอมรับ
        </Button>
        <Button type="primary" onClick={handleConsentOk}>
          ยอมรับ
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
