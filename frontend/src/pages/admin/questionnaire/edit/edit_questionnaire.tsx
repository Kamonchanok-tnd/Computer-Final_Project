// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   Divider,
//   Form,
//   Input,
//   InputNumber,
//   Space,
//   Tag,
//   Modal,
// } from "antd";
// import {
//   DeleteOutlined,
//   MenuOutlined,
//   PlusOutlined,
// } from "@ant-design/icons";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import {
//   getQuestionnaireById,
//   updateQuestionnaire,
// } from "../../../../services/https/questionnaire";
// import "./edit_Questionnaire.css";

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

// const EditQuestionnaire: React.FC = () => {
//   const [form] = Form.useForm();
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [successModal, setSuccessModal] = useState(false);

//   const questionnaireId = 1; // ✅ ใน production ให้ดึงจาก route params

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ✅ โหลดข้อมูลจาก API
//   const fetchData = async () => {
//     try {
//       const data = await getQuestionnaireById(questionnaireId);
//       form.setFieldsValue({
//         name: data.nameQuestionnaire,
//         description: data.description,
//       });

//       const formattedQuestions = (data.questions ?? []).map((q: any) => ({
//         id: q.id,
//         nameQuestion: q.nameQuestion,
//         priority: q.priority,
//         answers: q.answerOptions || [],
//       }));

//       setQuestions(formattedQuestions);
//     } catch (error) {
//       console.error("โหลดข้อมูลล้มเหลว:", error);
//     }
//   };

//   // ✅ แก้ไขข้อความคำถาม
//   const updateQuestionText = (index: number, value: string) => {
//     const updated = [...questions];
//     updated[index].nameQuestion = value;
//     setQuestions(updated);
//   };

//   // ✅ แก้ไขตัวเลือก (ใช้ Generic ตรวจ type)
//   const updateAnswer = <K extends keyof AnswerOption>(
//     qIndex: number,
//     aIndex: number,
//     field: K,
//     value: AnswerOption[K]
//   ) => {
//     const updated = [...questions];
//     updated[qIndex].answers[aIndex][field] = value;
//     setQuestions(updated);
//   };

//   // ✅ เพิ่มตัวเลือก
//   const addAnswer = (qIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.push({ description: "", point: 0 });
//     setQuestions(updated);
//   };

//   // ✅ ลบตัวเลือก
//   const removeAnswer = (qIndex: number, aIndex: number) => {
//     const updated = [...questions];
//     updated[qIndex].answers.splice(aIndex, 1);
//     setQuestions(updated);
//   };

//   // ✅ ลบคำถาม
//   const removeQuestion = (qIndex: number) => {
//     const updated = questions.filter((_, index) => index !== qIndex);
//     updated.forEach((q, i) => (q.priority = i + 1));
//     setQuestions(updated);
//   };

//   // ✅ เพิ่มคำถามใหม่
//   const addQuestion = () => {
//     const newQuestion: Question = {
//       nameQuestion: "",
//       priority: questions.length + 1,
//       answers: [{ description: "", point: 0 }],
//     };
//     setQuestions([...questions, newQuestion]);
//   };

//   // ✅ Drag & Drop
//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const reordered = Array.from(questions);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     reordered.forEach((q, i) => (q.priority = i + 1));
//     setQuestions(reordered);
//   };

//   // ✅ บันทึกทั้งหมด
//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       await updateQuestionnaire(questionnaireId, {
//         name: form.getFieldValue("name"),
//         description: form.getFieldValue("description"),
//         questions: questions.map((q) => ({
//           id: q.id,
//           nameQuestion: q.nameQuestion,
//           priority: q.priority,
//           answers: q.answers.map((a) => ({
//             id: a.id,
//             description: a.description,
//             point: a.point,
//           })),
//         })),
//       });
//       setSuccessModal(true);
//     } catch (error) {
//       console.error("บันทึกล้มเหลว:", error);
//       alert("บันทึกล้มเหลว กรุณาลองใหม่");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="edit-questionnaire-container">
//       <Form layout="vertical" form={form} className="questionnaire-form">
//         <h2>แก้ไขแบบทดสอบ</h2>
//         <Form.Item
//           name="name"
//           label="ชื่อแบบทดสอบ"
//           rules={[{ required: true }]}
//         >
//           <Input />
//         </Form.Item>
//         <Form.Item
//           name="description"
//           label="คำอธิบาย"
//           rules={[{ required: true }]}
//         >
//           <Input.TextArea rows={3} />
//         </Form.Item>
//         <Divider />

