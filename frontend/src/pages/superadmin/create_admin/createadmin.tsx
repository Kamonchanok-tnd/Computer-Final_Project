import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  InputNumber,
  Select,
} from "antd";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interfaces/IUser";
import { CreateUser } from "../../../services/https/login";
import { useNavigate, Link } from "react-router-dom";
import "./create_admin.css";

function CreateAdmin() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [gender] = useState([
    { ID: 1, gender: "ชาย" },
    { ID: 2, gender: "หญิง" },
    { ID: 3, gender: "อื่นๆ" },
  ]);

  const onFinish = async (values: UsersInterface) => {
    const userData = { ...values, role: "superadmin" };
    let res = await CreateUser(userData);

    if (res.status === 201) {
      messageApi.open({
        type: "success",
        content: res.data.message,
      });
      setTimeout(() => {
        navigate("/superadmin");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#EBF8FF", // แทน bg-blue-50
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        fontFamily: "var(--font-ibmthai)", // <-- เพิ่มตรงนี้
        
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: "100%",
          maxWidth: "900px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          borderRadius: "12px",
          padding: "20px",
          fontFamily: "var(--font-ibmthai)", // <-- เพิ่มตรงนี้
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "var(--font-ibmthai)", // <-- เพิ่มตรงนี้
          }}
        >
          เพิ่มข้อมูลผู้ดูแลระบบ
        </h2>
        <Divider />
        <Form
          name="basic"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="create-admin-form"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้ !" }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="อีเมล"
                name="email"
                rules={[
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง !" },
                  { required: true, message: "กรุณากรอกอีเมล !" },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="รหัสผ่าน"
                name="password"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน !" }]}
              >
                <Input.Password size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="หมายเลขโทรศัพท์"
                name="phone_number"
                rules={[{ required: true, message: "กรุณากรอกหมายเลขโทรศัพท์ !" }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="อายุ"
                name="age"
                rules={[{ required: true, message: "กรุณากรอกอายุ !" }]}
              >
                <InputNumber
                  min={0}
                  max={99}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="เพศ"
                name="gender"
                rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}
              >
                <Select placeholder="เลือกเพศ" style={{ width: "100%" }} size="large">
                  {gender.map((item) => (
                    <Select.Option key={item.ID} value={item.gender}>
                      {item.gender}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Col style={{ marginTop: "20px" }}>
              <Form.Item>
                <Space>
                  <Link to="/superadmin">
                    <Button
                      htmlType="button"
                      size="large"
                      className="!bg-gray-200 !hover:bg-gray-300 !text-gray-800 px-8 !font-ibmthai"
                    >
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="!bg-blue-500 !hover:bg-blue-600 !text-white px-8 !font-ibmthai"
                  >
                    บันทึก
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default CreateAdmin;
