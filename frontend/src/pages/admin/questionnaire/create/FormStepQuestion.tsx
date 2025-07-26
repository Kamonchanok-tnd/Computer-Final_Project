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
// import { Question } from "../../../../interfaces/IQuestion";
// import { AnswerOption } from "../../../../interfaces/IAnswerOption";
// import { createQuestions } from "../../../../services/https/questionnaire";
// import "./fromStepQuestion.css";
// import createIcon from "../../../../assets/create.png";

// const { Panel } = Collapse;

// interface QuestionWithAnswers {
//   question: Question & { priority: number };
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

// const FormStepQuestion: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const questionnaireId = location.state?.questionnaireId;
//   const quantity = location.state?.quantity || 3;

//   const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);
//   const [activeKeys, setActiveKeys] = useState<string[]>([]);

//   useEffect(() => {
//     if (!questionnaireId) {
//       alert("ไม่พบข้อมูลแบบทดสอบ กรุณาสร้างแบบทดสอบก่อน");
//       navigate("/admin/forminfo");
//     } else {
//       const init: QuestionWithAnswers[] = Array.from({ length: quantity }, (_, i) => ({
//         question: {
//           id: 0,
//           nameQuestion: "",
//           quID: questionnaireId,
//           priority: i + 1
//         },
//         answers: Array.from({ length: 4 }, () => ({ description: "", point: 0 }))
//       }));
//       setQuestions(init);
//       setActiveKeys(init.map((_, i) => i.toString())); // เปิดทั้งหมดตอนโหลด
//     }
//   }, [questionnaireId, quantity, navigate]);

//   const togglePanel = (key: string) => {
//     setActiveKeys((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
//   const collapseAll = () => setActiveKeys([]);

//   const updateQuestionText = (qIndex: number, value: string) => {
//     const updated = [...questions];
//     updated[qIndex].question.nameQuestion = value;
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

//   const removeAnswer = (qIndex: number, aIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.splice(aIndex, 1);
//     setQuestions(updated);
//   };

//   const removeQuestion = (qIndex: number) => {
//     const updated = [...questions];
//     updated.splice(qIndex, 1);
//     const reordered = updated.map((q, index) => ({
//       ...q,
//       question: { ...q.question, priority: index + 1 }
//     }));
//     setQuestions(reordered);
//   };

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const reordered = Array.from(questions);
//     const [movedItem] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, movedItem);
//     const updated = reordered.map((q, index) => ({
//       ...q,
//       question: { ...q.question, priority: index + 1 }
//     }));
//     setQuestions(updated);
//   };

//   const handleSubmit = async () => {
//     const cleanedQuestions = questions.map((q) => ({
//       question: q.question,
//       answers: q.answers.filter((a) => a.description.trim() !== "")
//     }));

//     for (const [index, q] of cleanedQuestions.entries()) {
//       if (!q.question.nameQuestion.trim()) {
//         alert(`กรุณากรอกคำถามที่ ${index + 1}`);
//         return;
//       }
//       if (q.answers.length === 0) {
//         alert(`กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${index + 1}`);
//         return;
//       }
//     }

//     try {
//       await createQuestions(cleanedQuestions);
//       setIsEditSuccessModalVisible(true);
//     } catch (error) {
//       console.error("❌ Error creating questions:", error);
//       alert("❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
//     }
//   };

//   return (
//     <div className="form-step-question-container">
//       <div className="form-step-question-box">
//         {/* ✅ หัวข้อใหญ่พร้อมไอคอน */}
//         <h2
//           style={{
//             textAlign: "center",
//             fontWeight: 700,
//             marginBottom: 16,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             gap: "12px"
//           }}
//         >
//           <img
//             src={createIcon}
//             alt="manage"
//             style={{ width: 50, height: 50, objectFit: "contain" }}
//           />
//           จัดการรายละเอียดคำถามและคำตอบ
//         </h2>

