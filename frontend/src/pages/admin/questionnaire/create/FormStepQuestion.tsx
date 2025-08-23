// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Button, Form, Input, InputNumber, Modal, Tag, Collapse, Upload, Select } from "antd";
// import { DeleteOutlined, MenuOutlined, MinusSquareOutlined, PlusSquareOutlined, UploadOutlined, EyeOutlined } from "@ant-design/icons";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
// import { Question } from "../../../../interfaces/IQuestion";
// import { AnswerOption } from "../../../../interfaces/IAnswerOption";
// import { EmotionChoice } from "../../../../interfaces/IEmotionChoices";
// import { createQuestions,getAllEmotionChoices } from "../../../../services/https/questionnaire";
// import "./fromStepQuestion.css";
// import questionIcon from "../../../../assets/question-mark.png";
// import manageQuestionAndAnswerIcon from "../../../../assets/manageQuestionAndAnswer.png";

// const { Panel } = Collapse;

// interface QuestionWithAnswers {
//   question: Question & { priority: number };
//   answers: AnswerOption[];
// }

// const backgroundPatterns = [
//   "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
//   "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)",
//   "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
//   "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
//   "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
// ];

// const FormStepQuestion: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const questionnaireId = (location.state as any)?.questionnaireId;
//   const quantity = (location.state as any)?.quantity || 3;

//   const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);
//   const [activeKeys, setActiveKeys] = useState<string[]>([]);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (!questionnaireId) {
//       Modal.warning({
//         title: "ไม่พบข้อมูลแบบทดสอบ",
//         content: "กรุณาสร้างแบบทดสอบก่อน",
//         onOk: () => navigate("/admin/forminfo"),
//       });
//       return;
//     }
//     const init: QuestionWithAnswers[] = Array.from({ length: quantity }, (_, i) => ({
//       question: { id: 0, nameQuestion: "", quID: questionnaireId, priority: i + 1, picture: null },
//       answers: Array.from({ length: 4 }, (_, aIndex) => ({ id: aIndex, description: "", point: 0, EmotionChoiceID: 0 })), 
//     }));
//     setQuestions(init);
//     setActiveKeys(init.map((_, i) => i.toString()));
//   }, [questionnaireId, quantity, navigate]);

//   const togglePanel = (key: string) =>
//     setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
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
//     if (field === "description") updated[qIndex].answers[aIndex].description = value as string;
//     else updated[qIndex].answers[aIndex].point = value as number;
//     setQuestions(updated);
//   };

//   const addAnswer = (qIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.push({ id: updated[qIndex].answers.length, description: "", point: 0, EmotionChoiceID: 0 });
//     setQuestions(updated);
//   };

//   const removeAnswer = (qIndex: number, aIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.splice(aIndex, 1);
//     setQuestions(updated);
//   };

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const reordered = Array.from(questions);
//     const [movedItem] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, movedItem);
//     const updated = reordered.map((q, index) => ({ ...q, question: { ...q.question, priority: index + 1 } }));
//     setQuestions(updated);
//   };

//   const handleImageUpload = (file: File, qIndex: number) => {
//     const isImage = file.type?.startsWith("image/");
//     if (!isImage) {
//       Modal.error({ title: "ไฟล์ไม่ถูกต้อง", content: "กรุณาเลือกไฟล์รูปภาพเท่านั้น" });
//       return false;
//     }
//     const isLt5M = file.size / 1024 / 1024 < 5;
//     if (!isLt5M) {
//       Modal.error({ title: "ไฟล์ใหญ่เกินไป", content: "ไฟล์ต้องมีขนาดไม่เกิน 5MB" });
//       return false;
//     }
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const updated = [...questions];
//       updated[qIndex].question.picture = reader.result as string;
//       setQuestions(updated);
//     };
//     reader.readAsDataURL(file);
//     return false;
//   };

//   const handlePreview = (image: string) => {
//     setPreviewImage(image);
//     setPreviewVisible(true);
//   };
//   const handleRemoveImage = (qIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].question.picture = null;
//     setQuestions(updated);
//   };

