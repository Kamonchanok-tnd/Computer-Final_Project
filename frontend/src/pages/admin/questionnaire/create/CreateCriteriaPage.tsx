// import { useLocation } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import { Row, Col } from "antd";
// import createQuestionIcon from "../../../../assets/createQuestionnaire.png";
// // import "./CreateCriteriaPage.css"; // ถ้าต้องการปรับแต่งเพิ่มเติม

// const CreateCriteriaPage: React.FC = () => {
// //   const navigate = useNavigate();
// const location = useLocation();
// const questionnaireId = (location.state as any)?.questionnaireId; //รับค่า questionnaireId จาก state ที่ส่งมาจากหน้าอื CreatCriteriaPage

//   return (
//     <div className="p-8">
//       <Row justify="space-between" align="middle" className="mb-8">
//         <Col>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
//             <img src={createQuestionIcon} alt="manage icon" className="w-12 h-12 object-contain" />
//             จัดการเกณฑ์การประเมิน
//           </h2>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default CreateCriteriaPage;


// import { useState } from "react";
// import { Button, Input, Form, Modal, Row, Col, Tooltip, Typography, InputNumber } from "antd";
// import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import createQuestionIcon from "../../../../assets/createQuestionnaire.png";
// import { createCriteria } from "../../../../services/https/questionnaire";  // นำเข้าฟังก์ชันจาก service
// import { useNavigate, useLocation } from "react-router-dom";  // สำหรับการนำทางหลังจากบันทึกสำเร็จ

// const { Text } = Typography;

// const CreateCriteriaPage: React.FC = () => {
//   const [criteriaList, setCriteriaList] = useState<{ description: string; minScore: number; maxScore: number }[]>([]);
//   const [description, setDescription] = useState("");
//   const [minScore, setMinScore] = useState<number | string>("");  // ใช้ค่าว่างแทนค่าเริ่มต้น
//   const [maxScore, setMaxScore] = useState<number | string>("");
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false); // สำหรับแสดง Modal success
//   const navigate = useNavigate();  // ใช้สำหรับนำทางหลังจากบันทึกสำเร็จ
//   const location = useLocation();
//   const questionnaireId = (location.state as any)?.questionnaireId; //รับค่า questionnaireId จาก state ที่ส่งมาจากหน้าอื CreatCriteriaPage

//   const handleAddCriteria = () => {
//     if (!description || minScore === "" || maxScore === "" || minScore >= maxScore) {
//       Modal.warning({
//         title: "กรุณากรอกข้อมูลให้ครบ",
//         content: "กรุณากรอกคำอธิบาย และคะแนนช่วงที่ถูกต้อง",
//       });
//       return;
//     }
//     setCriteriaList([...criteriaList, { description, minScore: Number(minScore), maxScore: Number(maxScore) }]);
//     setDescription(""); // เคลียร์ช่องกรอกข้อมูล
//     setMinScore(""); // เคลียร์คะแนนเริ่มต้น
//     setMaxScore(""); // เคลียร์คะแนนสูงสุด
//   };

//   const handleRemoveCriteria = (index: number) => {
//     const updatedList = criteriaList.filter((_, i) => i !== index);
//     setCriteriaList(updatedList);
//   };

//   // ฟังก์ชัน handleSubmit ที่จะเรียกใช้ createCriteria
//   const handleSubmit = async () => {
//     if (criteriaList.length === 0) {
//       Modal.warning({ title: "ยังไม่มีรายการเกณฑ์", content: "โปรดเพิ่มอย่างน้อย 1 รายการก่อนบันทึก" });
//       return;
//     }
//     try {
//       // เรียกใช้ createCriteria เพื่อส่งข้อมูลไปยัง backend
//       await createCriteria(criteriaList); 
      
//       // ถ้าไม่เกิดข้อผิดพลาด
//       setIsEditSuccessModalVisible(true); // เปิด Modal success
//       setCriteriaList([]); // เคลียร์รายการหลังบันทึก
//     } catch (e: any) {
//       Modal.error({
//         title: "บันทึกไม่สำเร็จ",
//         content: e?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
//       });
//     }
//   };

//   // Success Modal หลังจากบันทึกสำเร็จ
//   const handleOk = () => {
//     setIsEditSuccessModalVisible(false);
//     navigate("/admin/questionnairePage", {  // เปลี่ยนเส้นทางไปหน้าถัดไป
//       state: {
//         flash: {
//           type: "success",
//           content: "บันทึกข้อมูลแบบทดสอบ คำถาม คำตอบเเละเกณฑ์การประเมิน ลงฐานข้อมูลเรียบร้อยแล้ว!"
//         },
//       },
//     });
//   };

