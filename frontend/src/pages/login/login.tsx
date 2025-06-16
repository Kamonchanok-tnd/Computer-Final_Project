import { Button, Card, Form, Input, message, Flex, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { SignIn } from "../../services/https/login";
import { SignInInterface } from "../../interfaces/SignIn";
import logo from "../../assets/login.png";
import "./login.css"; // Create a separate CSS file for styling
import "../../responsive/responsive.css";

function SignInPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: SignInInterface) => {
    let res = await SignIn(values);

    if (res.status === 200) {
      messageApi.success("Sign-in successful");

      // Save data after login
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("role", res.data.role);
      console.log(res.data.role);
      localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);

      // Route based on user role
      let redirectPath = "/";

      switch (res.data.role) {
        case "admin":
          redirectPath = "/admin";
          break;
        case "user":
          redirectPath = "/user";
          break;
        default:
          redirectPath = "/login";
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
      <div className="login-wrapper"> {/* Wrapper class here */}
        <Flex justify="center" align="center" className="login-page">
          <Card className="card-login">
            <Row align={"middle"} justify={"center"}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <img alt="logo" className="login-logo" src={logo} />
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <h1>สุขภาพจิตสุขภาพใจ</h1>
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
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Flex>
      </div>
    </>
  );
}

export default SignInPages;