// const handleSubmit = async () => {
//   if (submitting) return;

//   // validate
//   const cleaned = questions.map((q) => ({
//     question: q.question,
//     answers: q.answers.filter((a) => a.description.trim() !== ""),
//   }));

//   for (const [index, q] of cleaned.entries()) {
//     if (!q.question.nameQuestion.trim()) {
//       Modal.warning({
//         title: "ข้อมูลไม่ครบ",
//         content: `กรุณากรอกคำถามที่ ${index + 1}`,
//       });
//       return;
//     }
//     if (q.answers.length === 0) {
//       Modal.warning({
//         title: "ข้อมูลไม่ครบ",
//         content: `กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${index + 1}`,
//       });
//       return;
//     }

//     // ✅ เช็คว่ามี answer ไหนที่ยังไม่ได้เลือก emotion
//     for (const [aIndex, a] of q.answers.entries()) {
//       if (!a.EmotionChoiceID || a.EmotionChoiceID === 0) {
//         Modal.warning({
//           title: "ข้อมูลไม่ครบ",
//           content: `กรุณาเลือกอารมณ์สำหรับคำตอบที่ ${aIndex + 1} ของคำถามที่ ${index + 1}`,
//         });
//         return;
//       }
//     }
//   }

//   try {
//     setSubmitting(true);
//     await createQuestions(cleaned);
//     console.log("🎯 Questions created successfully:", cleaned);
//     setIsEditSuccessModalVisible(true);
//   } catch (error) {
//     console.error("Error creating questions:", error);
//     Modal.error({
//       title: "บันทึกไม่สำเร็จ",
//       content: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
//     });
//   } finally {
//     setSubmitting(false);
//   }
// };


//   const apiUrl = import.meta.env.VITE_API_URL as string;

//   const joinUrl = (base: string, path: string): string => {
//     return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
//   };

//   const buildImageSrc = (picture: string): string => {
//     if (/^https?:\/\//i.test(picture)) return picture;
//     if (/^\/?images\/emotion_choice\//i.test(picture)) {
//       return joinUrl(apiUrl, picture);
//     }
//     return joinUrl(apiUrl, `images/emotion_choice/${picture}`);
//   };


//   const [emotionChoices, setEmotionChoices] = useState<EmotionChoice[]>([]);
//   useEffect(() => {
//   const fetchEmotionChoices = async () => {
//     const data = await getAllEmotionChoices();
//     console.log("🎯 Emotion Choices from API:", data);
//     setEmotionChoices(data);
//     console.log(data)

//   };

//   fetchEmotionChoices();
// }, []);