//         <DragDropContext onDragEnd={handleDragEnd}>
//           <Droppable droppableId="questions">
//             {(provided) => (
//               <div ref={provided.innerRef} {...provided.droppableProps}>
//                 {questions.map((q, qIndex) => (
//                   <Draggable
//                     key={q.id || qIndex}
//                     draggableId={`q-${qIndex}`}
//                     index={qIndex}
//                   >
//                     {(provided) => (
//                       <div
//                         className="question-card"
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         style={{ ...provided.draggableProps.style }}
//                       >
//                         {/* Drag handle */}
//                         <div
//                           className="drag-handle"
//                           {...provided.dragHandleProps}
//                         >
//                           <MenuOutlined />
//                         </div>

//                         {/* ปุ่มลบคำถาม */}
//                         <Button
//                           className="delete-question-btn"
//                           danger
//                           icon={<DeleteOutlined />}
//                           size="small"
//                           onClick={() => removeQuestion(qIndex)}
//                         />

//                         {/* คำถาม */}
//                         <h3>
//                           คำถาม {qIndex + 1}{" "}
//                           <Tag color="blue">ลำดับ {q.priority}</Tag>
//                         </h3>
//                         <Input
//                           placeholder="คำถาม"
//                           value={q.nameQuestion}
//                           onChange={(e) =>
//                             updateQuestionText(qIndex, e.target.value)
//                           }
//                         />
//                         <Divider />

//                         {/* ตัวเลือก */}
//                         <h4>ตัวเลือก</h4>
//                         {q.answers.map((a, aIndex) => (
//                           <Space
//                             key={aIndex}
//                             style={{ display: "flex", marginBottom: 8 }}
//                           >
//                             <Input
//                               value={a.description}
//                               placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                               onChange={(e) =>
//                                 updateAnswer(
//                                   qIndex,
//                                   aIndex,
//                                   "description",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                             <InputNumber
//                               value={a.point}
//                               min={0}
//                               onChange={(val) =>
//                                 updateAnswer(qIndex, aIndex, "point", val || 0)
//                               }
//                             />
//                             <Button
//                               danger
//                               icon={<DeleteOutlined />}
//                               onClick={() => removeAnswer(qIndex, aIndex)}
//                             />
//                           </Space>
//                         ))}
//                         <Button
//                           type="dashed"
//                           onClick={() => addAnswer(qIndex)}
//                           block
//                         >
//                           + เพิ่มตัวเลือก
//                         </Button>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>

//         {/* ปุ่มเพิ่มคำถามใหม่ */}
//         <Button
//           type="dashed"
//           icon={<PlusOutlined />}
//           onClick={addQuestion}
//           className="add-question-btn"
//         >
//           + เพิ่มคำถามใหม่
//         </Button>

//         <Button
//           type="primary"
//           onClick={handleSubmit}
//           loading={loading}
//           style={{ marginTop: 16 }}
//         >
//           บันทึกทั้งหมด
//         </Button>
//       </Form>

//       <Modal
//         open={successModal}
//         onOk={() => setSuccessModal(false)}
//         onCancel={() => setSuccessModal(false)}
//       >
//         <p>บันทึกสำเร็จ!</p>
//       </Modal>
//     </div>
//   );
// };

// export default EditQuestionnaire;


// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   Divider,
//   Form,
//   Input,
//   InputNumber,
//   Space,
//   Tag,
//   Modal,
// } from "antd";
// import {
//   DeleteOutlined,
//   MenuOutlined,
//   PlusOutlined,
// } from "@ant-design/icons";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import {
//   getQuestionnaireById,
//   updateQuestionnaire,
// } from "../../../../services/https/questionnaire";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./edit_Questionnaire.css";

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

// const EditQuestionnaire: React.FC = () => {
//   const [form] = Form.useForm();
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [successModal, setSuccessModal] = useState(false);

//   const location = useLocation();
//   const navigate = useNavigate();
//   const questionnaireId = location.state?.questionnaireId;

//   useEffect(() => {
//     if (!questionnaireId) return;
//     fetchData();
//   }, [questionnaireId]);

//   const fetchData = async () => {
//     try {
//       const data = await getQuestionnaireById(questionnaireId);
//       console.log("✅ ได้ข้อมูล:", data);
//       form.setFieldsValue({
//         name: data.nameQuestionnaire,
//         description: data.description,
//       });

