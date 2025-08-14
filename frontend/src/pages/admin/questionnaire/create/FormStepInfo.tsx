import React from "react";
import { Form, Input, Button, InputNumber, Modal } from "antd";
import { createQuestionnaire } from "../../../../services/https/questionnaire";
import { useNavigate } from "react-router-dom";
import "./FormStepInfo.css";

const FormStepInfo: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    const idStr = localStorage.getItem("id");
    const uid = idStr ? parseInt(idStr) : undefined;

    if (!uid) {
      alert("ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    const payload = {
      nameQuestionnaire: values.name,
      description: values.description,
      quantity: values.quantity,
      uid,
      questions: [],
    };

    try {
      const created = await createQuestionnaire(payload);
      const questionnaireId = created?.id;
      if (!questionnaireId) throw new Error("ไม่พบ ID ของแบบทดสอบที่สร้าง");

      navigate("/admin/createquestion", {
        state: {
          questionnaireId,
          quantity: values.quantity,
        },
      });
    } catch (error) {
      console.error("❌ Error saving questionnaire", error);
      Modal.error({
        title: "เกิดข้อผิดพลาด",
        content: "ไม่สามารถบันทึกแบบทดสอบได้ กรุณาลองใหม่",
      });
    }
  };

  return (
    <div className="form-step-info-container">
      {/* ✅ หัวข้อ */}
      <h3 className="form-step-info-title">
        สร้างแบบทดสอบ
      </h3>

      <Form layout="vertical" form={form} onFinish={handleFinish} className="form-step">
        {/* ✅ ชื่อแบบทดสอบ */}
        <Form.Item className="form-input-questionnaire"
          label={
            <span className="form-label">
              ชื่อแบบทดสอบ
            </span>
          }
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อแบบทดสอบ!" }]}
        >
          <Input placeholder="กรอกชื่อแบบทดสอบ เช่น แบบทดสอบคณิตศาสตร์" style={{height : "45px", fontSize:"24px"}} />
        </Form.Item>

        {/* ✅ คำอธิบาย */}
        <Form.Item
          label={
            <span className="form-label">
              คำอธิบาย
            </span>
          }
          name="description"
          rules={[{ required: true, message: "กรุณากรอกคำอธิบาย!" }]}
        >
          <Input.TextArea placeholder="อธิบายรายละเอียดของแบบทดสอบ"  style={{height : "200px",fontSize:"24px"}} /> 
        </Form.Item>

        {/* ✅ จำนวนคำถาม */}
        <Form.Item
          label={
            <span className="form-label">
              จำนวนคำถาม
            </span>
          }
          name="quantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนคำถาม!" }]}
        >
          <InputNumber min={1} className="input-quantity" />
        </Form.Item>

        {/* ✅ ปุ่มตรงกลาง */}
        <Form.Item>
          <div className="questionnaire-button-wrapper">
            <Button className="questionnaire-cancle-btn" htmlType="button" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
            <Button className="questionnaire-create-btn" htmlType="submit">
              สร้างแบบทดสอบ
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormStepInfo;