//   return (
//     <div className="form-step-question-container">
//       <div className="form-step-question-box">
//         <h2
//           className="questionnaire-page-title"
//           style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", fontWeight: 700, marginBottom:"24px"}}
//         >
//           <img src={manageQuestionAndAnswerIcon} alt="manage icon" style={{ width: 65, height: 65, objectFit: "contain" }} />
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
//                         <Draggable key={`question-${qIndex}`} draggableId={`question-${qIndex}`} index={qIndex}>
//                             {(provided) => (
//                                 <div
//                                     ref={provided.innerRef}
//                                     {...provided.draggableProps}
//                                     style={{
//                                         marginBottom: 16,
//                                         borderRadius: 12,
//                                         overflow: "hidden",
//                                         ...provided.draggableProps.style,
//                                     }}
//                                 >
//                                     <Collapse
//                                         activeKey={activeKeys}
//                                         bordered={false}
//                                         style={{
//                                             background: backgroundPatterns[qIndex % backgroundPatterns.length],
//                                             borderRadius: 12,
//                                         }}
//                                     >
//                                         <Panel
//                                             header={
//                                                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                                                         <img
//                                                             src={questionIcon}
//                                                             alt="question"
//                                                             style={{ width: 24, height: 24, objectFit: "contain" }}
//                                                         />
//                                                         <span style={{ fontSize: 16, fontWeight: 600 }}>คำถามข้อที่ {qIndex + 1}</span>
//                                                     </div>
//                                                     <Tag
//                                                         color="black"
//                                                         style={{
//                                                             marginLeft: "16px",
//                                                             fontSize: "16px",
//                                                             height: "30px",
//                                                             display: "flex",
//                                                             justifyContent: "center",
//                                                             alignItems: "center",
//                                                             padding: "0 10px",
//                                                             borderRadius: "6px",
//                                                             color: "#fff",
//                                                         }}
//                                                     >
//                                                         ลำดับข้อ : {q.question.priority}
//                                                     </Tag>
//                                                 </div>
//                                             }
//                                             key={panelKey}
//                                             extra={
//                                                 <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//                                                     <Button
//                                                         type="text"
//                                                         icon={
//                                                             activeKeys.includes(panelKey) ? <MinusSquareOutlined /> : <PlusSquareOutlined />
//                                                         }
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             togglePanel(panelKey);
//                                                         }}
//                                                     />
//                                                     <div
//                                                         {...provided.dragHandleProps}
//                                                         style={{ cursor: "grab", fontSize: 18, color: "#444" }}
//                                                         title="ลากเพื่อเปลี่ยนลำดับ"
//                                                     >
//                                                         <MenuOutlined />
//                                                     </div>
//                                                 </div>
//                                             }
//                                         >
//                                             <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
//                                                 <div style={{ flex: 7, display: "flex", flexDirection: "column", gap: "12px" }}>
//                                                     <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
//                                                         <label style={{ fontSize: "16px", fontWeight: "bold", marginRight: "8px" }}>
//                                                             คำถาม:
//                                                         </label>
//                                                         <Input
//                                                             value={q.question.nameQuestion}
//                                                             onChange={(e) => updateQuestionText(qIndex, e.target.value)}
//                                                             style={{ flex: 1 }}
//                                                         />
//                                                     </div>

//                                                     <div
//                                                         style={{
//                                                             display: "flex",
//                                                             alignItems: "center",
//                                                             fontSize: "16px",
//                                                             fontWeight: 600,
//                                                             marginBottom: 8,
//                                                         }}
//                                                     >
//                                                         <span style={{ width: "60%" }}>ตัวเลือกคำตอบ</span>
//                                                         <span style={{ width: "15%", marginLeft: "-50px" }}>คะแนน</span>
//                                                         <span style={{ width: "15%" }}></span>
//                                                     </div>

//                                                     {q.answers.map((a, aIndex) => (
//                                                         <div key={aIndex} style={{ display: "flex", gap: "8px", marginBottom: 8 }}>
//                                                             <Input
//                                                                 placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                                                                 value={a.description}
//                                                                 onChange={(e) =>
//                                                                     updateAnswer(qIndex, aIndex, "description", e.target.value)
//                                                                 }
//                                                                 style={{ width: "60%" }}
//                                                             />
//                                                             <InputNumber
//                                                                 placeholder="คะแนน"
//                                                                 value={a.point}
//                                                                 onChange={(value) => updateAnswer(qIndex, aIndex, "point", value || 0)}
//                                                                 style={{ width: "20%" }}
//                                                                 min={0}
//                                                             />
//                                                             {/* Dropdown for each answer */}
//                                                             <Select
//                                                                 style={{ width: "15%" }}
//                                                                 placeholder="เลือกอารมณ์"
//                                                                 value={a.EmotionChoiceID || undefined}
//                                                                 onChange={(value) => {
//                                                                     const updated = [...questions];
//                                                                     updated[qIndex].answers[aIndex].EmotionChoiceID = value;
//                                                                     setQuestions(updated);
//                                                                 }}
//                                                                 optionLabelProp="label"
//                                                             >
//                                                                 {emotionChoices.map((choice) => (
//                                                                     <Select.Option key={choice.id} value={choice.id} label={choice.name}>
//                                                                         <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                                                                             <img
//                                                                                 src={buildImageSrc(choice.picture)}
//                                                                                 alt={choice.name}
//                                                                                 style={{
//                                                                                     width: 24,
//                                                                                     height: 24,
//                                                                                     objectFit: "cover",
//                                                                                     borderRadius: "50%",
//                                                                                 }}
//                                                                             />
//                                                                             <span>{choice.name}</span>
//                                                                         </div>
//                                                                     </Select.Option>
//                                                                 ))}
//                                                             </Select>

