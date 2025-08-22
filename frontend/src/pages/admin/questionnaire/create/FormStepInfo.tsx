import React, { useState, useEffect } from "react";
import { Form, Input, Button, InputNumber, Modal, Checkbox, Select } from "antd";
import { createQuestionnaire, getAllQuestionnaires } from "../../../../services/https/questionnaire";
import { useNavigate } from "react-router-dom";
import createQuestionIcon from "../../../../assets/createQuestionnaire.png";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire"; // นำเข้า interface ของฟอร์ม
import "./FormStepInfo.css";

const FormStepInfo: React.FC = () => {
  const [form] = Form.useForm();
  const [hasCondition, setHasCondition] = useState(false);  // Track if conditions are selected
  const [questionnaires, setQuestionnaires] = useState<any[]>([]); // ใช้ตัวแปรเพื่อเก็บแบบทดสอบ
  const [loading, setLoading] = useState(true); // ใช้ตัวแปรเพื่อแสดงสถานะการโหลดข้อมูล
  const navigate = useNavigate();

  // ดึงข้อมูลแบบทดสอบจาก API
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const data = await getAllQuestionnaires(); // ดึงข้อมูลจาก service
        setQuestionnaires(data); // บันทึกข้อมูลที่ได้จาก API
        setLoading(false); // ตั้งค่า loading เป็น false หลังจากดึงข้อมูลเสร็จ
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
        setLoading(false);
      }
    };

    fetchQuestionnaires(); // เรียกใช้ฟังก์ชันดึงข้อมูล
  }, []);

  const handleFinish = async (values: any) => {
    // แสดงข้อมูลที่กรอกในฟอร์มในคอนโซล
    console.log("ข้อมูลที่กรอกก่อนส่งไป backend:", JSON.stringify({
      name: values.name,
      description: values.description,
      quantity: values.quantity,
      testType: values.testType,
      hasCondition: values.hasCondition,
      conditionOnID: values.conditionOnID,
      conditionScore: values.conditionScore,
      conditionType: values.conditionType,
      questions: [],  // เพิ่มข้อมูลคำถาม (ยังไม่ได้กรอก)
      groups: [],     // เพิ่มข้อมูลกลุ่มคำถาม (ยังไม่ได้กรอก)
    }, null, 2));

    const idStr = localStorage.getItem("id");
    const uid = idStr ? parseInt(idStr) : undefined;

    if (!uid) {
      alert("ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    const payload: Questionnaire = {
      nameQuestionnaire: values.name,
      description: values.description,
      quantity: values.quantity,
      uid,
      testType: values.testType,                  // เพิ่ม testType ตามฟอร์ม
      conditionOnID: values.conditionOnID,        // Selected test ID (for condition)
      conditionScore: values.conditionScore,      // Selected score condition
      conditionType: values.conditionType,        // Type of score condition (greater, less, equal)
      questions: [],                              // รายการคำถามยังไม่ได้เพิ่มใน payload นี้
      groups: [],                                 // กลุ่มคำถามยังไม่ได้เพิ่มใน payload นี้
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
      <h2 className="questionnaire-page-title" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
        <img src={createQuestionIcon} alt="manage icon" style={{ width: 50, height: 50, objectFit: "contain" }} />
        สร้างแบบทดสอบ
      </h2>

      <Form layout="vertical" form={form} onFinish={handleFinish} className="form-step">
        {/* ชื่อแบบทดสอบ */}
        <Form.Item
          label={<span className="form-label">ชื่อแบบทดสอบ</span>}
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อแบบทดสอบ!" }]}
        >
          <Input placeholder="กรอกชื่อแบบทดสอบ เช่น แบบทดสอบคณิตศาสตร์" style={{ height: "45px", fontSize: "24px" }} />
        </Form.Item>

        {/* คำอธิบาย */}
        <Form.Item
          label={<span className="form-label">คำอธิบาย</span>}
          name="description"
          rules={[{ required: true, message: "กรุณากรอกคำอธิบาย!" }]}
        >
          <Input.TextArea placeholder="อธิบายรายละเอียดของแบบทดสอบ" style={{ height: "200px", fontSize: "24px" }} />
        </Form.Item>

        {/* จำนวนคำถาม */}
        <Form.Item
          label={<span className="form-label">จำนวนคำถาม</span>}
          name="quantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนคำถาม!" }]}
        >
          <InputNumber min={1} className="input-quantity" style={{ height: "45px", fontSize: "24px" }} />
        </Form.Item>

        {/* ประเภทแบบทดสอบ */}
        <Form.Item
          label={<span className="form-label">ประเภทแบบทดสอบ</span>}
          name="testType"
          rules={[{ required: true, message: "กรุณาเลือกประเภทแบบทดสอบ!" }]}
        >
          <Select placeholder="เลือกประเภทแบบทดสอบ" style={{ width: "50%" ,height: "45px", fontSize: "24px" }}>
            <Select.Option value="positive">เชิงบวก</Select.Option>
            <Select.Option value="negative">เชิงลบ</Select.Option>
          </Select>
        </Form.Item>

        {/* เงื่อนไขของแบบทดสอบ */}
        <Form.Item name="hasCondition" valuePropName="checked">
          <Checkbox onChange={(e) => setHasCondition(e.target.checked)} style={{ fontSize: "24px" }}>
            บทความนี้มีเงื่อนไขก่อนทำ
          </Checkbox>
        </Form.Item>

        {/* เงื่อนไขที่ต้องเลือก */}
        {hasCondition && (
          <>
            <Form.Item
              label={<span className="form-label">แบบทดสอบที่ต้องทำก่อน</span>}
              name="conditionOnID"
              rules={[{ required: true, message: "กรุณาเลือกแบบทดสอบ!" }]}
            >
              <Select placeholder="เลือกแบบทดสอบที่ต้องทำก่อน" style={{ width: "50%" ,height: "45px", fontSize: "24px" }} loading={loading}>
                {!loading && questionnaires.length > 0 ? (
                  questionnaires.map((questionnaire: any) => (
                    <Select.Option key={questionnaire.id} value={questionnaire.id}>
                      {questionnaire.nameQuestionnaire}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option value={undefined}>ไม่มีแบบทดสอบ</Select.Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="form-label" >คะแนนที่ต้องได้</span>}
              name="conditionScore"
              rules={[{ required: true, message: "กรุณากรอกคะแนนที่ต้องได้!" }]}
            >
              <InputNumber min={1} max={100} style={{ width: "50%" ,height: "45px", fontSize: "16px",alignItems: "center",lineHeight: "45px",  }} placeholder="กรอกคะแนน" />
            </Form.Item>

            <Form.Item
              label={<span className="form-label">เงื่อนไขคะแนน</span>}
              name="conditionType"
              rules={[{ required: true, message: "กรุณาเลือกเงื่อนไขคะแนน!" }]}
            >
              <Select placeholder="เลือกเงื่อนไขคะแนน" style={{ width: "50%" ,height: "45px"}}>
                <Select.Option value="greaterThan" >มากกว่าหรือเท่ากับ</Select.Option>
                <Select.Option value="lessThan">น้อยกว่า</Select.Option>
              </Select>
            </Form.Item>
          </>
        )}

        {/* ปุ่มตรงกลาง */}
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