//       const formattedQuestions = (data.questions ?? []).map((q: any) => ({
//         id: q.id,
//         nameQuestion: q.nameQuestion,
//         priority: q.priority,
//         answers: Array.isArray(q.answers)
//           ? q.answers
//           : Array.isArray(q.answerOptions)
//           ? q.answerOptions
//           : [],
//       }));

//       setQuestions(formattedQuestions);
//     } catch (error) {
//       console.error("โหลดข้อมูลล้มเหลว:", error);
//     }
//   };

//   const updateQuestionText = (index: number, value: string) => {
//     const updated = [...questions];
//     updated[index].nameQuestion = value;
//     setQuestions(updated);
//   };

//   const updateAnswer = <K extends keyof AnswerOption>(
//     qIndex: number,
//     aIndex: number,
//     field: K,
//     value: AnswerOption[K]
//   ) => {
//     const updated = [...questions];
//     updated[qIndex].answers[aIndex][field] = value;
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
//     // ลบคำถามและคำตอบทั้งหมดของคำถามนั้น
//     const updated = questions.filter((_, index) => index !== qIndex);

//     // อัปเดต priority ของคำถามที่เหลือ
//     updated.forEach((q, i) => {
//       q.priority = i + 1; // ตั้งค่า priority ใหม่ให้คำถามที่เหลือ
//     });

//     // อัปเดตจำนวนข้อคำถาม
//     const updatedQuestionCount = updated.length;
//     console.log(`จำนวนข้อคำถามที่เหลือ: ${updatedQuestionCount}`);

//     // ตั้งค่าใหม่ให้กับ questions หลังจากลบคำถาม
//     setQuestions(updated);

//     // ถ้าต้องการบันทึกจำนวนข้อคำถามที่เหลือใน backend
//     // updateQuestionnaire(questionnaireId, { questionsCount: updatedQuestionCount });
//   };

//   const addQuestion = () => {
//     const newQuestion: Question = {
//       nameQuestion: "",
//       priority: questions.length + 1,
//       answers: [{ description: "", point: 0 }],
//     };

//     const updatedQuestions = [...questions, newQuestion];

//     // อัปเดตจำนวนข้อคำถามที่เหลือ
//     const updatedQuestionCount = updatedQuestions.length;
//     console.log(`จำนวนข้อคำถามหลังเพิ่ม: ${updatedQuestionCount}`);

//     setQuestions(updatedQuestions);

//     // ถ้าต้องการบันทึกจำนวนข้อคำถามที่เหลือใน backend
//     // updateQuestionnaire(questionnaireId, { questionsCount: updatedQuestionCount });
//   };

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const reordered = Array.from(questions);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     reordered.forEach((q, i) => (q.priority = i + 1));
//     setQuestions(reordered);
//   };

//   const handleSubmit = async () => {
//     if (!questionnaireId) return;

//     setLoading(true);
//     try {
//       await updateQuestionnaire(questionnaireId, {
//         name: form.getFieldValue("name"),
//         description: form.getFieldValue("description"),
//         questions: questions.map((q) => ({
//           id: q.id,
//           nameQuestion: q.nameQuestion,
//           priority: q.priority,
//           answers: q.answers.map((a) => ({
//             id: a.id,
//             description: a.description,
//             point: a.point,
//           })),
//         })),
//       });
//       setSuccessModal(true);
//     } catch (error) {
//       console.error("บันทึกล้มเหลว:", error);
//       alert("บันทึกล้มเหลว กรุณาลองใหม่");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!questionnaireId) {
//     return <p style={{ padding: 20, color: "red" }}>ไม่พบแบบทดสอบ กรุณากลับไปหน้าเดิม</p>;
//   }

//   return (
//     <div className="edit-questionnaire-container">
//       <Form layout="vertical" form={form} className="questionnaire-form">
//         <h2>แก้ไขแบบทดสอบ</h2>
//         <Form.Item
//           name="name"
//           label="ชื่อแบบทดสอบ"
//           rules={[{ required: true }]}
//         >
//           <Input />
//         </Form.Item>
//         <Form.Item
//           name="description"
//           label="คำอธิบาย"
//           rules={[{ required: true }]}
//         >
//           <Input.TextArea rows={3} />
//         </Form.Item>
//         <Divider />

