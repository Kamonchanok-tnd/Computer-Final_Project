import { useState, useEffect } from "react";
import { Form, Input, Button, Space, Row, Col, Spin, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { AdminInterface, AdminResponse } from "../../../interfaces/IAdmin";
import { getAdminById, updateAdminYourselfById } from "../../../services/https/admin";

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
      <div style={{ textAlign: "center", padding: "50px 0" }}>
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
      <Row justify="center" style={{ marginTop: "20px" }}>
        <Col span={12}>
          <h2>Edit Your Information</h2>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please input the username!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input the email!" },
                { type: "email", message: "Please input a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone_number"
              rules={[{ required: true, message: "Please input the phone number!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Age"
              name="age"
              rules={[{ required: true, message: "Please input the age!" }]}
            >
              <Input type="number" />
            </Form.Item>

            {/* เปลี่ยนจาก Input เป็น Select สำหรับเพศ */}
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select the gender!" }]}
            >
              <Select placeholder="Select Gender">
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
    </>
  );
}

export default EditYourself;
