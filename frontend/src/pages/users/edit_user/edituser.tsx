import { useState, useEffect } from "react";
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
  DatePicker,
  InputNumber,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interfaces/IUser";
import { GetUsersById, UpdateUsersById } from "../../../services/https/login";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";

function UserEdit() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const userId = localStorage.getItem("id");

  useEffect(() => {
    if (!userId) {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลผู้ใช้",
      });
      navigate("/login"); // ถ้าไม่พบ id ให้กลับไปที่หน้า login
    } else {
      getUserById(userId); // ดึงข้อมูลของผู้ใช้ที่มี id ตรงกับ userId
    }
  }, [userId]);

  const getUserById = async (id: string) => {
    let res = await GetUsersById(id);
    if (res?.status === 200) {
      form.setFieldsValue({
        username: res.data.username,
        email: res.data.email,
        phone_number: res.data.phone_number,
        birthday: dayjs(res.data.birthday),  // แปลงเป็น dayjs สำหรับ DatePicker
        age: res.data.age,
        gender: res.data.gender,
        facebook: res.data.facebook,
        line: res.data.line,
      });
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลผู้ใช้",
      });
    }
  };

  const onFinish = async (values: UsersInterface) => {
    const payload = {
      ...values,
      gender: values.Gender, // ใช้ gender ที่ได้จากฟอร์ม
    };

    const res = await UpdateUsersById(userId as string, payload);
    if (res.status === 200) {
      messageApi.open({
        type: "success",
        content: res.data.message || "แก้ไขข้อมูลสำเร็จ",  // ถ้าไม่มีข้อความใน res.data.message ให้ใช้ข้อความ "แก้ไขข้อมูลสำเร็จ"
      });
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",  // ถ้าไม่มีข้อความใน res.data.error ให้ใช้ข้อความ "เกิดข้อผิดพลาดในการแก้ไขข้อมูล"
      });
    }
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูล ผู้ใช้งาน</h2>
        <Divider />
        <Form
          name="basic"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
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
            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
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
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item
                label="วัน/เดือน/ปี เกิด"
                name="birthday"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกวัน/เดือน/ปี เกิด !",
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
                name="gender"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเพศ !",
                  },
                ]}
              >
                <Select style={{ width: "100%" }}>
                  <Select.Option value="Male">ชาย</Select.Option>
                  <Select.Option value="Female">หญิง</Select.Option>
                  <Select.Option value="Other">อื่นๆ</Select.Option>
                </Select>
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
          </Row>
          <Row justify="end">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to="/user/profile">
                    <Button htmlType="button" style={{ marginRight: "10px" }}>
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
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

export default UserEdit;
