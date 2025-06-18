import { useState, useEffect } from "react";
import { Form, Input, Button, message, Space, Row, Col, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { AdminInterface, AdminResponse } from "../../../interfaces/IAdmin"; // ใช้ AdminResponse
import { getAdminById, updateAdminById } from "../../../services/https/admin";

function EditAdmin() {
  const [admin, setAdmin] = useState<AdminInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);  // For form data loading
  const navigate = useNavigate();
  const { id } = useParams();  // Get ID from URL params
  const [form] = Form.useForm(); // Create the form instance

  useEffect(() => {
    // Fetch admin data using ID from URL
    if (id) {
      fetchAdminData(id);
    }
  }, [id]);

  const fetchAdminData = async (id: string) => {
    setFormLoading(true);  // Start loading data

    try {
      const response: AdminResponse = await getAdminById(id); // Fetch the admin data by ID
      console.log("Fetched admin data:", response);

      // Check if 'data' exists in response and set it to the state
      if (response.data) {
        setAdmin(response.data); // Set the fetched data to state
        form.setFieldsValue(response.data); // Set the form fields with the data
        console.log("Form initial values set:", response.data);
      } else {
        message.error("Failed to load admin data.");
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      message.error("Failed to load admin data.");
    } finally {
      setFormLoading(false);  // End loading data
    }
  };

  const handleSubmit = async (values: AdminInterface) => {
    if (!admin) return;

    setLoading(true);

    try {
      const updatedAdmin = { ...admin, ...values };  // Merge existing data with updated values
      console.log("Updated admin data:", updatedAdmin); // Log updated data before sending it

      const response = await updateAdminById(admin.ID, updatedAdmin);

      if (response.status === 200) {
        message.success("Admin updated successfully");
        navigate("/admin/dashboard");  // Redirect back to admin dashboard
      } else {
        message.error("Failed to update admin.");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      message.error("Error occurred while updating admin.");
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
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  return (
    <Row justify="center" style={{ marginTop: "20px" }}>
      <Col span={12}>
        <h2>Edit Admin</h2>
        <Form
          form={form} // Attach the form instance here
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

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select the gender!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
              <Button onClick={() => navigate("/admin/dashboard")}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}

export default EditAdmin;
