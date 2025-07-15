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
            <h3 className="form-step-info-title">สร้างแบบทดสอบ (CREATE QUESTIONNAIRE)</h3>

            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item label="ชื่อแบบทดสอบ" name="name" rules={[{ required: true, message: "กรุณากรอกชื่อแบบทดสอบ!" }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="คำอธิบาย" name="description" rules={[{ required: true, message: "กรุณากรอกคำอธิบาย!" }]}>
                    <Input.TextArea autoSize={{ minRows: 3 }} />
                </Form.Item>

                <Form.Item label="จำนวนคำถาม" name="quantity" rules={[{ required: true, message: "กรุณากรอกจำนวนคำถาม!" }]}>
                    <InputNumber min={1} />
                </Form.Item>

                <Form.Item>
                    <div className="questionnaire-button-wrapper">
                        <Button
                            className="questionnaire-create-btn cancel-btn"
                            type="default"
                            htmlType="button"
                            onClick={() => navigate(-1)}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            className="questionnaire-create-btn submit-btn"
                            type="primary"
                            htmlType="submit"
                        >
                            สร้างแบบทดสอบ
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default FormStepInfo;
