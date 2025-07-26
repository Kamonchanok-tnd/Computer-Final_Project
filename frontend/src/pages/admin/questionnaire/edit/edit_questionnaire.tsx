// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Button,
//   Form,
//   Input,
//   InputNumber,
//   Modal,
//   Tag,
//   Collapse
// } from "antd";
// import {
//   DeleteOutlined,
//   MenuOutlined,
//   MinusSquareOutlined,
//   PlusSquareOutlined
// } from "@ant-design/icons";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult
// } from "@hello-pangea/dnd";
// import {
//   getQuestionnaireById,
//   updateQuestionnaire,
//   deleteQuestion,
//   deleteAnswer
// } from "../../../../services/https/questionnaire";
// import "./edit_questionnaire.css";

// // ✅ Import รูปไอคอนจาก assets
// import editIcon from "../../../../assets/edit.png";
// import nameQuestionnaireIcon from "../../../../assets/nameQuestionnaire.png";
// import descriptionIcon from "../../../../assets/description.png";

// const { Panel } = Collapse;

// interface AnswerOption {
//   id?: number;
//   description: string;
//   point: number;
// }

// interface Question {
//   id?: number;
//   nameQuestion: string;
//   priority: number;
//   answers: AnswerOption[];
// }

// const backgroundPatterns = [
//   "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
//   "linear-gradient(135deg, #C9FFBF 0%, #FFAFBD 100%)",
//   "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)",
//   "linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)",
//   "linear-gradient(135deg, #FBD3E9 0%, #BB377D 100%)",
//   "linear-gradient(135deg, #C6FFDD 0%, #FBD786 50%, #f7797d 100%)",
//   "linear-gradient(135deg, #89F7FE 0%, #66A6FF 100%)",
//   "linear-gradient(135deg, #F9D423 0%, #FF4E50 100%)",
//   "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)",
//   "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)"
// ];

// const EditQuestionnaire: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const questionnaireId = location.state?.questionnaireId;

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] =
//     useState(false);
//   const [activeKeys, setActiveKeys] = useState<string[]>([]);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (!questionnaireId) {
//       alert("ไม่พบข้อมูลแบบทดสอบ กรุณากลับไปหน้าเดิม");
//       navigate("/admin/questionnairePage");
//     } else {
//       fetchData();
//     }
//   }, [questionnaireId]);

//   const fetchData = async () => {
//     const data = await getQuestionnaireById(questionnaireId);
//     form.setFieldsValue({
//       name: data.nameQuestionnaire,
//       description: data.description
//     });
//     const formattedQuestions = (data.questions ?? []).map((q: any) => ({
//       id: q.id,
//       nameQuestion: q.nameQuestion,
//       priority: q.priority,
//       answers: q.answers || q.answerOptions || []
//     }));
//     setQuestions(formattedQuestions);
//     setActiveKeys(formattedQuestions.map((_, i) => i.toString())); // เปิดทั้งหมด
//   };

//   const togglePanel = (key: string) => {
//     setActiveKeys((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
//   const collapseAll = () => setActiveKeys([]);

//   const updateQuestionText = (qIndex: number, value: string) => {
//     const updated = [...questions];
//     updated[qIndex].nameQuestion = value;
//     setQuestions(updated);
//   };

//   const updateAnswer = (
//     qIndex: number,
//     aIndex: number,
//     field: "description" | "point",
//     value: string | number
//   ) => {
//     const updated = [...questions];
//     if (field === "description") {
//       updated[qIndex].answers[aIndex].description = value as string;
//     } else {
//       updated[qIndex].answers[aIndex].point = value as number;
//     }
//     setQuestions(updated);
//   };

//   const addAnswer = (qIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.push({ description: "", point: 0 });
//     setQuestions(updated);
//   };

//   const removeAnswer = async (qIndex: number, aIndex: number) => {
//     const answerId = questions[qIndex].answers[aIndex].id;
//     if (answerId) {
//       await deleteAnswer(answerId);
//     }
//     const updated = [...questions];
//     updated[qIndex].answers.splice(aIndex, 1);
//     setQuestions(updated);
//   };