//         <DragDropContext onDragEnd={handleDragEnd}>
//           <Droppable droppableId="questions">
//             {(provided) => (
//               <div ref={provided.innerRef} {...provided.droppableProps}>
//                 {questions.map((q, qIndex) => (
//                   <Draggable
//                     key={q.id || qIndex}
//                     draggableId={`q-${qIndex}`}
//                     index={qIndex}
//                   >
//                     {(provided) => (
//                       <div
//                         className="question-card"
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         style={{ ...provided.draggableProps.style }}
//                       >
//                         <div className="drag-handle" {...provided.dragHandleProps}>
//                           <MenuOutlined />
//                         </div>

//                         <Button
//                           className="delete-question-btn"
//                           danger
//                           icon={<DeleteOutlined />}
//                           size="small"
//                           onClick={() => removeQuestion(qIndex)}
//                         />

//                         <h3>
//                           คำถาม {qIndex + 1} <Tag color="blue">ลำดับ {q.priority}</Tag>
//                         </h3>
//                         <Input
//                           placeholder="คำถาม"
//                           value={q.nameQuestion}
//                           onChange={(e) => updateQuestionText(qIndex, e.target.value)}
//                         />
//                         <Divider />

//                         <h4>ตัวเลือก</h4>
//                         {q.answers.map((a, aIndex) => (
//                           <Space key={aIndex} style={{ display: "flex", marginBottom: 8 }}>
//                             <Input
//                               value={a.description}
//                               placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                               onChange={(e) =>
//                                 updateAnswer(qIndex, aIndex, "description", e.target.value)
//                               }
//                             />
//                             <InputNumber
//                               value={a.point}
//                               min={0}
//                               onChange={(val) =>
//                                 updateAnswer(qIndex, aIndex, "point", val || 0)
//                               }
//                             />
//                             <Button
//                               danger
//                               icon={<DeleteOutlined />}
//                               onClick={() => removeAnswer(qIndex, aIndex)}
//                             />
//                           </Space>
//                         ))}
//                         <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
//                           + เพิ่มตัวเลือก
//                         </Button>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>

//         <Button
//           type="dashed"
//           icon={<PlusOutlined />}
//           onClick={addQuestion}
//           className="add-question-btn"
//         >
//           + เพิ่มคำถามใหม่
//         </Button>

//         <Button type="primary" onClick={handleSubmit} loading={loading} style={{ marginTop: 16 }}>
//           บันทึกทั้งหมด
//         </Button>
//       </Form>

//       <Modal
//         open={successModal}
//         onOk={() => {
//           setSuccessModal(false);
//           navigate("/admin/questionnairePage");
//         }}
//         onCancel={() => setSuccessModal(false)}
//       >
//         <p>บันทึกสำเร็จ!</p>
//       </Modal>
//     </div>
//   );
// };

// export default EditQuestionnaire;





import React, { useEffect, useState } from "react";
import { Button, Divider, Form, Input, InputNumber, Space, Tag, Modal } from "antd";
import { DeleteOutlined, MenuOutlined, PlusOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getQuestionnaireById, updateQuestionnaire } from "../../../../services/https/questionnaire";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteQuestion, deleteAnswer } from "../../../../services/https/questionnaire"; // Import delete functions from service
import "./edit_Questionnaire.css";

// Define types for AnswerOption and Question
interface AnswerOption {
  id?: number;
  description: string;
  point: number;
}

interface Question {
  id?: number;
  nameQuestion: string;
  priority: number;
  answers: AnswerOption[];
}

