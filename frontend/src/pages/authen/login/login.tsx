import { Button, Card, Form, Input, message, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { SignIn } from "../../../services/https/login";
import { SignInInterface } from "../../../interfaces/SignIn";

// ตรวจสอบเส้นทางไฟล์รูปภาพให้ถูกต้อง
import smile from "../../../assets/smiles.png";  // รูปภาพที่อยู่ในโฟลเดอร์ assets
import "./login.css"; // ใช้ CSS ที่แก้ไขแล้ว

function SignInPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: SignInInterface) => {
    let res = await SignIn(values);

    if (res.status === 200) {
      messageApi.success("เข้าสู่ระบบ สำเร็จ!");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      console.log("token",res.data.token)
      localStorage.setItem("id", res.data.id);

      let redirectPath = "/";

      switch (res.data.role) {
        case "superadmin":
          redirectPath = "/superadmin";
          break;
        case "admin":
          redirectPath = "/admin";
          break;
        case "user":
          redirectPath = "/user";
          break;
        default:
          redirectPath = "/";
      }

      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="login-wrapper">
        {/* Left Section: Smiley & Circle */}
        <div className="left-section">
          <div className="left-content">
    {/* ไอคอนบวก */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="plus-icon"
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFF"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>

  
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="plus-icon2"
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C2F4FF"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
    
    </div>
  <div className="blue-circle" />
  
  </div>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      className="plus-icon3"
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFF"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>

     <svg
      xmlns="http://www.w3.org/2000/svg"
      className="plus-icon4"
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFF"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="plus-icon1"
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFF"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
<svg
  xmlns="http://www.w3.org/2000/svg"
  className="smile1"
  width="48" height="48"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#D3D3D3"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="12" r="10" stroke="none" fill="#F5F5F5" />  {/* ลบเส้นขอบ */}
  <path d="M8 15 C10 17, 14 17, 16 15" stroke="#D3D3D3" strokeWidth="2" fill="none" />
  <circle cx="9" cy="10" r="1" fill="#D3D3D3" />
  <circle cx="15" cy="10" r="1" fill="#D3D3D3" />
</svg>

<svg
    xmlns="http://www.w3.org/2000/svg"
    className="smile2"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#D3D3D3"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="yellowPink" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFF9C4', stopOpacity: 1 }} /> {/* สีเหลืองอ่อน */}
        <stop offset="100%" style={{ stopColor: '#F8BBD0', stopOpacity: 1 }} /> {/* สีชมพูอ่อน */}
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="none" fill="url(#yellowPink)" /> {/* Gradient สำหรับวงกลม */}
    <path d="M8 18 C10 16, 14 16, 16 18" stroke="#D3D3D3" strokeWidth="2" fill="none" /> {/* ปากคว่ำ */}
    <circle cx="9" cy="10" r="1" fill="#D3D3D3" />
    <circle cx="15" cy="10" r="1" fill="#D3D3D3" />
</svg>

<svg
  xmlns="http://www.w3.org/2000/svg"
  className="smile3"
  width="48" height="48"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#D3D3D3"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="12" r="10" stroke="none" fill="#FFF9C4" />  {/* ลบเส้นขอบ */}
  <path d="M8 15 C10 17, 14 17, 16 15" stroke="#D3D3D3" strokeWidth="2" fill="none" />
  <circle cx="9" cy="10" r="1" fill="#D3D3D3" />
  <circle cx="15" cy="10" r="1" fill="#D3D3D3" />
</svg>


<svg
    xmlns="http://www.w3.org/2000/svg"
    className="smile4"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#D3D3D3"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF9800', stopOpacity: 1 }} /> {/* สีส้ม */}
        <stop offset="100%" style={{ stopColor: '#FFCC80', stopOpacity: 1 }} /> {/* สีส้มอ่อน */}
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="none" fill="url(#orangeGradient)" /> {/* Gradient สำหรับวงกลม */}
    <path d="M8 18 C10 16, 14 16, 16 18" stroke="#D3D3D3" strokeWidth="2" fill="none" /> {/* ปากคว่ำ */}
    <circle cx="9" cy="10" r="1" fill="#D3D3D3" />
    <circle cx="15" cy="10" r="1" fill="#D3D3D3" />
  </svg>


<img className="smiley-image" src={smile} alt="smiley" />


        {/* Right Section: Login Form */}
        <div className="right-section">
          <Card className="card-login">
            <Row>
              <Col span={24}>
                <h1>SUT SUKJAI</h1>
                <h2>ยินดีต้อนรับเข้าสู่ระบบ</h2>
                <Form name="basic" onFinish={onFinish} autoComplete="off" layout="vertical">
                  <Form.Item
                    label="กรุณากรอกอีเมล"
                    name="email"
                    rules={[{ required: true, message: "Please input your email!" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="กรุณากรอกรหัสผ่าน"
                    name="password"
                    rules={[{ required: true, message: "Please input your password!" }]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-button">
                      เข้าสู่ระบบ
                    </Button>
                    หรือ <a onClick={() => navigate("/signup")}>สร้างบัญชีใหม่</a>
                    <br />
                    <a href="/forgot-password" className="forgot-password-link">ลืมรหัสผ่าน?</a>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </>
  );
}

export default SignInPages;
