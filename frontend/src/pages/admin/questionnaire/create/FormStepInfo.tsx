import React from "react";
import { Form, Input, Button, InputNumber, Modal } from "antd";
import { createQuestionnaire } from "../../../../services/https/questionnaire";
import { useNavigate } from "react-router-dom";

import testIcon from "../../../../assets/test.png"; 
import nameQuestionnairIcon from "../../../../assets/nameQuestionnaire.png"; 
import descriptionIcon from "../../../../assets/description.png"; 
import numberIcon from "../../../../assets/number-blocks.png"; 
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
        <img
          src={testIcon}
          alt="icon"
          style={{ width: "80px", height: "80px", marginRight: "12px" }}
        />
        สร้างแบบทดสอบ
      </h3>

      <Form layout="vertical" form={form} onFinish={handleFinish} className="form-step">
        {/* ✅ ชื่อแบบทดสอบ */}
        <Form.Item
          label={
            <span className="form-label">
              <img
                src={nameQuestionnairIcon}
                alt="name"
                style={{ width: "50px", height: "50px", marginRight: "10px" }}
              />
              ชื่อแบบทดสอบ
            </span>
          }
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อแบบทดสอบ!" }]}
        >
          <Input placeholder="กรอกชื่อแบบทดสอบ เช่น แบบทดสอบคณิตศาสตร์" />
        </Form.Item>

        {/* ✅ คำอธิบาย */}
        <Form.Item
          label={
            <span className="form-label">
              <img
                src={descriptionIcon}
                alt="description"
                style={{ width: "50px", height: "50px", marginRight: "10px" }}
              />
              คำอธิบาย
            </span>
          }
          name="description"
          rules={[{ required: true, message: "กรุณากรอกคำอธิบาย!" }]}
        >
          <Input.TextArea placeholder="อธิบายรายละเอียดของแบบทดสอบ" autoSize={{ minRows: 3 }} />
        </Form.Item>

        {/* ✅ จำนวนคำถาม */}
        <Form.Item
          label={
            <span className="form-label">
              <img
                src={numberIcon }
                alt="quantity"
                style={{ width: "50px", height: "50px", marginRight: "10px" }}
              />
              จำนวนคำถาม
            </span>
          }
          name="quantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนคำถาม!" }]}
        >
          <InputNumber min={1} style={{ width: "%" }} />
        </Form.Item>

        {/* ✅ ปุ่ม */}
        <Form.Item>
          <div className="questionnaire-button-wrapper">
            <Button
              className="questionnaire-create-btn cancel-btn"
              type="default"
              htmlType="button"
              onClick={() => navigate(-1)}
            >
              ❌ ยกเลิก
            </Button>
            <Button
              className="questionnaire-create-btn submit-btn"
              type="primary"
              htmlType="submit"
            >
              ✅ สร้างแบบทดสอบ
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormStepInfo;
