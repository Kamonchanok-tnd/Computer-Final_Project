import { useEffect } from "react";
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
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interfaces/IUser";
import { GetUsersById, UpdateUsersById } from "../../../services/https/login";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import "./UserEdit.css"; // ✅ import CSS

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
      navigate("/");
    } else {
      getUserById(userId);
    }
  }, [userId]);

  const getUserById = async (id: string) => {
    const res = await GetUsersById(id);
    if (res?.status === 200) {
      form.setFieldsValue({
        username: res.data.username,
        email: res.data.email,
        phone_number: res.data.phone_number,
        birthday: dayjs(res.data.birthday),
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
      gender: values.Gender,
    };

    const res = await UpdateUsersById(userId as string, payload);
    if (res.status === 200) {
      messageApi.open({
        type: "success",
        content: res.data.message || "แก้ไขข้อมูลสำเร็จ",
      });
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
      });
    }
  };

  return (
    <div className="user-edit-container">
      {contextHolder}
      <Card className="user-edit-card" title={<h2 className="user-edit-title">แก้ไขข้อมูล</h2>}>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="user-edit-form"
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="ชื่อผู้ใช้งาน" name="username" rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน !" }]}>
                <Input placeholder="ระบุชื่อผู้ใช้งาน" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="อีเมล" name="email" rules={[
                { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง !" },
                { required: true, message: "กรุณากรอกอีเมล !" },
              ]}>
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="เบอร์โทรศัพท์" name="phone_number" rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์ !" }]}>
                <Input placeholder="0812345678" />
              </Form.Item>
            </Col>
          
            <Col xs={24} md={12}>
              <Form.Item label="อายุ" name="age" rules={[{ required: true, message: "กรุณากรอกอายุ !" }]}>
                <InputNumber min={0} max={120} style={{ width: "100%" }} placeholder="ระบุอายุ" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="เพศ" name="gender" rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}>
                <Select placeholder="เลือกเพศ">
                  <Select.Option value="Male">ชาย</Select.Option>
                  <Select.Option value="Female">หญิง</Select.Option>
                  <Select.Option value="Other">อื่นๆ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
  <Form.Item label="Facebook (ไม่จำเป็น)" name="facebook">
    <Input placeholder="ระบุ Facebook (ถ้ามี)" />
  </Form.Item>
</Col>
<Col xs={24} md={12}>
  <Form.Item label="Line (ไม่จำเป็น)" name="line">
    <Input placeholder="ระบุ Line ID (ถ้ามี)" />
  </Form.Item>
</Col>

          </Row>
          <Divider />
          <div className="user-edit-btn-group">
            <Link to="/user">
              <Button icon={<ArrowLeftOutlined />} className="btn-back" >ย้อนกลับ</Button>
            </Link>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="btn-save">
              บันทึกข้อมูล
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default UserEdit;