//                                                             <Button
//                                                                 danger
//                                                                 icon={<DeleteOutlined />}
//                                                                 onClick={() => removeAnswer(qIndex, aIndex)}
//                                                                 style={{ width: "10%" }}
//                                                             />
//                                                         </div>
//                                                     ))}

//                                                     <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
//                                                         + เพิ่มตัวเลือก
//                                                     </Button>

//                                                     {/* อัปโหลดรูปภาพ */}
//                                                     <Form.Item
//                                                         label={
//                                                             <span style={{ fontSize: "16px", fontWeight: "bold" }}>อัปโหลดรูป (ถ้ามี)</span>
//                                                         }
//                                                         style={{ width: "100%" }}
//                                                     >
//                                                         {!q.question.picture ? (
//                                                             <div className="question-panel-right">
//                                                                 <div className="full-upload">
//                                                                     <Upload
//                                                                         listType="picture-card"
//                                                                         style={{ width: "450px", height: "300px" }}
//                                                                         beforeUpload={(file) => handleImageUpload(file, qIndex)}
//                                                                         fileList={
//                                                                             q.question.picture
//                                                                                 ? [
//                                                                                       {
//                                                                                           uid: "-1",
//                                                                                           name: "image.png",
//                                                                                           status: "done" as const,
//                                                                                           url: q.question.picture,
//                                                                                       },
//                                                                                   ]
//                                                                                 : []
//                                                                         }
//                                                                         onPreview={() => handlePreview(q.question.picture!)}
//                                                                         onRemove={() => handleRemoveImage(qIndex)}
//                                                                     >
//                                                                         {!q.question.picture && (
//                                                                             <div>
//                                                                                 <UploadOutlined />
//                                                                                 <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
//                                                                             </div>
//                                                                         )}
//                                                                     </Upload>
//                                                                 </div>
//                                                             </div>
//                                                         ) : (
//                                                             <div style={{ position: "relative", display: "inline-block" }}>
//                                                                 <img
//                                                                     src={q.question.picture}
//                                                                     alt="Preview"
//                                                                     style={{ maxWidth: "450px", maxHeight: "340px", borderRadius: "12px" }}
//                                                                     onClick={() => handlePreview(q.question.picture!)}
//                                                                 />
//                                                                 <div
//                                                                     style={{
//                                                                         display: "flex",
//                                                                         gap: "10px",
//                                                                         position: "absolute",
//                                                                         top: "50%",
//                                                                         left: "50%",
//                                                                         transform: "translate(-50%, -50%)",
//                                                                         zIndex: 10,
//                                                                     }}
//                                                                 >
//                                                                     <Button
//                                                                         icon={<EyeOutlined />}
//                                                                         onClick={() => handlePreview(q.question.picture!)}
//                                                                         type="text"
//                                                                         style={{
//                                                                             color: "#ffffff",
//                                                                             backgroundColor: "rgba(0, 0, 0, 0.5)",
//                                                                             borderRadius: "50%",
//                                                                             padding: "5px",
//                                                                         }}
//                                                                     />
//                                                                     <Button
//                                                                         icon={<DeleteOutlined />}
//                                                                         onClick={() => handleRemoveImage(qIndex)}
//                                                                         type="text"
//                                                                         danger
//                                                                         style={{
//                                                                             color: "#ffffff",
//                                                                             backgroundColor: "rgba(0, 0, 0, 0.5)",
//                                                                             borderRadius: "50%",
//                                                                             padding: "5px",
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </Form.Item>
//                                                 </div>
//                                             </div>
//                                         </Panel>
//                                     </Collapse>
//                                 </div>
//                             )}
//                         </Draggable>
//                     );
//                   })}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>

