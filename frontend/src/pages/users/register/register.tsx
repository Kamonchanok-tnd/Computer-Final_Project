import {
  Button,
  Card,
  Form,
  Input,
  message,
  Row,
  Col,
  //InputNumber,
  Select,
  Typography,
  Divider,
  DatePicker,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { UsersInterface } from "../../../interfaces/IUser";
import { CreateUser } from "../../../services/https/login";
import logo from "../../../assets/ยินดีต้อนรับ.png";
import "./register.css";
const { Title, Text } = Typography;
import dayjs from "dayjs";
import "dayjs/locale/th";
import thTH from 'antd/es/date-picker/locale/th_TH';


function SignUpPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const genderOptions = [
    { value: "ชาย", label: "ชาย" },
    { value: "หญิง", label: "หญิง" },
    { value: "LGBTQ+", label: "LGBTQ+" },
    { value: "ไม่ระบุ", label: "ไม่ระบุ" },
  ];

  // state สำหรับ consent
  const [isConsentVisible, setIsConsentVisible] = useState(true);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<Date | null>(null);

  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  const handleScroll = (e: any) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    setIsScrolledToEnd(true);
  }
};



  // ฟังก์ชันกดยอมรับ
  const handleConsentOk = () => {
  const now = new Date();
  setConsentAccepted(true);
  setConsentAcceptedAt(now);
  setIsConsentVisible(false);
  
};


  const handleConsentCancel = () => {
  message.error("คุณต้องยินยอมก่อนสมัครสมาชิก"); // ✅ แจ้งเตือนเป็น message
};

  const onFinish = async (values: UsersInterface) => {
    if (!consentAccepted || !consentAcceptedAt) {
      messageApi.error("คุณต้องยินยอมก่อนสมัครสมาชิก");
      return;
    }

    // ✅ แปลงวันเกิดเป็น YYYY-MM (string) ก่อนส่ง
    if (values.birth_date) {
      values.birth_date = dayjs(values.birth_date).format("YYYY-MM");
    }

    const payload = {
    ...values,
    consent_accepted: consentAccepted,
    consent_accepted_at: consentAcceptedAt,
    role: "user",
    phone_number: values.PhoneNumber || ""
  };
  console.log("payload >>>", payload);
  const res = await CreateUser(payload);
    // console.log("ข้อมูลผู้ใช้",res);

    if (res.status === 201) {
      messageApi.success("ลงทะเบียนสำเร็จ");
      setTimeout(() => navigate("/"), 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };
const personTypeOptions = [
  { value: "นักศึกษามทส", label: "นักศึกษามทส" },
  { value: "บุคคลภายนอก", label: "บุคคลภายนอก" },
  { value: "อาจารย์", label: "อาจารย์" },
];

const facultyOptions = [
  "สำนักวิชาสาธารณสุขศาสตร์",
  "สำนักวิชาทันตแพทยศาสตร์",
  "สำนักวิชาพยาบาลศาสตร์",
  "สำนักวิชาวิศวกรรมศาสตร์",
  "สำนักวิชาแพทยศาสตร์",
  "สำนักวิชาเทคโนโลยีการเกษตร",
  "สำนักวิชาเทคโนโลยีสังคม",
  "สำนักวิชาวิทยาศาสตร์",
  "สำนักวิชาศาสตร์และศิลป์ดิจิทัล",
];

const yearOptions = [
  { value: "ชั้นปี 1", label: "ชั้นปี 1" },
  { value: "ชั้นปี 2", label: "ชั้นปี 2" },
  { value: "ชั้นปี 3", label: "ชั้นปี 3" },
  { value: "ชั้นปี 4", label: "ชั้นปี 4" },
  { value: "ชั้นปี 5", label: "ชั้นปี 5" },
  { value: "ชั้นปี 6", label: "ชั้นปี 6" },
  { value: "6 ปีขึ้นไป", label: "6 ปีขึ้นไป" },
];


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
                    <Input placeholder="ชื่อผู้ใช้" />
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
                    <Input placeholder="อีเมล" />
                  </Form.Item>
                </Col>

                <Col span={24}>
  <Form.Item
    label="รหัสผ่าน"
    name="password"
    rules={[
      { required: true, message: "กรุณากรอกรหัสผ่าน !" },
      { 
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร พร้อมตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ"
      },
    ]}
  >
    <Input.Password placeholder="รหัสผ่าน" />
  </Form.Item>
</Col>
<Col span={24}>
  <Form.Item
    label="ประเภทผู้ใช้งาน"
    name="person_type"
    rules={[{ required: true, message: "กรุณาเลือกประเภทผู้ใช้งาน !" }]}
  >
    <Select
      placeholder="เลือกประเภทผู้ใช้งาน"
      options={personTypeOptions}
    />
  </Form.Item>
</Col>

{/* ถ้าเลือกเป็นนักศึกษามทส -> แสดงฟอร์มสำนักวิชาและชั้นปี */}
<Form.Item noStyle shouldUpdate={(prev, curr) => prev.person_type !== curr.person_type}>
  {({ getFieldValue }) =>
    getFieldValue("person_type") === "นักศึกษามทส" && (
      <>
        <Col span={24}>
          <Form.Item
            label="สำนักวิชา"
            name="faculty"
            rules={[{ required: true, message: "กรุณาเลือกสำนักวิชา !" }]}
          >
            <Select placeholder="เลือกสำนักวิชา">
              {facultyOptions.map((f) => (
                <Select.Option key={f} value={f}>
                  {f}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label="ชั้นปี"
            name="year"
            rules={[{ required: true, message: "กรุณาเลือกชั้นปี !" }]}
          >
            <Select placeholder="เลือกชั้นปี" options={yearOptions} />
          </Form.Item>
        </Col>
      </>
    )
  }
</Form.Item>

                {/* <Col xs={24} md={12}>
                  <Form.Item
                    label="อายุ"
                    name="age"
                    rules={[{ required: true, message: "กรุณากรอกอายุ !" }]}
                  >
                    <InputNumber min={0} max={99} className="!w-full" />
                  </Form.Item>
                </Col> */}
                <Col xs={24} md={12}>
            <Form.Item
                    label="เดือนและปีเกิด"
                    name="birth_date"
                    rules={[
                      { required: true, message: "กรุณาเลือกเดือนและปีเกิด !" },
                    ]}
                  >
                    <DatePicker
  picker="month"
  format="MMMM YYYY"
  locale={thTH}   // ✅ ใส่เป็น object ไม่ใช่ string
  className="!w-full"
  placeholder="เลือกเดือนและปีเกิด"
  disabledDate={(current) => current && current > dayjs().endOf("month")} 
/>


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
    name="phone"
    label="เบอร์โทรศัพท์  (กรณีต้องการให้ติดต่อกลับ)"
    rules={[
      {
        validator(_, value) {
          if (!value) return Promise.resolve();

          const phoneRegex = /^0\d{9}$/;
          if (!phoneRegex.test(value)) {
            return Promise.reject("รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง");
          }
          return Promise.resolve();
        },
      },
    ]}
  >
    <Input placeholder="ไม่บังคับกรอก" />
  </Form.Item>
</Col>


                <Col xs={24} md={12}>
                  <Form.Item label="Facebook (ไม่จำเป็น)" name="facebook">
                    <Input placeholder="เฟซบุ๊ก" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Line (ไม่จำเป็น)" name="line">
                    <Input placeholder="ไลน์ ไอดี" />
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
  <div className="fixed inset-0 bg-gray-200/90 flex items-center justify-center z-[999] animate-fadeIn overflow-auto p-4">
    <Card className="max-w-3xl w-full rounded-2xl p-6 shadow-2xl animate-scaleUp leading-relaxed">
      <Title level={3} className="text-center mb-6">
        แบบฟอร์มยินยอมการใช้งานแอปพลิเคชัน SUT Healjai
      </Title>

      <div
  className="text-justify space-y-5 max-h-[70vh] overflow-y-auto pr-2"
  onScroll={handleScroll}
>

        <p><b>ผู้สนใจเข้าร่วมการวิจัย</b></p>

    <p>
  เนื่องด้วยข้าพเจ้า ผศ.ดร.ศุภาพิชญ์ มณีสาคร โฟน โบร์แมนน์ สังกัดสำนักวิชาพยาบาลศาสตร์ 
  ผศ.ดร.ศรัญญา กาญจนวัฒนา สังกัดสำนักวิชาวิศวกรรมศาสตร์ และคณะผู้วิจัย 
  ได้พัฒนาแอพพลิเคชันขึ้นและกำลังดำเนินการวิจัย 
  <br />
  <b>เรื่อง “ผลของเว็บแอพพลิเคชัน SUT ฮีลใจ ต่อความเครียดและภาวะซึมเศร้าของนักศึกษามหาวิทยาลัย” </b>
  โดยมีวัตถุประสงค์เพื่อประเมินผลการใช้เว็บแอพพลิเคชัน ‘SUT Heal Jai’ 
  ในการช่วยลดความเครียดและภาวะซึมเศร้า
</p>


        <p>
          ท่านได้รับเชิญเข้าร่วมโครงการ เนื่องจากเป็นนักศึกษาชั้นปีที่ 1–4 ของมหาวิทยาลัยเทคโนโลยีสุรนารี 
          ที่มีระดับคะแนนความเครียดในระดับปานกลางขึ้นไป โดยเมื่อเข้าสู่โครงการ 
          ท่านจะได้ทดลองใช้เว็บแอพพลิเคชัน SUT Healjai ผ่านอุปกรณ์มือถือหรือคอมพิวเตอร์ 
          ซึ่งท่านจะได้รับความรู้และแนวทางอาจเป็นประโยชน์ต่อการจัดการความเครียด 
          และเป็นทางเลือกในการส่งเสริมสุขภาพจิต
        </p>

        <p>
          <b>ประโยชน์โดยตรง:</b> ท่านจะมีทางเลือกในการส่งเสริมสุขภาพจิตอย่างเหมาะสม 
          ซึ่งอาจช่วยลดความเครียดหรืออารมณ์เศร้าของท่านได้ หากท่านสนใจเข้าร่วม 
          ท่านจะตอบแบบสอบถามก่อนเริ่มการวิจัยจำนวน 27 ข้อ จากนั้นจะได้รับคำแนะนำวิธีใช้เว็บแอพ 
          และใช้เว็บแอพอย่างน้อยวันละ 10 นาทีติดต่อกัน 14 วัน 
          จากนั้นจะตอบแบบสอบถามหลังการวิจัย 22 ข้อ และแบบสอบถามติดตามผล 1 เดือน จำนวน 17 ข้อ
        </p>

        <p>
          หากท่านรู้สึกอึดอัด ไม่สบายใจกับบางคำถาม ท่านมีสิทธิไม่ตอบได้ 
          รวมถึงมีสิทธิถอนตัวได้ทุกเมื่อโดยไม่ต้องแจ้งล่วงหน้า 
          การไม่เข้าร่วมหรือถอนตัวจะไม่ส่งผลต่อการเรียนของท่าน
        </p>

        <p>
          ท่านอาจมีความเสี่ยงด้านการจัดสรรเวลา หรือความเครียดจากการประเมินผลที่ไม่คาดคิด 
          โดยผู้วิจัยมีมาตรการลดความเสี่ยง เช่น ให้คำปรึกษาเบื้องต้น 
          ใช้แบบสอบถามที่ไม่ละเมิดความเป็นส่วนตัว และรับประกันความลับข้อมูล
        </p>

        <p>
          ข้อมูลของท่านจะถูกเก็บรักษาอย่างปลอดภัย ไม่เปิดเผยเป็นรายบุคคล 
          แต่รายงานผลเฉพาะภาพรวมเท่านั้น อย่างไรก็ตาม 
          อาจมีบุคคลที่ได้รับอนุญาต เช่น คณะกรรมการจริยธรรม ผู้ประสานงานวิจัย 
          หรือเจ้าหน้าที่ตรวจสอบของรัฐ เข้าดูข้อมูลเพื่อความถูกต้องได้ 
          ข้อมูลจะถูกทำลายหลังเสร็จสิ้นการวิจัย
        </p>

        <p>
          การเข้าร่วมวิจัยครั้งนี้อาสาสมัครจะไม่ได้รับค่าตอบแทนและไม่เสียค่าใช้จ่ายใดๆ ทั้งสิ้น
        </p>

        <p>
          หากท่านมีข้อสงสัย โปรดติดต่อ <b>ผศ.ดร.ศุภาพิชญ์ มณีสาคร โฟน โบร์แมนน์ โทร. 081-2070788</b>
        </p>

        <p>
          หากท่านได้รับการปฏิบัติไม่ตรงตามที่ระบุไว้หรือต้องการทราบสิทธิของท่านขณะเข้าร่วมการวิจัยนี้ <br/>  <b>สามารถติดต่อได้ที่ 
          สำนักงานจริยธรรมการวิจัยในมนุษย์ มหาวิทยาลัยเทคโนโลยีสุรนารี เลขที่ 111 ถนนมหาวิทยาลัย <br/> ตำบลสุรนารี อำเภอเมือง จังหวัดนครราชสีมา 30000 </b><br/> <b>
          โทรศัพท์: 044-224757<br/>
          E-mail: ecsut@sut.ac.th
          </b>
        </p>

        <Divider />

        <p>
          <b>
            ข้าพเจ้าได้อ่านหรือรับฟังคำอธิบาย เข้าใจวัตถุประสงค์ ขั้นตอน ประโยชน์ ความเสี่ยง 
            และมาตรการต่าง ๆ แล้ว ข้อมูลส่วนบุคคลจะถูกเก็บเป็นความลับและใช้เพื่อประโยชน์ทางวิชาการเท่านั้น 
            ข้าพเจ้าสามารถถอนตัวได้ทุกเมื่อโดยไม่เสียสิทธิ์ใด ๆ  
            ข้าพเจ้าขอแสดงความยินยอมเข้าร่วมการวิจัยครั้งนี้โดยสมัครใจ
          </b>
        </p>

      </div>

      <div className="mt-8 flex justify-around">
        <Button type="default" danger onClick={handleConsentCancel}>
          ไม่ยอมรับ
        </Button>
       <Button
  type="primary"
  onClick={handleConsentOk}
  disabled={!isScrolledToEnd}
>
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