//   return (
//     <div className="p-8">
//       <Row justify="space-between" align="middle" className="mb-8">
//         <Col>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
//             <img src={createQuestionIcon} alt="manage icon" className="w-12 h-12 object-contain" />
//             จัดการเกณฑ์การประเมิน
//           </h2>
//         </Col>
//       </Row>

//       {/* คำอธิบายระดับคะแนน */}
//       <div style={{ marginBottom: 16 }}>
//         <Text type="secondary">ตัวอย่างการวัดระดับความสุข:</Text>
//         <ul>
//           <li>0 คะแนน หมายถึง ไม่มีความสุขเลย</li>
//           <li>1-2 คะแนน หมายถึง มีความสุขน้อยที่สุด</li>
//           <li>3-4 คะแนน หมายถึง มีความสุขน้อย</li>
//           <li>5-6 คะแนน หมายถึง มีความสุขปานกลาง</li>
//           <li>7-8 คะแนน หมายถึง มีความสุขมาก</li>
//           <li>9-10 คะแนน หมายถึง มีความสุขมากที่สุด</li>
//         </ul>
//       </div>

//       <Form layout="vertical">
//         {/* คำแนะนำสำหรับการกรอก */}
//         <div style={{ marginBottom: 16 }}>
//           <Text type="secondary">กรุณากรอกคำอธิบายและคะแนนช่วงสำหรับเกณฑ์การประเมิน</Text>
//         </div>

//         <Row gutter={[16, 16]}>
//           <Col xs={24} sm={12} md={8}>
//             <Form.Item label="คำอธิบายเกณฑ์การประเมิน">
//               <Tooltip title="ตัวอย่าง: 'ความสุขของผู้ตอบแบบสอบถาม'">
//                 <Input
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="กรอกคำอธิบายเกณฑ์"
//                 />
//               </Tooltip>
//             </Form.Item>
//           </Col>
//           <Col xs={12} sm={6} md={4}>
//             <Form.Item label="คะแนนขั้นต่ำ">
//               <InputNumber
//                 min={0}
//                 max={10}
//                 value={minScore === "" ? undefined : minScore}
//                 onChange={(value) => setMinScore(value === undefined || value === null ? "" : value)}
//                 placeholder="กรอกคะแนนขั้นต่ำ"
//                 style={{ width: "100%" }}
//               />
//             </Form.Item>
//           </Col>
//           <Col xs={12} sm={6} md={4}>
//             <Form.Item label="คะแนนสูงสุด">
//               <InputNumber
//                 value={maxScore === "" ? "" : maxScore}
//                 onChange={(value) => setMaxScore(value || "")}
//                 placeholder="กรอกคะแนนสูงสุด"
//                 style={{ width: "100%" }}
//               />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={handleAddCriteria}
//           style={{ marginBottom: 16 }}
//         >
//           เพิ่มเกณฑ์
//         </Button>

//         <div style={{ marginBottom: 24 }}>
//           {criteriaList.map((criteria, index) => (
//             <Row key={index} gutter={16} style={{ marginBottom: 8 }}>
//               <Col xs={24} sm={12} md={8}>
//                 <Input value={criteria.description} disabled />
//               </Col>
//               <Col xs={12} sm={6} md={4} style={{ marginTop: 8 }}>
//                 <Input value={`${criteria.minScore} - ${criteria.maxScore}`} disabled />
//               </Col>
//               <Col xs={12} sm={6} md={4} style={{ marginTop: 8 }}>
//                 <Button
//                   type="text"
//                   danger
//                   icon={<DeleteOutlined />}
//                   onClick={() => handleRemoveCriteria(index)}
//                 />
//               </Col>
//             </Row>
//           ))}
//         </div>

//         <Button type="primary" onClick={handleSubmit} block>
//           บันทึกเกณฑ์การประเมิน
//         </Button>
//       </Form>

//       {/* Success Modal */}
//       <Modal
//         title="สร้างเกณฑ์การประเมินของเเบบทดสอบเรียบร้อยแล้ว"
//         open={isEditSuccessModalVisible}
//         onOk={handleOk}
//         onCancel={() => setIsEditSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//       >
//         <p style={{ textAlign: "center",color: "#cf1322" }}>ข้อมูลเกณฑ์การประเมินของคุณได้ถูกบันทึกสำเร็จแล้ว</p>
//       </Modal>
//     </div>
//   );
// };