//           <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
//             <Button type="primary" onClick={handleSubmit} loading={submitting} style={{ padding: "8px 16px", fontWeight: 600 }}>
//               บันทึกคำถามและคำตอบทั้งหมด
//             </Button>
//           </div>
//         </Form>
//       </div>

//       {/* Preview Modal */}
//       <Modal open={previewVisible} footer={null} centered onCancel={() => setPreviewVisible(false)} style={{ maxWidth: "90vw", padding: 0 }} bodyStyle={{ padding: 0 }} width="auto">
//         <img
//           alt="Preview"
//           style={{ maxWidth: "90vw", maxHeight: "80vh", display: "block", margin: "0 auto", objectFit: "contain", borderRadius: "12px" }}
//           src={previewImage!}
//         />
//       </Modal>

//       {/* Success Modal */}
//       <Modal
//         title="สร้างแบบทดสอบเรียบร้อยแล้ว"
//         open={isEditSuccessModalVisible}
//         onOk={() => {
//           setIsEditSuccessModalVisible(false);
//           navigate("/admin/questionnairePage", {
//             state: { flash: { type: "success", content: "บันทึกข้อมูลแบบทดสอบลงฐานข้อมูลเรียบร้อยแล้ว!" } },
//           });
//         }}
//         onCancel={() => setIsEditSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//       >
//         <p style={{ textAlign: "center" }}>บันทึกข้อมูลเแบบทดสอบเรียบร้อยแล้ว!</p>
//       </Modal>
//     </div>
//   );
// };

// export default FormStepQuestion;


import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, Modal, Tag, Collapse, Upload, Select } from "antd";
import { DeleteOutlined, MenuOutlined, MinusSquareOutlined, PlusSquareOutlined, UploadOutlined, EyeOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { EmotionChoice } from "../../../../interfaces/IEmotionChoices";
import { createQuestions,getAllEmotionChoices } from "../../../../services/https/questionnaire";
import "./fromStepQuestion.css";
import questionIcon from "../../../../assets/question-mark.png";
import manageQuestionAndAnswerIcon from "../../../../assets/manageQuestionAndAnswer.png";

const { Panel } = Collapse;

interface QuestionWithAnswers {
  question: Question & { priority: number };
  answers: AnswerOption[];
}

const backgroundPatterns = [
  "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
  "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)",
  "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
  "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
  "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
];

const FormStepQuestion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questionnaireId = (location.state as any)?.questionnaireId;
  const quantity = (location.state as any)?.quantity || 3;

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!questionnaireId) {
      Modal.warning({
        title: "ไม่พบข้อมูลแบบทดสอบ",
        content: "กรุณาสร้างแบบทดสอบก่อน",
        onOk: () => navigate("/admin/forminfo"),
      });
      return;
    }
    const init: QuestionWithAnswers[] = Array.from({ length: quantity }, (_, i) => ({
      question: { id: 0, nameQuestion: "", quID: questionnaireId, priority: i + 1, picture: null },
      answers: Array.from({ length: 4 }, (_, aIndex) => ({ id: aIndex, description: "", point: 0, EmotionChoiceID: 0 })), 
    }));
    setQuestions(init);
    setActiveKeys(init.map((_, i) => i.toString()));
  }, [questionnaireId, quantity, navigate]);

  const togglePanel = (key: string) =>
    setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
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
    if (field === "description") updated[qIndex].answers[aIndex].description = value as string;
    else updated[qIndex].answers[aIndex].point = value as number;
    setQuestions(updated);
  };

  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ id: updated[qIndex].answers.length, description: "", point: 0, EmotionChoiceID: 0 });
    setQuestions(updated);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(aIndex, 1);
    setQuestions(updated);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    const updated = reordered.map((q, index) => ({ ...q, question: { ...q.question, priority: index + 1 } }));
    setQuestions(updated);
  };

  const handleImageUpload = (file: File, qIndex: number) => {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      Modal.error({ title: "ไฟล์ไม่ถูกต้อง", content: "กรุณาเลือกไฟล์รูปภาพเท่านั้น" });
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      Modal.error({ title: "ไฟล์ใหญ่เกินไป", content: "ไฟล์ต้องมีขนาดไม่เกิน 5MB" });
      return false;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...questions];
      updated[qIndex].question.picture = reader.result as string;
      setQuestions(updated);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };
  const handleRemoveImage = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].question.picture = null;
    setQuestions(updated);
  };