const EditQuestionnaire: React.FC = () => {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const questionnaireId = location.state?.questionnaireId;

  useEffect(() => {
    if (!questionnaireId) return;
    fetchData();
  }, [questionnaireId]);

  const fetchData = async () => {
    try {
      const data = await getQuestionnaireById(questionnaireId);
      console.log("✅ ได้ข้อมูล:", data);
      form.setFieldsValue({
        name: data.nameQuestionnaire,
        description: data.description,
      });

      const formattedQuestions = (data.questions ?? []).map((q: any) => ({
        id: q.id,
        nameQuestion: q.nameQuestion,
        priority: q.priority,
        answers: Array.isArray(q.answers)
          ? q.answers
          : Array.isArray(q.answerOptions)
          ? q.answerOptions
          : [],
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  const updateQuestionText = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].nameQuestion = value;
    setQuestions(updated);
  };

  const updateAnswer = <K extends keyof AnswerOption>(qIndex: number, aIndex: number, field: K, value: AnswerOption[K]) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex][field] = value;
    setQuestions(updated);
  };

  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ description: "", point: 0 });
    setQuestions(updated);
  };

  const removeAnswer = async (qIndex: number, aIndex: number) => {
    const answerId = questions[qIndex].answers[aIndex].id;
    if (answerId === undefined) {
      alert("Answer ID is undefined");
      return;
    }

    try {
      await deleteAnswer(answerId); // Call deleteAnswer to delete from backend

      // Remove answer from frontend
      const updated = [...questions];
      updated[qIndex].answers.splice(aIndex, 1); // Remove answer from array
      setQuestions(updated);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบคำตอบ", error);
      alert("เกิดข้อผิดพลาดในการลบคำตอบ");
    }
  };

  const removeQuestion = async (qIndex: number) => {
    const questionId = questions[qIndex].id;
    if (questionId === undefined) {
      alert("Question ID is undefined");
      return;
    }

    try {
      await deleteQuestion(questionId); // Call deleteQuestion to delete from backend

      const updated = questions.filter((_, index) => index !== qIndex);
      updated.forEach((q, i) => {
        q.priority = i + 1; // Reassign priority after removal
      });

      setQuestions(updated);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบคำถาม", error);
      alert("เกิดข้อผิดพลาดในการลบคำถาม");
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      nameQuestion: "",
      priority: questions.length + 1,
      answers: [{ description: "", point: 0 }],
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    reordered.forEach((q, i) => (q.priority = i + 1));
    setQuestions(reordered);
  };

  const handleSubmit = async () => {
    if (!questionnaireId) return;

    setLoading(true);
    try {
      await updateQuestionnaire(questionnaireId, {
        name: form.getFieldValue("name"),
        description: form.getFieldValue("description"),
        questions: questions.map((q) => ({
          id: q.id,
          nameQuestion: q.nameQuestion,
          priority: q.priority,
          answers: q.answers.map((a) => ({
            id: a.id,
            description: a.description,
            point: a.point,
          })),
        })),
      });
      setSuccessModal(true);
    } catch (error) {
      console.error("บันทึกล้มเหลว:", error);
      alert("บันทึกล้มเหลว กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  if (!questionnaireId) {
    return <p style={{ padding: 20, color: "red" }}>ไม่พบแบบทดสอบ กรุณากลับไปหน้าเดิม</p>;
  }

  return (
    <div className="edit-questionnaire-container">
      <Form layout="vertical" form={form} className="questionnaire-form">
        <h2>แก้ไขแบบทดสอบ</h2>
        <Form.Item name="name" label="ชื่อแบบทดสอบ" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="คำอธิบาย" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Divider />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {questions.map((q, qIndex) => (
                  <Draggable key={q.id || qIndex} draggableId={`q-${qIndex}`} index={qIndex}>
                    {(provided) => (
                      <div
                        className="question-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style }}
                      >
                        <div className="drag-handle" {...provided.dragHandleProps}>
                          <MenuOutlined />
                        </div>

                        <Button
                          className="delete-question-btn"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => removeQuestion(qIndex)}
                        />

                        <h3>
                          คำถาม {qIndex + 1} <Tag color="blue">ลำดับ {q.priority}</Tag>
                        </h3>
                        <Input
                          placeholder="คำถาม"
                          value={q.nameQuestion}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                        />
                        <Divider />

                        <h4>ตัวเลือก</h4>
                        {q.answers.map((a, aIndex) => (
                          <Space key={aIndex} style={{ display: "flex", marginBottom: 8 }}>
                            <Input
                              value={a.description}
                              placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
                              onChange={(e) =>
                                updateAnswer(qIndex, aIndex, "description", e.target.value)
                              }
                            />
                            <InputNumber
                              value={a.point}
                              min={0}
                              onChange={(val) =>
                                updateAnswer(qIndex, aIndex, "point", val || 0)
                              }
                            />
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeAnswer(qIndex, aIndex)} // ลบคำตอบ
                            />
                          </Space>
                        ))}
                        <Button type="dashed" onClick={() => addAnswer(qIndex)} block>
                          + เพิ่มตัวเลือก
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Button type="dashed" icon={<PlusOutlined />} onClick={addQuestion} className="add-question-btn">
          + เพิ่มคำถามใหม่
        </Button>

        <Button type="primary" onClick={handleSubmit} loading={loading} style={{ marginTop: 16 }}>
          บันทึกทั้งหมด
        </Button>
      </Form>

      <Modal
        open={successModal}
        onOk={() => {
          setSuccessModal(false);
          navigate("/admin/questionnairePage");
        }}
        onCancel={() => setSuccessModal(false)}
      >
        <p>บันทึกสำเร็จ!</p>
      </Modal>
    </div>
  );
};

export default EditQuestionnaire;