//   const removeQuestion = async (qIndex: number) => {
//     const questionId = questions[qIndex].id;
//     if (questionId) {
//       await deleteQuestion(questionId);
//     }
//     const updated = questions.filter((_, i) => i !== qIndex);
//     updated.forEach((q, i) => (q.priority = i + 1));
//     setQuestions(updated);
//   };

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const reordered = Array.from(questions);
//     const [movedItem] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, movedItem);
//     const updated = reordered.map((q, index) => ({
//       ...q,
//       priority: index + 1
//     }));
//     setQuestions(updated);
//   };

//   const addQuestion = () => {
//     const newQuestion: Question = {
//       nameQuestion: "",
//       priority: questions.length + 1,
//       answers: Array.from({ length: 4 }, () => ({
//         description: "",
//         point: 0
//       })) // ✅ 4 ช่อง
//     };
//     const updated = [...questions, newQuestion];
//     setQuestions(updated);
//     setActiveKeys(updated.map((_, i) => i.toString())); // เปิดทั้งหมด
//   };

//   const handleSubmit = async () => {
//     await updateQuestionnaire(questionnaireId, {
//       name: form.getFieldValue("name"),
//       description: form.getFieldValue("description"),
//       questions: questions.map((q) => ({
//         id: q.id,
//         nameQuestion: q.nameQuestion,
//         priority: q.priority,
//         answers: q.answers
//           .filter((a) => a.description.trim() !== "") // ✅ ตัดตัวเลือกที่เว้นว่างออก
//           .map((a) => ({
//             id: a.id,
//             description: a.description,
//             point: a.point
//           }))
//       }))
//     });
//     setIsEditSuccessModalVisible(true);
//   };

//   return (
//     <div className="edit-questionnaire-container">
//       <div className="edit-questionnaire-box">
//         {/* ✅ หัวข้อใหญ่พร้อมรูป */}
//         <h2
//           style={{
//             textAlign: "center",
//             fontWeight: 700,
//             marginBottom: 16,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: "12px"
//           }}
//         >
//           <img
//             src={editIcon}
//             alt="edit icon"
//             style={{ width: 50, height: 50, objectFit: "contain" }}
//           />
//           แก้ไขรายละเอียดคำถามและคำตอบ
//         </h2>

//         <Form layout="vertical" form={form}>
//           {/* ✅ ชื่อแบบทดสอบพร้อมรูป */}
//           <Form.Item
//             label={
//               <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                 <img
//                   src={nameQuestionnaireIcon}
//                   alt="title"
//                   style={{ width: 36, height: 36, objectFit: "contain" }}
//                 />
//                 ชื่อแบบทดสอบ
//               </span>
//             }
//             name="name"
//           >
//             <Input />
//           </Form.Item>

//           {/* ✅ รายละเอียดแบบทดสอบพร้อมรูป */}
//           <Form.Item
//             label={
//               <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                 <img
//                   src={descriptionIcon}
//                   alt="description"
//                   style={{ width: 36, height: 36, objectFit: "contain" }}
//                 />
//                 รายละเอียดแบบทดสอบ
//               </span>
//             }
//             name="description"
//           >
//             <Input.TextArea rows={3} />
//           </Form.Item>
//         </Form>

//         {/* ปุ่มขยาย/ย่อ */}
//         <div style={{ textAlign: "right", marginBottom: 16 }}>
//           <Button onClick={expandAll} style={{ marginRight: 8 }}>
//             ขยายทั้งหมด
//           </Button>
//           <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
//         </div>

