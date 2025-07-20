import {
  Button,
  Card,
  Form,
  Input,
  message,
  Flex,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Select,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { UsersInterface } from "../../../interfaces/IUser";
import { CreateUser } from "../../../services/https/login";

import logo from "../../../assets/login.png";

function SignUpPages() {
  const navigate = useNavigate();
  
  // สร้าง hook สำหรับแสดงข้อความ
  const [messageApi, contextHolder] = message.useMessage(); // ใช้ message API แสดงข้อความ

  const genderOptions = [
    { value: 'Male', label: 'ชาย' },
    { value: 'Female', label: 'หญิง' },
    { value: 'Other', label: 'อื่นๆ' },
  ];

  const onFinish = async (values: UsersInterface) => {
    values.Role = "user";  // ตั้งค่า Role เป็น "user" โดยอัตโนมัติ

    let res = await CreateUser(values);

    if (res.status === 201) {
      // เรียกใช้ message API สำหรับแสดงข้อความสำเร็จ
      messageApi.success('ลงทะเบียนสำเร็จ!');
      setTimeout(function () {
        navigate("/"); // นำทางไปหน้า login หลังจากสมัครสำเร็จ
      }, 2000);
    } else {
      // เรียกใช้ message API สำหรับแสดงข้อความผิดพลาด
      messageApi.error(res.data.error);
    }
  };

  return (
    <>
    <div className="resgister">
      {/* ต้องมีการแสดง message API */}
      {contextHolder}

      <Flex justify="center" align="center" className="login">
        <Card className="card-login" style={{ width: 600 }}>
          <Row align={"middle"} justify={"center"}>
            <Col xs={24} sm={24} md={24} lg={10} xl={10}>
              <img alt="logo" src={logo} className="images-logo" />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <h2 className="header">Sign Up</h2>
              <Form
                name="basic"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row gutter={[16, 0]} align={"middle"}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                      label="ชื่อผู้ใช้งาน"
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกชื่อผู้ใช้งาน !",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                      label="อีเมล"
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: "รูปแบบอีเมลไม่ถูกต้อง !",
                        },
                        {
                          required: true,
                          message: "กรุณากรอกอีเมล !",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="รหัสผ่าน"
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกรหัสผ่าน !",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="วัน/เดือน/ปี เกิด"
                      name="birthday"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกวันเกิด !",
                        },
                      ]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="อายุ"
                      name="age"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกอายุ !",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={99}
                        defaultValue={0}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="เพศ"
                      name="gender"  // ใช้ชื่อ "gender"
                      rules={[
                        {
                          required: true,
                          message: "กรุณาเลือกเพศ !",
                        },
                      ]}
                    >
                      <Select
                        defaultValue=""
                        style={{ width: "100%" }}
                      >
                        {genderOptions.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                      label="เบอร์โทรศัพท์"
                      name="phone_number"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกเบอร์โทรศัพท์ !",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                      label="Facebook (ไม่จำเป็น)"
                      name="facebook"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                      label="Line (ไม่จำเป็น)"
                      name="line"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="login-form-button"
                        style={{ marginBottom: 20 }}
                      >
                        Sign up
                      </Button>
                      Or <a onClick={() => navigate("/")}>signin now !</a>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Card>
      </Flex>
      </div>
    </>
  );
}

export default SignUpPages;
