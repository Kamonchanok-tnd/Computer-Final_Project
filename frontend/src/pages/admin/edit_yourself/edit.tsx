import { useState, useEffect } from "react";
import { Form, Input, Button, Space, Spin, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { AdminInterface, AdminResponse } from "../../../interfaces/IAdmin";
import { getAdminById, updateAdminYourselfById } from "../../../services/https/admin";
import "./edit.css";

function EditYourself() {
  const [admin, setAdmin] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

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
      {contextHolder}
      <div className="edit-yourself-container">
        <div className="form-wrapper">
    <h2 className="page-title">แก้ไขข้อมูลส่วนตัว</h2> 
        <div className="edit-form">
          
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="ชื่อผู้ใช้"
              name="username"
              rules={[{ required: true, message: "Please input the username!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="อีเมล"
              name="email"
              rules={[
                { required: true, message: "Please input the email!" },
                { type: "email", message: "Please input a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="เบอร์โทรศัพท์"
              name="phone_number"
              rules={[{ required: true, message: "Please input the phone number!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="อายุ"
              name="age"
              rules={[{ required: true, message: "Please input the age!" }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="เพศ"
              name="gender"
              rules={[{ required: true, message: "Please select the gender!" }]}
            >
              <Select placeholder="เลือกเพศ">
                <Select.Option value="Male">ชาย</Select.Option>
                <Select.Option value="Female">หญิง</Select.Option>
                <Select.Option value="Other">อื่นๆ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ textAlign: "center" }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  บันทึก
                </Button>
                <Button onClick={() => navigate("/admin")}>
                  ยกเลิก
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
        </div>
      </div>
    </>
  );
}

export default EditYourself;