//         <div style={{ textAlign: "right", marginBottom: 16 }}>
//           <Button onClick={expandAll} style={{ marginRight: 8 }}>
//             ขยายทั้งหมด
//           </Button>
//           <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
//         </div>

//         <Form layout="vertical">
//           <DragDropContext onDragEnd={handleDragEnd}>
//             <Droppable droppableId="question-list">
//               {(provided) => (
//                 <div {...provided.droppableProps} ref={provided.innerRef}>
//                   {questions.map((q, qIndex) => {
//                     const panelKey = qIndex.toString();
//                     return (
//                       <Draggable
//                         key={`question-${qIndex}`}
//                         draggableId={`question-${qIndex}`}
//                         index={qIndex}
//                       >
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             style={{
//                               marginBottom: 16,
//                               borderRadius: 12,
//                               overflow: "hidden",
//                               ...provided.draggableProps.style
//                             }}
//                           >
//                             <Collapse
//                               activeKey={activeKeys}
//                               bordered={false}
//                               style={{
//                                 background:
//                                   backgroundPatterns[qIndex % backgroundPatterns.length],
//                                 borderRadius: 12
//                               }}
//                             >
//                               <Panel
//                                 header={
//                                   <div
//                                     style={{
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "space-between"
//                                     }}
//                                   >
//                                     <span style={{ fontSize: 18, fontWeight: 600 }}>
//                                       คำถามข้อที่ {qIndex + 1}
//                                     </span>
//                                     <Tag color="blue">ลำดับ: {q.question.priority}</Tag>
//                                   </div>
//                                 }
//                                 key={panelKey}
//                                 extra={
//                                   <div
//                                     style={{
//                                       display: "flex",
//                                       gap: "10px",
//                                       alignItems: "center"
//                                     }}
//                                   >
//                                     {/* ปุ่มพับ */}
//                                     <Button
//                                       type="text"
//                                       icon={
//                                         activeKeys.includes(panelKey) ? (
//                                           <MinusSquareOutlined />
//                                         ) : (
//                                           <PlusSquareOutlined />
//                                         )
//                                       }
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         togglePanel(panelKey);
//                                       }}
//                                     />

//                                     {/* ปุ่มลบ */}
//                                     <Button
//                                       type="text"
//                                       danger
//                                       icon={<DeleteOutlined />}
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         removeQuestion(qIndex);
//                                       }}
//                                     />

//                                     {/* ปุ่มลาก */}
//                                     <div
//                                       {...provided.dragHandleProps}
//                                       style={{
//                                         cursor: "grab",
//                                         fontSize: 18,
//                                         color: "#444"
//                                       }}
//                                       title="ลากเพื่อเปลี่ยนลำดับ"
//                                     >
//                                       <MenuOutlined />
//                                     </div>
//                                   </div>
//                                 }
//                               >
//                                 <Form.Item label="คำถาม">
//                                   <Input
//                                     value={q.question.nameQuestion}
//                                     onChange={(e) => updateQuestionText(qIndex, e.target.value)}
//                                   />
//                                 </Form.Item>

//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     height: 40,
//                                     padding: "0 8px",
//                                     fontWeight: 600,
//                                     marginBottom: 8
//                                   }}
//                                 >
//                                   <span style={{ width: 800 }}>ตัวเลือกคำตอบ</span>
//                                   <span style={{ width: 80 }}>คะแนน</span>
//                                   <span style={{ width: 60 }}></span>
//                                 </div>

//                                 {/* รายการตัวเลือก */}
//                                 <div className="answers-list-wrapper">
//                                   {q.answers.map((a, aIndex) => (
//                                     <div
//                                       key={aIndex}
//                                       style={{
//                                         display: "flex",
//                                         gap: "8px",
//                                         marginBottom: 8
//                                       }}
//                                     >
//                                       <Input
//                                         placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                                         value={a.description}
//                                         onChange={(e) =>
//                                           updateAnswer(qIndex, aIndex, "description", e.target.value)
//                                         }
//                                         style={{ width: 800 }}
//                                       />
//                                       <InputNumber
//                                         placeholder="คะแนน"
//                                         value={a.point}
//                                         onChange={(value) =>
//                                           updateAnswer(qIndex, aIndex, "point", value || 0)
//                                         }
//                                         style={{ width: 80 }}
//                                         min={0}
//                                       />
//                                       <Button
//                                         danger
//                                         icon={<DeleteOutlined />}
//                                         onClick={() => removeAnswer(qIndex, aIndex)}
//                                         style={{ width: 60 }}
//                                       />
//                                     </div>
//                                   ))}
//                                 </div>

//                                 <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
//                                   + เพิ่มตัวเลือก
//                                 </Button>
//                               </Panel>
//                             </Collapse>
//                           </div>
//                         )}
//                       </Draggable>
//                     );
//                   })}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>
// <div
//   className="form-step-nav-btns"
//   style={{
//     marginTop: 24,
//     display: "flex",
//     justifyContent: "flex-end"
//   }}
// >
//   <Button
//     type="primary"
//     onClick={handleSubmit}
//     style={{
//       padding: "8px 16px", // ปรับ padding ให้ดูพอดี
//       width: "auto", // ✅ กล่องกว้างตามข้อความ
//       fontWeight: 600
//     }}
//   >
//     บันทึกคำถามและคำตอบทั้งหมด
//   </Button>
// </div>
//         </Form>
//       </div>

//       <Modal
//         title="สร้างคำถามเรียบร้อยแล้ว"
//         open={isEditSuccessModalVisible}
//         onOk={() => {
//           setIsEditSuccessModalVisible(false);
//           navigate("/admin/questionnairePage");
//         }}
//         onCancel={() => setIsEditSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//       >
//         <p style={{ textAlign: "center" }}>✅บันทึกข้อมูลคำถามเรียบร้อยแล้ว!</p>
//       </Modal>
//     </div>
//   );
// };

// export default FormStepQuestion;



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
// import { Question } from "../../../../interfaces/IQuestion";
// import { AnswerOption } from "../../../../interfaces/IAnswerOption";
// import { createQuestions } from "../../../../services/https/questionnaire";
// import "./fromStepQuestion.css";
// import createIcon from "../../../../assets/create.png";

// const { Panel } = Collapse;

// interface QuestionWithAnswers {
//   question: Question & { priority: number };
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

// const FormStepQuestion: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const questionnaireId = location.state?.questionnaireId;
//   const quantity = location.state?.quantity || 3;

//   const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);
//   const [activeKeys, setActiveKeys] = useState<string[]>([]);

//   useEffect(() => {
//     if (!questionnaireId) {
//       alert("ไม่พบข้อมูลแบบทดสอบ กรุณาสร้างแบบทดสอบก่อน");
//       navigate("/admin/forminfo");
//     } else {
//       const init: QuestionWithAnswers[] = Array.from({ length: quantity }, (_, i) => ({
//         question: {
//           id: 0,
//           nameQuestion: "",
//           quID: questionnaireId,
//           priority: i + 1,
//           picture: null // ✅ เพิ่มค่าเริ่มต้น
//         },
//         answers: Array.from({ length: 4 }, () => ({ description: "", point: 0 }))
//       }));
//       setQuestions(init);
//       setActiveKeys(init.map((_, i) => i.toString())); // เปิดทั้งหมดตอนโหลด
//     }
//   }, [questionnaireId, quantity, navigate]);

//   const togglePanel = (key: string) => {
//     setActiveKeys((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
//   const collapseAll = () => setActiveKeys([]);

//   const updateQuestionText = (qIndex: number, value: string) => {
//     const updated = [...questions];
//     updated[qIndex].question.nameQuestion = value;
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

//   const removeAnswer = (qIndex: number, aIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.splice(aIndex, 1);
//     setQuestions(updated);
//   };

//   const removeQuestion = (qIndex: number) => {
//     const updated = [...questions];
//     updated.splice(qIndex, 1);
//     const reordered = updated.map((q, index) => ({
//       ...q,
//       question: { ...q.question, priority: index + 1 }
//     }));
//     setQuestions(reordered);
//   };

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const reordered = Array.from(questions);
//     const [movedItem] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, movedItem);
//     const updated = reordered.map((q, index) => ({
//       ...q,
//       question: { ...q.question, priority: index + 1 }
//     }));
//     setQuestions(updated);
//   };

//   const handleImageChange = (qIndex: number, file: File) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const updated = [...questions];
//       updated[qIndex].question.picture = reader.result as string;
//       setQuestions(updated);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async () => {
//     const cleanedQuestions = questions.map((q) => ({
//       question: q.question,
//       answers: q.answers.filter((a) => a.description.trim() !== "")
//     }));

//     for (const [index, q] of cleanedQuestions.entries()) {
//       if (!q.question.nameQuestion.trim()) {
//         alert(`กรุณากรอกคำถามที่ ${index + 1}`);
//         return;
//       }
//       if (q.answers.length === 0) {
//         alert(`กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${index + 1}`);
//         return;
//       }
//     }

//     try {
//       await createQuestions(cleanedQuestions);
//       setIsEditSuccessModalVisible(true);
//     } catch (error) {
//       console.error("❌ Error creating questions:", error);
//       alert("❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
//     }
//   };

//   return (
//     <div className="form-step-question-container">
//       <div className="form-step-question-box">
//         <h2
//           style={{
//             textAlign: "center",
//             fontWeight: 700,
//             marginBottom: 16,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             gap: "12px"
//           }}
//         >
//           <img
//             src={createIcon}
//             alt="manage"
//             style={{ width: 50, height: 50, objectFit: "contain" }}
//           />
//           จัดการรายละเอียดคำถามและคำตอบ
//         </h2>

//         <div style={{ textAlign: "right", marginBottom: 16 }}>
//           <Button onClick={expandAll} style={{ marginRight: 8 }}>
//             ขยายทั้งหมด
//           </Button>
//           <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
//         </div>

//         <Form layout="vertical">
//           <DragDropContext onDragEnd={handleDragEnd}>
//             <Droppable droppableId="question-list">
//               {(provided) => (
//                 <div {...provided.droppableProps} ref={provided.innerRef}>
//                   {questions.map((q, qIndex) => {
//                     const panelKey = qIndex.toString();
//                     return (
//                       <Draggable
//                         key={`question-${qIndex}`}
//                         draggableId={`question-${qIndex}`}
//                         index={qIndex}
//                       >
//                         {(provided) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             style={{
//                               marginBottom: 16,
//                               borderRadius: 12,
//                               overflow: "hidden",
//                               ...provided.draggableProps.style
//                             }}
//                           >
//                             <Collapse
//                               activeKey={activeKeys}
//                               bordered={false}
//                               style={{
//                                 background:
//                                   backgroundPatterns[qIndex % backgroundPatterns.length],
//                                 borderRadius: 12
//                               }}
//                             >
//                               <Panel
//                                 header={
//                                   <div
//                                     style={{
//                                       display: "flex",
//                                       alignItems: "center",
//                                       justifyContent: "space-between"
//                                     }}
//                                   >
//                                     <span style={{ fontSize: 18, fontWeight: 600 }}>
//                                       คำถามข้อที่ {qIndex + 1}
//                                     </span>
//                                     <Tag color="blue">ลำดับ: {q.question.priority}</Tag>
//                                   </div>
//                                 }
//                                 key={panelKey}
//                                 extra={
//                                   <div
//                                     style={{
//                                       display: "flex",
//                                       gap: "10px",
//                                       alignItems: "center"
//                                     }}
//                                   >
//                                     <Button
//                                       type="text"
//                                       icon={
//                                         activeKeys.includes(panelKey) ? (
//                                           <MinusSquareOutlined />
//                                         ) : (
//                                           <PlusSquareOutlined />
//                                         )
//                                       }
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         togglePanel(panelKey);
//                                       }}
//                                     />

//                                     <Button
//                                       type="text"
//                                       danger
//                                       icon={<DeleteOutlined />}
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         removeQuestion(qIndex);
//                                       }}
//                                     />

//                                     <div
//                                       {...provided.dragHandleProps}
//                                       style={{
//                                         cursor: "grab",
//                                         fontSize: 18,
//                                         color: "#444"
//                                       }}
//                                       title="ลากเพื่อเปลี่ยนลำดับ"
//                                     >
//                                       <MenuOutlined />
//                                     </div>
//                                   </div>
//                                 }
//                               >
//                                 <Form.Item label="คำถาม">
//                                   <Input
//                                     value={q.question.nameQuestion}
//                                     onChange={(e) => updateQuestionText(qIndex, e.target.value)}
//                                   />
//                                 </Form.Item>

//                                 {/* ✅ อัปโหลดรูป */}
//                                 <Form.Item label="อัปโหลดรูป (ไม่บังคับ)">
//                                   <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={(e) => {
//                                       const file = e.target.files?.[0];
//                                       if (file) handleImageChange(qIndex, file);
//                                     }}
//                                   />
//                                   {q.question.picture && (
//                                     <div style={{ marginTop: 8 }}>
//                                       <img
//                                         src={q.question.picture}
//                                         alt="preview"
//                                         style={{ width: 100, borderRadius: 8 }}
//                                       />
//                                       <Button
//                                         danger
//                                         type="link"
//                                         style={{ marginLeft: 8 }}
//                                         onClick={() => {
//                                           const updated = [...questions];
//                                           updated[qIndex].question.picture = null;
//                                           setQuestions(updated);
//                                         }}
//                                       >
//                                         ลบรูป
//                                       </Button>
//                                     </div>
//                                   )}
//                                 </Form.Item>

//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     height: 40,
//                                     padding: "0 8px",
//                                     fontWeight: 600,
//                                     marginBottom: 8
//                                   }}
//                                 >
//                                   <span style={{ width: 800 }}>ตัวเลือกคำตอบ</span>
//                                   <span style={{ width: 80 }}>คะแนน</span>
//                                   <span style={{ width: 60 }}></span>
//                                 </div>

//                                 <div className="answers-list-wrapper">
//                                   {q.answers.map((a, aIndex) => (
//                                     <div
//                                       key={aIndex}
//                                       style={{
//                                         display: "flex",
//                                         gap: "8px",
//                                         marginBottom: 8
//                                       }}
//                                     >
//                                       <Input
//                                         placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                                         value={a.description}
//                                         onChange={(e) =>
//                                           updateAnswer(qIndex, aIndex, "description", e.target.value)
//                                         }
//                                         style={{ width: 800 }}
//                                       />
//                                       <InputNumber
//                                         placeholder="คะแนน"
//                                         value={a.point}
//                                         onChange={(value) =>
//                                           updateAnswer(qIndex, aIndex, "point", value || 0)
//                                         }
//                                         style={{ width: 80 }}
//                                         min={0}
//                                       />
//                                       <Button
//                                         danger
//                                         icon={<DeleteOutlined />}
//                                         onClick={() => removeAnswer(qIndex, aIndex)}
//                                         style={{ width: 60 }}
//                                       />
//                                     </div>
//                                   ))}
//                                 </div>

//                                 <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
//                                   + เพิ่มตัวเลือก
//                                 </Button>
//                               </Panel>
//                             </Collapse>
//                           </div>
//                         )}
//                       </Draggable>
//                     );
//                   })}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>

//           <div
//             className="form-step-nav-btns"
//             style={{
//               marginTop: 24,
//               display: "flex",
//               justifyContent: "flex-end"
//             }}
//           >
//             <Button
//               type="primary"
//               onClick={handleSubmit}
//               style={{
//                 padding: "8px 16px",
//                 width: "auto",
//                 fontWeight: 600
//               }}
//             >
//               บันทึกคำถามและคำตอบทั้งหมด
//             </Button>
//           </div>
//         </Form>
//       </div>

//       <Modal
//         title="สร้างคำถามเรียบร้อยแล้ว"
//         open={isEditSuccessModalVisible}
//         onOk={() => {
//           setIsEditSuccessModalVisible(false);
//           navigate("/admin/questionnairePage");
//         }}
//         onCancel={() => setIsEditSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//       >
//         <p style={{ textAlign: "center" }}>✅บันทึกข้อมูลคำถามเรียบร้อยแล้ว!</p>
//       </Modal>
//     </div>
//   );
// };

// export default FormStepQuestion;




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
  Upload
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
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { createQuestions } from "../../../../services/https/questionnaire";
import "./fromStepQuestion.css";
import createIcon from "../../../../assets/create.png";

const { Panel } = Collapse;

interface QuestionWithAnswers {
  question: Question & { priority: number };
  answers: AnswerOption[];
}

const backgroundPatterns = [
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

const FormStepQuestion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questionnaireId = location.state?.questionnaireId;
  const quantity = location.state?.quantity || 3;

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (!questionnaireId) {
      alert("ไม่พบข้อมูลแบบทดสอบ กรุณาสร้างแบบทดสอบก่อน");
      navigate("/admin/forminfo");
    } else {
      const init: QuestionWithAnswers[] = Array.from({ length: quantity }, (_, i) => ({
        question: {
          id: 0,
          nameQuestion: "",
          quID: questionnaireId,
          priority: i + 1,
          picture: null
        },
        answers: Array.from({ length: 4 }, () => ({ description: "", point: 0 }))
      }));
      setQuestions(init);
      setActiveKeys(init.map((_, i) => i.toString()));
    }
  }, [questionnaireId, quantity, navigate]);

  const togglePanel = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
  const collapseAll = () => setActiveKeys([]);

  const updateQuestionText = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].question.nameQuestion = value;
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

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(aIndex, 1);
    setQuestions(updated);
  };

  const removeQuestion = (qIndex: number) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    const reordered = updated.map((q, index) => ({
      ...q,
      question: { ...q.question, priority: index + 1 }
    }));
    setQuestions(reordered);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    const updated = reordered.map((q, index) => ({
      ...q,
      question: { ...q.question, priority: index + 1 }
    }));
    setQuestions(updated);
  };

  const handleImageUpload = (file: File, qIndex: number) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...questions];
      updated[qIndex].question.picture = reader.result as string;
      setQuestions(updated);
    };
    reader.readAsDataURL(file);
    return false; // prevent upload to server
  };

  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const handleSubmit = async () => {
    const cleanedQuestions = questions.map((q) => ({
      question: q.question,
      answers: q.answers.filter((a) => a.description.trim() !== "")
    }));

    for (const [index, q] of cleanedQuestions.entries()) {
      if (!q.question.nameQuestion.trim()) {
        alert(`กรุณากรอกคำถามที่ ${index + 1}`);
        return;
      }
      if (q.answers.length === 0) {
        alert(`กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${index + 1}`);
        return;
      }
    }

    try {
      await createQuestions(cleanedQuestions);
      setIsEditSuccessModalVisible(true);
    } catch (error) {
      console.error("❌ Error creating questions:", error);
      alert("❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="form-step-question-container">
      <div className="form-step-question-box">
        <h2 style={{ textAlign: "center", fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
          <img src={createIcon} alt="manage" style={{ width: 50, height: 50, objectFit: "contain" }} />
          จัดการรายละเอียดคำถามและคำตอบ
        </h2>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button onClick={expandAll} style={{ marginRight: 8 }}>ขยายทั้งหมด</Button>
          <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
        </div>

        <Form layout="vertical">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="question-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((q, qIndex) => {
                    const panelKey = qIndex.toString();
                    return (
                      <Draggable key={`question-${qIndex}`} draggableId={`question-${qIndex}`} index={qIndex}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", ...provided.draggableProps.style }}>
                            <Collapse activeKey={activeKeys} bordered={false} style={{ background: backgroundPatterns[qIndex % backgroundPatterns.length], borderRadius: 12 }}>
                              <Panel
                                header={<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 18, fontWeight: 600 }}>คำถามข้อที่ {qIndex + 1}</span><Tag color="blue">ลำดับ: {q.question.priority}</Tag></div>}
                                key={panelKey}
                                extra={
                                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <Button type="text" icon={activeKeys.includes(panelKey) ? <MinusSquareOutlined /> : <PlusSquareOutlined />} onClick={(e) => { e.stopPropagation(); togglePanel(panelKey); }} />
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }} />
                                    <div {...provided.dragHandleProps} style={{ cursor: "grab", fontSize: 18, color: "#444" }} title="ลากเพื่อเปลี่ยนลำดับ"><MenuOutlined /></div>
                                  </div>
                                }
                              >
                                <Form.Item label="คำถาม">
                                  <Input value={q.question.nameQuestion} onChange={(e) => updateQuestionText(qIndex, e.target.value)} />
                                </Form.Item>

                                {/* ✅ Upload Image with Preview */}
                                <Form.Item label="อัปโหลดรูป (ไม่บังคับ)">
                                  <Upload
                                    beforeUpload={(file) => handleImageUpload(file, qIndex)}
                                    listType="picture-card"
                                    fileList={q.question.picture ? [{ uid: "-1", name: "image.png", status: "done", url: q.question.picture }] : []}
                                    onPreview={() => handlePreview(q.question.picture!)}
                                    onRemove={() => {
                                      const updated = [...questions];
                                      updated[qIndex].question.picture = null;
                                      setQuestions(updated);
                                    }}
                                  >
                                    {!q.question.picture && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                                  </Upload>
                                </Form.Item>

                                <div style={{ display: "flex", alignItems: "center", height: 40, padding: "0 8px", fontWeight: 600, marginBottom: 8 }}>
                                  <span style={{ width: 800 }}>ตัวเลือกคำตอบ</span>
                                  <span style={{ width: 80 }}>คะแนน</span>
                                  <span style={{ width: 60 }}></span>
                                </div>

                                {q.answers.map((a, aIndex) => (
                                  <div key={aIndex} style={{ display: "flex", gap: "8px", marginBottom: 8 }}>
                                    <Input placeholder={`ตัวเลือกที่ ${aIndex + 1}`} value={a.description} onChange={(e) => updateAnswer(qIndex, aIndex, "description", e.target.value)} style={{ width: 800 }} />
                                    <InputNumber placeholder="คะแนน" value={a.point} onChange={(value) => updateAnswer(qIndex, aIndex, "point", value || 0)} style={{ width: 80 }} min={0} />
                                    <Button danger icon={<DeleteOutlined />} onClick={() => removeAnswer(qIndex, aIndex)} style={{ width: 60 }} />
                                  </div>
                                ))}
                                <Button type="dashed" onClick={() => addAnswer(qIndex)} block>+ เพิ่มตัวเลือก</Button>
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
            <Button type="primary" onClick={handleSubmit} style={{ padding: "8px 16px", width: "auto", fontWeight: 600 }}>
              ✅ บันทึกคำถามและคำตอบทั้งหมด
            </Button>
          </div>
        </Form>
      </div>

      <Modal visible={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
        <img alt="Preview" style={{ width: "100%" }} src={previewImage!} />
      </Modal>

      <Modal title="สร้างคำถามเรียบร้อยแล้ว" open={isEditSuccessModalVisible} onOk={() => { setIsEditSuccessModalVisible(false); navigate("/admin/questionnairePage"); }} onCancel={() => setIsEditSuccessModalVisible(false)} okText="ตกลง" centered>
        <p style={{ textAlign: "center" }}>✅บันทึกข้อมูลคำถามเรียบร้อยแล้ว!</p>
      </Modal>
    </div>
  );
};

export default FormStepQuestion;
