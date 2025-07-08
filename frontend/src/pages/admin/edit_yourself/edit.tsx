import { useState, useEffect } from "react";
import { Form, Input, Button, Space, Row, Col, Spin, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { AdminInterface, AdminResponse } from "../../../interfaces/IAdmin";
import { getAdminById, updateAdminYourselfById } from "../../../services/https/admin";
import "./edit.css"
function EditYourself() {
  const [admin, setAdmin] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage(); // ใช้ message API

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (userId) {
      fetchAdminData(userId);
    }
  }, []);

  const fetchAdminData = async (id: string) => {
    setFormLoading(true);
    try {
      const response: AdminResponse = await getAdminById(id);
      if (response.data) {
        setAdmin(response);
        form.setFieldsValue(response.data);
      } else {
        messageApi.error("Failed to load admin data.");
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      messageApi.error("Failed to load admin data.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (values: AdminInterface) => {
    if (!admin) return;

    setLoading(true);
    const updatedAdmin = { ...admin.data, ...values };
    updatedAdmin.age = parseInt(updatedAdmin.age.toString(), 10);

    try {
      const response = await updateAdminYourselfById(admin.data.ID, updatedAdmin);
      console.log("API response:", response);

      if (response.status === 200 || response.status === 'success') {
        messageApi.success("แก้ไขข้อมูล สำเร็จ!");
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        messageApi.error(`Failed to update admin. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      messageApi.error("Error occurred while updating admin.");
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <h3>กำลังโหลดข้อมูล...</h3>
      </div>
    );
  }

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {contextHolder} {/* เพิ่ม contextHolder ใน JSX */}
      <div className="edit-yourself-container">
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={12}>
            <h2 className="page-title">แก้ไขข้อมูล</h2>
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="edit-form"
            >
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[{ required: true, message: "Please input the username!" }]}
              >
                <Input className="form-input" />
              </Form.Item>

              <Form.Item
                label="อีเมล"
                name="email"
                rules={[
                  { required: true, message: "Please input the email!" },
                  { type: "email", message: "Please input a valid email!" },
                ]}
              >
                <Input className="form-input" />
              </Form.Item>

              <Form.Item
                label="เบอร์โทรศัพท์"
                name="phone_number"
                rules={[{ required: true, message: "Please input the phone number!" }]}
              >
                <Input className="form-input" />
              </Form.Item>

              <Form.Item
                label="อายุ"
                name="age"
                rules={[{ required: true, message: "Please input the age!" }]}
              >
                <Input type="number" className="form-input" />
              </Form.Item>

              <Form.Item
                label="เพศ"
                name="gender"
                rules={[{ required: true, message: "Please select the gender!" }]}
              >
                <Select className="form-input" placeholder="Select Gender">
                  <Select.Option value="Male">ชาย</Select.Option>
                  <Select.Option value="Female">หญิง</Select.Option>
                  <Select.Option value="Other">อื่นๆ</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save
                  </Button>
                  <Button onClick={() => navigate("/admin")}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default EditYourself;