//         {/* ✅ รายการคำถาม */}
//         <DragDropContext onDragEnd={handleDragEnd}>
//           <Droppable droppableId="question-list">
//             {(provided) => (
//               <div {...provided.droppableProps} ref={provided.innerRef}>
//                 {questions.map((q, qIndex) => {
//                   const panelKey = qIndex.toString();
//                   return (
//                     <Draggable
//                       key={`question-${qIndex}`}
//                       draggableId={`question-${qIndex}`}
//                       index={qIndex}
//                     >
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           style={{
//                             marginBottom: 16,
//                             borderRadius: 12,
//                             overflow: "hidden",
//                             ...provided.draggableProps.style
//                           }}
//                         >
//                           <Collapse
//                             activeKey={activeKeys}
//                             bordered={false}
//                             style={{
//                               background:
//                                 backgroundPatterns[
//                                   qIndex % backgroundPatterns.length
//                                 ],
//                               borderRadius: 12
//                             }}
//                           >
//                             <Panel
//                               header={
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "space-between"
//                                   }}
//                                 >
//                                   <span style={{ fontSize: 18, fontWeight: 600 }}>
//                                     คำถามข้อที่ {qIndex + 1}
//                                   </span>
//                                   <Tag color="blue">ลำดับ: {q.priority}</Tag>
//                                 </div>
//                               }
//                               key={panelKey}
//                               extra={
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: "10px",
//                                     alignItems: "center"
//                                   }}
//                                 >
//                                   {/* ปุ่มย่อ/ขยาย */}
//                                   <Button
//                                     type="text"
//                                     icon={
//                                       activeKeys.includes(panelKey) ? (
//                                         <MinusSquareOutlined />
//                                       ) : (
//                                         <PlusSquareOutlined />
//                                       )
//                                     }
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       togglePanel(panelKey);
//                                     }}
//                                   />
//                                   {/* ปุ่มลบ */}
//                                   <Button
//                                     type="text"
//                                     danger
//                                     icon={<DeleteOutlined />}
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       removeQuestion(qIndex);
//                                     }}
//                                     title="ลบคำถาม"
//                                   />
//                                   {/* ปุ่มลาก */}
//                                   <div
//                                     {...provided.dragHandleProps}
//                                     style={{
//                                       cursor: "grab",
//                                       fontSize: 18,
//                                       color: "#444"
//                                     }}
//                                     title="ลากเพื่อเปลี่ยนลำดับ"
//                                   >
//                                     <MenuOutlined />
//                                   </div>
//                                 </div>
//                               }
//                             >
//                               <Form.Item label="คำถาม">
//                                 <Input
//                                   value={q.nameQuestion}
//                                   onChange={(e) =>
//                                     updateQuestionText(qIndex, e.target.value)
//                                   }
//                                 />
//                               </Form.Item>

//                               {/* Header ตัวเลือก */}
//                               <div
//                                 style={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   height: 40,
//                                   padding: "0 8px",
//                                   fontWeight: 600,
//                                   marginBottom: 8
//                                 }}
//                               >
//                                 <span style={{ width: 800 }}>ตัวเลือกคำตอบ</span>
//                                 <span style={{ width: 80 }}>คะแนน</span>
//                                 <span style={{ width: 60 }}></span>
//                               </div>

//                               {/* รายการตัวเลือก */}
//                               <div className="answers-list-wrapper">
//                                 {q.answers.map((a, aIndex) => (
//                                   <div
//                                     key={aIndex}
//                                     style={{
//                                       display: "flex",
//                                       gap: "8px",
//                                       marginBottom: 8
//                                     }}
//                                   >
//                                     <Input
//                                       placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                                       value={a.description}
//                                       onChange={(e) =>
//                                         updateAnswer(
//                                           qIndex,
//                                           aIndex,
//                                           "description",
//                                           e.target.value
//                                         )
//                                       }
//                                       style={{ width: 800 }}
//                                     />
//                                     <InputNumber
//                                       placeholder="คะแนน"
//                                       value={a.point}
//                                       onChange={(value) =>
//                                         updateAnswer(
//                                           qIndex,
//                                           aIndex,
//                                           "point",
//                                           value || 0
//                                         )
//                                       }
//                                       style={{ width: 80 }}
//                                       min={0}
//                                     />
//                                     <Button
//                                       danger
//                                       icon={<DeleteOutlined />}
//                                       onClick={() =>
//                                         removeAnswer(qIndex, aIndex)
//                                       }
//                                       style={{ width: 60 }}
//                                     />
//                                   </div>
//                                 ))}
//                               </div>

//                               <Button
//                                 type="dashed"
//                                 onClick={() => addAnswer(qIndex)}
//                                 block
//                               >
//                                 + เพิ่มตัวเลือก
//                               </Button>
//                             </Panel>
//                           </Collapse>
//                         </div>
//                       )}
//                     </Draggable>
//                   );
//                 })}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>

//        <div
//           className="action-buttons"
//           style={{
//             marginTop: 24,
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: "12px"
//           }}
//         >
//           <Button
//             type="dashed"
//             onClick={addQuestion}
//             style={{
//               width: "auto",
//               padding: "8px 16px",
//               fontWeight: 600
//             }}
//           >
//             ➕ เพิ่มคำถามใหม่
//           </Button>

//           <Button
//             type="primary"
//             onClick={handleSubmit}
//             style={{
//               width: "auto",
//               padding: "8px 16px",
//               fontWeight: 600
//             }}
//           >
//              ✅ บันทึกการแก้ไขทั้งหมด 
//           </Button>
//         </div>
//       </div>

//       <Modal
//         title="🖊 แก้ไขข้อมูลเเบบทดสอบ คำถามเเละคำตอบเรียบร้อยเเล้ว"
//         open={isEditSuccessModalVisible}
//         onOk={() => {
//           setIsEditSuccessModalVisible(false);
//           navigate("/admin/questionnairePage");
//         }}
//         onCancel={() => setIsEditSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//       >
//         <p style={{ textAlign: "center" }}>✅บันทึกข้อมูลสำเร็จ!</p>
//       </Modal>
//     </div>
//   );
// };

// export default EditQuestionnaire;


import React, { useEffect, useState } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Tag,
  Collapse,
  Upload,
  message
} from "antd";
import {
  DeleteOutlined,
  MenuOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  UploadOutlined
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { getQuestionnaireById, updateQuestionnaire, deleteQuestion, deleteAnswer } from "../../../../services/https/questionnaire";
import "./edit_questionnaire.css";

const { Panel } = Collapse;

interface AnswerOption {
  id?: number;
  description: string;
  point: number;
}

interface Question {
  id?: number;
  nameQuestion: string;
  priority: number;
  picture?: string | null;
  answers: AnswerOption[];
}

// Explicitly type the backgroundPatterns array
const backgroundPatterns: string[] = [
  "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
  "linear-gradient(135deg, #C9FFBF 0%, #FFAFBD 100%)",
  "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)",
  "linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)",
  "linear-gradient(135deg, #FBD3E9 0%, #BB377D 100%)",
  "linear-gradient(135deg, #C6FFDD 0%, #FBD786 50%, #f7797d 100%)",
  "linear-gradient(135deg, #89F7FE 0%, #66A6FF 100%)",
  "linear-gradient(135deg, #F9D423 0%, #FF4E50 100%)",
  "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)",
  "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)"
];

const EditQuestionnaire: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questionnaireId = location.state?.questionnaireId;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!questionnaireId) {
      alert("ไม่พบข้อมูลแบบทดสอบ กรุณากลับไปหน้าเดิม");
      navigate("/admin/questionnairePage");
    } else {
      fetchData();
    }
  }, [questionnaireId]);

  const fetchData = async () => {
    try {
      const data = await getQuestionnaireById(questionnaireId);
      form.setFieldsValue({
        name: data.nameQuestionnaire,
        description: data.description
      });
      const formattedQuestions = (data.questions ?? []).map((q: any) => ({
        id: q.id,
        nameQuestion: q.nameQuestion,
        priority: q.priority,
        picture: q.picture || null,
        answers: q.answers || q.answerOptions || []
      }));
      setQuestions(formattedQuestions);
      setActiveKeys(formattedQuestions.map((_, i) => i.toString()));
    } catch (error) {
      message.error("โหลดข้อมูลล้มเหลว");
    }
  };

  const togglePanel = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
  const collapseAll = () => setActiveKeys([]);

  const updateQuestionText = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].nameQuestion = value;
    setQuestions(updated);
  };

  const updateAnswer = (
    qIndex: number,
    aIndex: number,
    field: "description" | "point",
    value: string | number
  ) => {
    const updated = [...questions];
    if (field === "description") {
      updated[qIndex].answers[aIndex].description = value as string;
    } else {
      updated[qIndex].answers[aIndex].point = value as number;
    }
    setQuestions(updated);
  };

  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ description: "", point: 0 });
    setQuestions(updated);
  };

  const removeAnswer = async (qIndex: number, aIndex: number) => {
    const answerId = questions[qIndex].answers[aIndex].id;
    if (answerId) await deleteAnswer(answerId);
    const updated = [...questions];
    updated[qIndex].answers.splice(aIndex, 1);
    setQuestions(updated);
  };

  const removeQuestion = async (qIndex: number) => {
    const questionId = questions[qIndex].id;
    if (questionId) await deleteQuestion(questionId);
    const updated = questions.filter((_, i) => i !== qIndex);
    updated.forEach((q, i) => (q.priority = i + 1));
    setQuestions(updated);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    const updated = reordered.map((q, index) => ({
      ...q,
      priority: index + 1
    }));
    setQuestions(updated);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      nameQuestion: "",
      priority: questions.length + 1, // ลำดับของคำถามใหม่ ไม่ปรับลำดับคำถามที่มีอยู่
      picture: null,
      answers: Array.from({ length: 4 }, () => ({
        description: "",
        point: 0
      }))
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated); // เพิ่มคำถามใหม่ในตาราง
    setActiveKeys(updated.map((_, i) => i.toString())); // อัปเดตแค่ active keys
  };

  const handleSubmit = async () => {
    console.log("✅ ข้อมูลที่จะส่งไปอัปเดต:", {
      name: form.getFieldValue("name"),
      description: form.getFieldValue("description"),
      questions
    });

    await updateQuestionnaire(questionnaireId, {
      name: form.getFieldValue("name"),
      description: form.getFieldValue("description"),
      questions: questions.map((q) => ({
        id: q.id,
        nameQuestion: q.nameQuestion,
        priority: q.priority,
        picture: q.picture, // ส่ง Base64 หรือ null
        answers: q.answers
          .filter((a) => a.description.trim() !== "")
          .map((a) => ({
            id: a.id,
            description: a.description,
            point: a.point
          }))
      }))
    });
    setIsEditSuccessModalVisible(true);
  };

  return (
    <div className="edit-questionnaire-container">
      <div className="edit-questionnaire-box">
        <h2 style={{ textAlign: "center", fontWeight: 700, marginBottom: 16 }}>
          แก้ไขรายละเอียดคำถามและคำตอบ
        </h2>

        <Form layout="vertical" form={form}>
          <Form.Item label="ชื่อแบบทดสอบ" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="รายละเอียดแบบทดสอบ" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button onClick={expandAll} style={{ marginRight: 8 }}>
            ขยายทั้งหมด
          </Button>
          <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="question-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {questions.map((q, qIndex) => {
                  const panelKey = qIndex.toString();
                  return (
                    <Draggable
                      key={`question-${qIndex}`}
                      draggableId={`question-${qIndex}`}
                      index={qIndex}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            marginBottom: 16,
                            borderRadius: 12,
                            overflow: "hidden",
                            ...provided.draggableProps.style
                          }}
                        >
                          <Collapse
                            activeKey={activeKeys}
                            bordered={false}
                            style={{
                              background:
                                backgroundPatterns[qIndex % backgroundPatterns.length],
                              borderRadius: 12
                            }}
                          >
                            <Panel
                              header={
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                  }}
                                >
                                  <span style={{ fontSize: 18, fontWeight: 600 }}>
                                    คำถามข้อที่ {qIndex + 1}
                                  </span>
                                  <Tag color="blue">ลำดับ: {q.priority}</Tag>
                                </div>
                              }
                              key={panelKey}
                              extra={
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <Button
                                    type="text"
                                    icon={
                                      activeKeys.includes(panelKey) ? (
                                        <MinusSquareOutlined />
                                      ) : (
                                        <PlusSquareOutlined />
                                      )
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePanel(panelKey);
                                    }}
                                  />
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeQuestion(qIndex);
                                    }}
                                  />
                                  <div
                                    {...provided.dragHandleProps}
                                    style={{ cursor: "grab", fontSize: 18 }}
                                  >
                                    <MenuOutlined />
                                  </div>
                                </div>
                              }
                            >
                              <Form.Item label="คำถาม">
                                <Input
                                  value={q.nameQuestion}
                                  onChange={(e) =>
                                    updateQuestionText(qIndex, e.target.value)
                                  }
                                />
                              </Form.Item>

                              {/* ✅ Upload รูป */}
                              <Form.Item label="อัปโหลดรูป (ไม่บังคับ)">
                                <Upload
                                  beforeUpload={(file) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const updated = [...questions];
                                      updated[qIndex].picture = reader.result as string;
                                      setQuestions(updated);
                                    };
                                    reader.readAsDataURL(file);
                                    return false; // ไม่อัปโหลดจริง
                                  }}
                                  listType="picture-card"
                                  fileList={q.picture ? [{ uid: "-1", name: "image.png", status: "done", url: q.picture }] : []}
                                  onPreview={() => {
                                    setPreviewImage(q.picture!);
                                    setPreviewVisible(true);
                                  }}
                                  onRemove={() => {
                                    const updated = [...questions];
                                    updated[qIndex].picture = null;
                                    setQuestions(updated);
                                  }}
                                >
                                  {!q.picture && (
                                    <div>
                                      <UploadOutlined />
                                      <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                  )}
                                </Upload>
                              </Form.Item>

                              {/* ✅ ตัวเลือกคำตอบ */}
                              <div style={{ display: "flex", fontWeight: 600, marginBottom: 8 }}>
                                <span style={{ width: 800 }}>ตัวเลือกคำตอบ</span>
                                <span style={{ width: 80 }}>คะแนน</span>
                              </div>

                              {q.answers.map((a, aIndex) => (
                                <div
                                  key={aIndex}
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: 8
                                  }}
                                >
                                  <Input
                                    placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
                                    value={a.description}
                                    onChange={(e) =>
                                      updateAnswer(qIndex, aIndex, "description", e.target.value)
                                    }
                                    style={{ width: 800 }}
                                  />
                                  <InputNumber
                                    placeholder="คะแนน"
                                    value={a.point}
                                    onChange={(value) =>
                                      updateAnswer(qIndex, aIndex, "point", value || 0)
                                    }
                                    style={{ width: 80 }}
                                  />
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeAnswer(qIndex, aIndex)}
                                    style={{ width: 60 }}
                                  />
                                </div>
                              ))}

                              <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
                                + เพิ่มตัวเลือก
                              </Button>
                            </Panel>
                          </Collapse>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button type="dashed" onClick={addQuestion} style={{ marginRight: 8 }}>
            ➕ เพิ่มคำถามใหม่
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            ✅ บันทึกการแก้ไขทั้งหมด
          </Button>
        </div>
      </div>

      {/* ✅ Preview Modal */}
      <Modal visible={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
        <img alt="Preview" style={{ width: "100%" }} src={previewImage!} />
      </Modal>

      <Modal
        title="แก้ไขข้อมูลเรียบร้อย"
        open={isEditSuccessModalVisible}
        onOk={() => {
          setIsEditSuccessModalVisible(false);
          navigate("/admin/questionnairePage");
        }}
        onCancel={() => setIsEditSuccessModalVisible(false)}
        okText="ตกลง"
      >
        <p style={{ textAlign: "center" }}>✅ บันทึกข้อมูลสำเร็จ!</p>
      </Modal>
    </div>
  );
};

export default EditQuestionnaire;
