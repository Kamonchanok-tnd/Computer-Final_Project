import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Modal } from "antd";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { updateQuestionnaire } from "../../../../services/https/questionnaire";

interface EditProps {
  questionnaire: Questionnaire;
  onClose: () => void;
  onSuccess: () => void; 
}

const EditQuestionnairePage: React.FC<EditProps> = ({ questionnaire, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (questionnaire) {
      form.setFieldsValue({
        name: questionnaire.nameQuestionnaire,
        description: questionnaire.description,
        quantity: questionnaire.quantity,
      });
    }
  }, [questionnaire]);

  const handleFinish = async (values: any) => {
    const payload = {
      id: questionnaire.id,
      nameQuestionnaire: values.name,
      description: values.description,
      quantity: values.quantity,
    };

    try {
      await updateQuestionnaire(payload);

      onClose();       // ✅ ปิด Modal แก้ไขก่อน
      onSuccess();     // ✅ แจ้งให้ parent แสดง Modal สำเร็จ
    } catch (error) {
      Modal.error({
        title: "เกิดข้อผิดพลาด",
        content: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่",
      });
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish} >
      <div className="edit-questionnaire-form">
      <Form.Item
        label="ชื่อแบบทดสอบ"
        name="name"
        rules={[{ required: true, message: "กรุณากรอกชื่อ!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="คำอธิบาย"
        name="description"
        rules={[{ required: true, message: "กรุณากรอกคำอธิบาย!" }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        label="จำนวนคำถาม"
        name="quantity"
        rules={[{ required: true, message: "กรุณากรอกจำนวนคำถาม!" }]}
      >
        <InputNumber disabled style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          บันทึกการแก้ไข
        </Button>
      </Form.Item>
      </div>
    </Form>
  );
};

export default EditQuestionnairePage;