// export default CreateCriteriaPage;



import { useState } from "react";
import { Button, Input, Form, Modal, Row, Col, Typography, InputNumber } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import criteriaIcon from "../../../../assets/criteria.png";
import { createCriteria } from "../../../../services/https/questionnaire";  // นำเข้าฟังก์ชันจาก service
import { useNavigate, useLocation } from "react-router-dom";  // สำหรับการนำทางหลังจากบันทึกสำเร็จ

const { Text } = Typography;

const CreateCriteriaPage: React.FC = () => {
  const [criteriaList, setCriteriaList] = useState<{ description: string; minScore: number; maxScore: number }[]>([]);
  const [description, setDescription] = useState("");
  const [minScore, setMinScore] = useState<number | string>("");  // ใช้ค่าว่างแทนค่าเริ่มต้น
  const [maxScore, setMaxScore] = useState<number | string>("");
  const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false); // สำหรับแสดง Modal success
  const navigate = useNavigate();  // ใช้สำหรับนำทางหลังจากบันทึกสำเร็จ
  const location = useLocation();
  const questionnaireId = (location.state as any)?.questionnaireId; //รับค่า questionnaireId จาก state ที่ส่งมาจากหน้าอื CreatCriteriaPage

  const handleAddCriteria = () => {
    if (!description || minScore === "" || maxScore === "" || minScore >= maxScore) {
      Modal.warning({
        title: "กรุณากรอกข้อมูลให้ครบ",
        content: "กรุณากรอกคำอธิบาย และคะแนนช่วงที่ถูกต้อง",
      });
      return;
    }
    setCriteriaList([...criteriaList, { description, minScore: Number(minScore), maxScore: Number(maxScore) }]);
    setDescription(""); // เคลียร์ช่องกรอกข้อมูล
    setMinScore(""); // เคลียร์คะแนนเริ่มต้น
    setMaxScore(""); // เคลียร์คะแนนสูงสุด
  };

  const handleRemoveCriteria = (index: number) => {
    const updatedList = criteriaList.filter((_, i) => i !== index);
    setCriteriaList(updatedList);
  };

  // ฟังก์ชัน handleSubmit ที่จะเรียกใช้ createCriteria
  const handleSubmit = async () => {
    if (criteriaList.length === 0) {
      Modal.warning({ title: "ยังไม่มีรายการเกณฑ์", content: "โปรดเพิ่มอย่างน้อย 1 รายการก่อนบันทึก" });
      return;
    }
    try {
      // ส่ง questionnaireId ไปพร้อมกับ criteriaList
      await createCriteria(criteriaList, questionnaireId); 
      
      // ถ้าไม่เกิดข้อผิดพลาด
      setIsEditSuccessModalVisible(true); // เปิด Modal success
      setCriteriaList([]); // เคลียร์รายการหลังบันทึก
    } catch (e: any) {
      Modal.error({
        title: "บันทึกไม่สำเร็จ",
        content: e?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
      });
    }
  };

  // Success Modal หลังจากบันทึกสำเร็จ
  const handleOk = () => {
    setIsEditSuccessModalVisible(false);
    navigate("/admin/questionnairePage", {  // เปลี่ยนเส้นทางไปหน้าถัดไป
      state: {
        flash: {
          type: "success",
          content: "บันทึกข้อมูลแบบทดสอบ คำถาม คำตอบเเละเกณฑ์การประเมิน ลงฐานข้อมูลเรียบร้อยแล้ว!"
        },
      },
    });
  };

  return (
    <div className="p-8">
      <Row justify="space-between" align="middle" className="mb-8">
        <Col>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <img src={criteriaIcon} alt="manage icon" className="w-12 h-12 object-contain" />
            จัดการเกณฑ์การประเมิน
          </h2>
        </Col>
      </Row>

      {/* คำอธิบายระดับคะแนน */}
      <div style={{ marginBottom: 16 }} className="text-2xl">
        <Text type="secondary"  style={{ fontSize: '24px'}}>ตัวอย่างการวัดระดับความสุข:</Text>
        <ul style={{ listStyleType: "square", paddingLeft: 50 }}>
          <li>0    คะแนน หมายถึง ไม่มีความสุขเลย</li>
          <li>1-2  คะแนน หมายถึง มีความสุขน้อยที่สุด</li>
          <li>3-4  คะแนน หมายถึง มีความสุขน้อย</li>
          <li>5-6  คะแนน หมายถึง มีความสุขปานกลาง</li>
          <li>7-8  คะแนน หมายถึง มีความสุขมาก</li>
          <li>9-10 คะแนน หมายถึง มีความสุขมากที่สุด</li>
        </ul>
         <ul style={{ listStyleType: "square", paddingLeft: 30, color:"red" }}>
          <li> "ไม่มีความสุขเลย" คะเเนนขั้นต่ำให้กรอก -1 คะเเนนสูงสุดให้กรอก 0</li>
          <li> "มีความสุขน้อยที่สุด" คะเเนนขั้นต่ำให้กรอก 1 คะเเนนสูงสุดให้กรอก 2</li>
          <li> "มีความสุขน้อย" คะเเนนขั้นต่ำให้กรอก 3 คะเเนนสูงสุดให้กรอก 4</li>
          <li> "มีความสุขปานกลาง" คะเเนนขั้นต่ำให้กรอก 5 คะเเนนสูงสุดให้กรอก 6</li>
          <li> "มีความสุขมาก" คะเเนนขั้นต่ำให้กรอก 7 คะเเนนสูงสุดให้กรอก 8</li>
          <li> "มีความสุขมากที่สุด" คะเเนนขั้นต่ำให้กรอก 9 คะเเนนสูงสุดให้กรอก 10</li>
        </ul>
      </div>

      <Form layout="vertical">
        {/* คำแนะนำสำหรับการกรอก */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: '24px'}}>กรุณากรอกคำอธิบายและคะแนนช่วงสำหรับเกณฑ์การประเมิน</Text>
        </div>

        <Row gutter={[16, 16]} >
          <Col xs={24} sm={12} md={8} style={{ fontSize: '24px'}}>
            <Form.Item label="คำอธิบายเกณฑ์การประเมิน"  style={{ fontSize: '24px' }}>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรอกคำอธิบายเกณฑ์"
                  style={{ fontSize: '24px' }}
                />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Form.Item label="คะแนนขั้นต่ำ">
              <InputNumber
                min={-1}
                max={10000}
                value={minScore === "" ? undefined : minScore}
                onChange={(value) => setMinScore(value === undefined || value === null ? "" : value)}
                placeholder="กรอกคะแนนขั้นต่ำ"
                style={{ width: "100%", fontSize: '24px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Form.Item label="คะแนนสูงสุด">
             <InputNumber
                min={0}
                max={10000}
                value={maxScore === undefined || maxScore === null ? "" : maxScore} // ปรับการตรวจสอบค่า
                onChange={(value) => setMaxScore(value === undefined || value === null ? "" : value)} // ตรวจสอบให้สามารถกรอก 0 ได้
                placeholder="กรอกคะแนนสูงสุด"
                style={{ width: "100%", fontSize: '24px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCriteria}
          style={{ marginBottom: 16, fontSize: '18px' }}
        >
          เพิ่มเกณฑ์
        </Button>

        <div style={{ marginBottom: 24 }}>
          {criteriaList.map((criteria, index) => (
            <Row key={index} gutter={[16, 16]} style={{ marginBottom: 8 }}>
              {/* Description */}
              <Col xs={24} sm={12} md={8} style={{ marginBottom: 8 }}>
                <Input value={criteria.description} disabled style={{ fontSize: '16px' }} />
              </Col>

              {/* MinScore - MaxScore */}
              <Col xs={24} sm={12} md={8} style={{ marginBottom: 8 }}>
                <Input value={`${criteria.minScore} - ${criteria.maxScore}`} disabled style={{ fontSize: '16px' }} />
              </Col>

              {/* Delete Button */}
              <Col xs={24} sm={12} md={8} style={{ marginBottom: 8, width:"20%" }}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveCriteria(index)}
                  block
                  style={{  width:"20%" }}
                />
              </Col>
            </Row>
          ))}
        </div>

        <Button type="primary" onClick={handleSubmit} block style={{ fontSize: '24px', height: '40px' }}>
          บันทึกเกณฑ์การประเมิน
        </Button>
      </Form>

      {/* Success Modal */}
      <Modal
        title="สร้างเกณฑ์การประเมินของเเบบทดสอบเรียบร้อยแล้ว"
        open={isEditSuccessModalVisible}
        onOk={handleOk}
        onCancel={() => setIsEditSuccessModalVisible(false)}
        okText="ตกลง"
        centered
      >
        <p style={{ textAlign: "center", color: "#cf1322" }}>
          ข้อมูลเกณฑ์การประเมินของคุณได้ถูกบันทึกสำเร็จแล้ว
        </p>
      </Modal>
    </div>
  );
};

export default CreateCriteriaPage;