const handleSubmit = async () => {
  if (submitting) return;

  // validate
  const cleaned = questions.map((q) => ({
    question: q.question,
    answers: q.answers.filter((a) => a.description.trim() !== ""),
  }));

  for (const [index, q] of cleaned.entries()) {
    if (!q.question.nameQuestion.trim()) {
      Modal.warning({
        title: "ข้อมูลไม่ครบ",
        content: `กรุณากรอกคำถามที่ ${index + 1}`,
      });
      return;
    }
    if (q.answers.length === 0) {
      Modal.warning({
        title: "ข้อมูลไม่ครบ",
        content: `กรุณากรอกอย่างน้อย 1 ตัวเลือกในคำถามที่ ${index + 1}`,
      });
      return;
    }

    // ✅ เช็คว่ามี answer ไหนที่ยังไม่ได้เลือก emotion
    for (const [aIndex, a] of q.answers.entries()) {
      if (!a.EmotionChoiceID || a.EmotionChoiceID === 0) {
        Modal.warning({
          title: "ข้อมูลไม่ครบ",
          content: `กรุณาเลือกอารมณ์สำหรับคำตอบที่ ${aIndex + 1} ของคำถามที่ ${index + 1}`,
        });
        return;
      }
    }
  }

  try {
    setSubmitting(true);
    await createQuestions(cleaned);
    console.log("🎯 Questions created successfully:", cleaned);
    setIsEditSuccessModalVisible(true);
  } catch (error) {
    console.error("Error creating questions:", error);
    Modal.error({
      title: "บันทึกไม่สำเร็จ",
      content: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
    });
  } finally {
    setSubmitting(false);
  }
};


  const apiUrl = import.meta.env.VITE_API_URL as string;

  const joinUrl = (base: string, path: string): string => {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const buildImageSrc = (picture: string): string => {
    if (/^https?:\/\//i.test(picture)) return picture;
    if (/^\/?images\/emotion_choice\//i.test(picture)) {
      return joinUrl(apiUrl, picture);
    }
    return joinUrl(apiUrl, `images/emotion_choice/${picture}`);
  };


  const [emotionChoices, setEmotionChoices] = useState<EmotionChoice[]>([]);
  useEffect(() => {
  const fetchEmotionChoices = async () => {
    const data = await getAllEmotionChoices();
    console.log("🎯 Emotion Choices from API:", data);
    setEmotionChoices(data);
    console.log(data)

  };

  fetchEmotionChoices();
}, []);


  return (
    <div className="form-step-question-container">
      <div className="form-step-question-box">
        <h2
          className="questionnaire-page-title"
          style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", fontWeight: 700, marginBottom:"24px"}}
        >
          <img src={manageQuestionAndAnswerIcon} alt="manage icon" style={{ width: 65, height: 65, objectFit: "contain" }} />
          จัดการรายละเอียดคำถามและคำตอบ
        </h2>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button onClick={expandAll} style={{ marginRight: 8 }}>
            ขยายทั้งหมด
          </Button>
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
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                        marginBottom: 16,
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        ...provided.draggableProps.style,
                                    }}
                                >
                                    <Collapse
                                        activeKey={activeKeys}
                                        bordered={false}
                                        style={{
                                            background: backgroundPatterns[qIndex % backgroundPatterns.length],
                                            borderRadius: 12,
                                        }}
                                    >
                                        <Panel
                                            header={
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <img
                                                            src={questionIcon}
                                                            alt="question"
                                                            style={{ width: 24, height: 24, objectFit: "contain" }}
                                                        />
                                                        <span style={{ fontSize: 16, fontWeight: 600 }}>คำถามข้อที่ {qIndex + 1}</span>
                                                    </div>
                                                    <Tag
                                                        color="black"
                                                        style={{
                                                            marginLeft: "16px",
                                                            fontSize: "16px",
                                                            height: "30px",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            padding: "0 10px",
                                                            borderRadius: "6px",
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        ลำดับข้อ : {q.question.priority}
                                                    </Tag>
                                                </div>
                                            }
                                            key={panelKey}
                                            extra={
                                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                    <Button
                                                        type="text"
                                                        icon={
                                                            activeKeys.includes(panelKey) ? <MinusSquareOutlined /> : <PlusSquareOutlined />
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePanel(panelKey);
                                                        }}
                                                    />
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        style={{ cursor: "grab", fontSize: 18, color: "#444" }}
                                                        title="ลากเพื่อเปลี่ยนลำดับ"
                                                    >
                                                        <MenuOutlined />
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                                <div style={{ flex: 7, display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                                                        <label style={{ fontSize: "16px", fontWeight: "bold", marginRight: "8px" }}>
                                                            คำถาม:
                                                        </label>
                                                        <Input
                                                            value={q.question.nameQuestion}
                                                            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                                            style={{ flex: 1 }}
                                                        />
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            fontSize: "16px",
                                                            fontWeight: 600,
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        <span style={{ width: "60%" }}>ตัวเลือกคำตอบ</span>
                                                        <span style={{ width: "15%", marginLeft: "-50px" }}>คะแนน</span>
                                                        <span style={{ width: "15%" }}></span>
                                                    </div>

                                                    {q.answers.map((a, aIndex) => (
                                                        <div key={aIndex} style={{ display: "flex", gap: "8px", marginBottom: 8 }}>
                                                            <Input
                                                                placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
                                                                value={a.description}
                                                                onChange={(e) =>
                                                                    updateAnswer(qIndex, aIndex, "description", e.target.value)
                                                                }
                                                                style={{ width: "60%" }}
                                                            />
                                                            <InputNumber
                                                                placeholder="คะแนน"
                                                                value={a.point}
                                                                onChange={(value) => updateAnswer(qIndex, aIndex, "point", value || 0)}
                                                                style={{ width: "20%" }}
                                                                min={0}
                                                            />
                                                            {/* Dropdown for each answer */}
                                                            <Select
                                                                style={{ width: "15%" }}
                                                                placeholder="เลือกอารมณ์"
                                                                value={a.EmotionChoiceID || undefined}
                                                                onChange={(value) => {
                                                                    const updated = [...questions];
                                                                    updated[qIndex].answers[aIndex].EmotionChoiceID = value;
                                                                    setQuestions(updated);
                                                                }}
                                                                optionLabelProp="label"
                                                            >
                                                                {emotionChoices.map((choice) => (
                                                                    <Select.Option key={choice.id} value={choice.id} label={choice.name}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                            <img
                                                                                src={buildImageSrc(choice.picture)}
                                                                                alt={choice.name}
                                                                                style={{
                                                                                    width: 24,
                                                                                    height: 24,
                                                                                    objectFit: "cover",
                                                                                    borderRadius: "50%",
                                                                                }}
                                                                            />
                                                                            <span>{choice.name}</span>
                                                                        </div>
                                                                    </Select.Option>
                                                                ))}
                                                            </Select>

                                                            <Button
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => removeAnswer(qIndex, aIndex)}
                                                                style={{ width: "10%" }}
                                                            />
                                                        </div>
                                                    ))}

                                                    <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
                                                        + เพิ่มตัวเลือก
                                                    </Button>

                                                    {/* อัปโหลดรูปภาพ */}
                                                    <Form.Item
                                                        label={
                                                            <span style={{ fontSize: "16px", fontWeight: "bold" }}>อัปโหลดรูป (ถ้ามี)</span>
                                                        }
                                                        style={{ width: "100%" }}
                                                    >
                                                        {!q.question.picture ? (
                                                            <div className="question-panel-right">
                                                                <div className="full-upload">
                                                                    <Upload
                                                                        listType="picture-card"
                                                                        style={{ width: "450px", height: "300px" }}
                                                                        beforeUpload={(file) => handleImageUpload(file, qIndex)}
                                                                        fileList={
                                                                            q.question.picture
                                                                                ? [
                                                                                      {
                                                                                          uid: "-1",
                                                                                          name: "image.png",
                                                                                          status: "done" as const,
                                                                                          url: q.question.picture,
                                                                                      },
                                                                                  ]
                                                                                : []
                                                                        }
                                                                        onPreview={() => handlePreview(q.question.picture!)}
                                                                        onRemove={() => handleRemoveImage(qIndex)}
                                                                    >
                                                                        {!q.question.picture && (
                                                                            <div>
                                                                                <UploadOutlined />
                                                                                <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
                                                                            </div>
                                                                        )}
                                                                    </Upload>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                                <img
                                                                    src={q.question.picture}
                                                                    alt="Preview"
                                                                    style={{ maxWidth: "450px", maxHeight: "340px", borderRadius: "12px" }}
                                                                    onClick={() => handlePreview(q.question.picture!)}
                                                                />
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        gap: "10px",
                                                                        position: "absolute",
                                                                        top: "50%",
                                                                        left: "50%",
                                                                        transform: "translate(-50%, -50%)",
                                                                        zIndex: 10,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        icon={<EyeOutlined />}
                                                                        onClick={() => handlePreview(q.question.picture!)}
                                                                        type="text"
                                                                        style={{
                                                                            color: "#ffffff",
                                                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                                            borderRadius: "50%",
                                                                            padding: "5px",
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => handleRemoveImage(qIndex)}
                                                                        type="text"
                                                                        danger
                                                                        style={{
                                                                            color: "#ffffff",
                                                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                                            borderRadius: "50%",
                                                                            padding: "5px",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        </Panel>
                                    </Collapse>
                                </div>
                            )}
                        </Draggable>
                    );
                  })}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" onClick={handleSubmit} loading={submitting} style={{ padding: "8px 16px", fontWeight: 600 }}>
              บันทึกคำถามและคำตอบทั้งหมด
            </Button>
          </div>
        </Form>
      </div>

      {/* Preview Modal */}
      <Modal open={previewVisible} footer={null} centered onCancel={() => setPreviewVisible(false)} style={{ maxWidth: "90vw", padding: 0 }} bodyStyle={{ padding: 0 }} width="auto">
        <img
          alt="Preview"
          style={{ maxWidth: "90vw", maxHeight: "80vh", display: "block", margin: "0 auto", objectFit: "contain", borderRadius: "12px" }}
          src={previewImage!}
        />
      </Modal>

      {/* Success Modal */}
      <Modal
  title="สร้างแบบทดสอบเรียบร้อยแล้ว"
  open={isEditSuccessModalVisible}
  onOk={() => {
    setIsEditSuccessModalVisible(false);
    navigate("/admin/createCriteriaPage", {
      state: {
        // flash: {
        //   type: "success",
        //   content: "บันทึกข้อมูลแบบทดสอบลงฐานข้อมูลเรียบร้อยแล้ว!"
        // },
        questionnaireId, // ส่ง questionnaireId ไปหน้าต่อไป
      },
    });
  }}
  onCancel={() => setIsEditSuccessModalVisible(false)}
  okText="ตกลง"
  centered
>
  <p style={{ textAlign: "center" }}>บันทึกข้อมูลแบบทดสอบเรียบร้อยแล้ว!</p>
  <p style={{ textAlign: "center",color: "#cf1322" }}>ต่อไปสร้างจัดการเกณฑ์การประเมิน</p>
</Modal>
    </div>
  );
};

export default FormStepQuestion;


