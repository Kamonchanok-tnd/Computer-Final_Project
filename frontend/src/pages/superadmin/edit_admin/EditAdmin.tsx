import { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin, Select, Divider, Row, Col, Space, InputNumber } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { AdminInterface } from "../../../interfaces/IAdmin";
import { getAdminById, updateAdminById } from "../../../services/https/admin";
import "./EditAdmin.css";
function EditAdmin() {
  const [admin, setAdmin] = useState<AdminInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [gender] = useState([
    { ID: 1, gender: "ชาย" },
    { ID: 2, gender: "หญิง" },
    { ID: 3, gender: "อื่นๆ" },
  ]);

  useEffect(() => {
    if (id) fetchAdminData(id);
  }, [id]);

  const fetchAdminData = async (id: string) => {
    setFormLoading(true);
    try {
      const response: { data: AdminInterface } = await getAdminById(id);
      if (response.data) {
        setAdmin(response.data);
        form.setFieldsValue(response.data);
      } else {
        message.error("Failed to load admin data.");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load admin data.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (values: AdminInterface) => {
    if (!admin) return message.error("ข้อมูลผู้ดูแลระบบไม่พร้อมใช้งาน.");
    setLoading(true);
    const updatedAdmin = { ...admin, ...values, age: parseInt(values.age.toString(), 10) };
    try {
      const response = await updateAdminById(admin.ID, updatedAdmin);
      if (response && response.status === "success") {
        messageApi.success("อัปเดตข้อมูลผู้ดูแลระบบสำเร็จ");
        setTimeout(() => navigate("/superadmin"), 1500);
      } else {
        messageApi.error("ไม่สามารถอัปเดตข้อมูลผู้ดูแลระบบได้");
      }
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ดูแลระบบ.");
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-t from-[#C2F4FF] to-white">
        <Spin size="large" />
        <h3 className="mt-4 text-lg font-medium text-gray-700">กำลังโหลดข้อมูล...</h3>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#C2F4FF] to-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-blue-50 p-6">
  {contextHolder}
  <div
    style={{
      width: "100%",
      maxWidth: "900px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      borderRadius: "12px",
      padding: "20px",
    }}
    className="bg-white"
  >
    <h2
  style={{
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937", // เทียบกับ text-gray-800
    marginBottom: "24px", // เทียบกับ mb-6
    fontFamily: "var(--font-ibmthai)", // <-- เพิ่มตรงนี้
  }}
>
  แก้ไขข้อมูลผู้ดูแลระบบ
</h2>

    <Divider className="mb-6" />

    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      className="edit-admin-form"
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้ !" }]}
          >
            <Input size="large" className="text-lg p-2" />
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
            <Input size="large" className="text-lg p-2" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="เบอร์โทรศัพท์"
            name="phone_number"
            rules={[{ required: true, message: "กรุณากรอกหมายเลขโทรศัพท์ !" }]}
          >
            <Input size="large" className="text-lg p-2" />
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
              className="text-lg p-2"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="เพศ"
            name="gender"
            rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}
          >
            <Select placeholder="เลือกเพศ" size="large" className="text-lg">
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
              <Button
                onClick={() => navigate("/superadmin")}
                size="large"
                className="!bg-gray-200 !hover:bg-gray-300 !text-gray-800 px-8"
                style={{ fontFamily: "var(--font-ibmthai)" }}
              >
                ยกเลิก
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="!bg-blue-500 !hover:bg-blue-600 !text-white px-8"
                loading={loading}
                style={{ fontFamily: "var(--font-ibmthai)" }}
              >
                บันทึก
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </div>
</div>

  );
}

export default EditAdmin;
