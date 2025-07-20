
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Button,
//   Divider,
//   Form,
//   Input,
//   InputNumber,
//   Modal,
//   Space,
//   Tag,
// } from "antd";
// import { DeleteOutlined, MenuOutlined } from "@ant-design/icons";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "@hello-pangea/dnd";
// import { Question } from "../../../../interfaces/IQuestion";
// import { AnswerOption } from "../../../../interfaces/IAnswerOption";
// import { createQuestions } from "../../../../services/https/questionnaire";
// import "./fromStepQuestion.css";

// interface QuestionWithAnswers {
//   question: Question & { priority: number };
//   answers: AnswerOption[];
// }

// const FormStepQuestion: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const questionnaireId = location.state?.questionnaireId;
//   const quantity = location.state?.quantity || 3;

//   const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);

//   // ✅ สร้าง question พร้อม priority เริ่มต้น
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
//         },
//         answers: Array.from({ length: 4 }, () => ({ description: "", point: 0 })),
//       }));
//       setQuestions(init);
//     }
//   }, [questionnaireId]);

//   // ✅ อัปเดตคำถาม
//   const updateQuestionText = (qIndex: number, value: string) => {
//     const updated = [...questions];
//     updated[qIndex].question.nameQuestion = value;
//     setQuestions(updated);
//   };

//   // ✅ อัปเดตคำตอบ
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

//   // ✅ เมื่อ Drag & Drop เสร็จ → อัปเดต priority ใหม่
//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;

//     const reordered = Array.from(questions);
//     const [movedItem] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, movedItem);

//     // อัปเดต priority ให้ตรงกับตำแหน่งใหม่
//     const updated = reordered.map((q, index) => ({
//       ...q,
//       question: { ...q.question, priority: index + 1 },
//     }));

//     setQuestions(updated);
//   };

//   // ✅ บันทึกคำถาม
//   const handleSubmit = async () => {
//     const cleanedQuestions = questions.map((q) => ({
//       question: q.question,
//       answers: q.answers.filter((a) => a.description.trim() !== ""),
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
//         <Form layout="vertical">
//           <DragDropContext onDragEnd={handleDragEnd}>
//             <Droppable droppableId="question-list">
//               {(provided) => (
//                 <div {...provided.droppableProps} ref={provided.innerRef}>
//                   {questions.map((q, qIndex) => (
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
//                             marginBottom: 48,
//                             background: "#fff",
//                             padding: 16,
//                             borderRadius: 8,
//                             boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
//                             position: "relative",
//                             ...provided.draggableProps.style,
//                           }}
//                         >
//                           {/* Drag handle */}
//                           <div
//                             {...provided.dragHandleProps}
//                             style={{
//                               position: "absolute",
//                               top: 16,
//                               right: 16,
//                               cursor: "grab",
//                               fontSize: 20,
//                               color: "#888",
//                             }}
//                             title="ลากเพื่อเปลี่ยนลำดับ"
//                           >
//                             <MenuOutlined />
//                           </div>

//                           {/* คำถาม + Priority */}
//                           <h3 className="form-step-question-title">
//                             คำถาม (QUESTION) ข้อที่ {qIndex + 1}
//                             <Tag color="blue" style={{ marginLeft: 8 }}>
//                               ลำดับ: {q.question.priority}
//                             </Tag>
//                           </h3>

//                           <Form.Item label="คำถาม" className="question-label-item">
//                             <Input
//                               value={q.question.nameQuestion}
//                               onChange={(e) => updateQuestionText(qIndex, e.target.value)}
//                               className="form-step-question-input"
//                             />
//                           </Form.Item>

//                           <Divider orientation="left">ตัวเลือกคำตอบพร้อมคะแนน</Divider>

//                           <div className="answers-list-wrapper">
//                             <Space direction="vertical" style={{ width: "100%" }}>
//                               {q.answers.map((a, aIndex) => (
//                                 <Space key={aIndex} style={{ display: "flex", width: "100%" }}>
//                                   <Input
//                                     placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
//                                     value={a.description}
//                                     onChange={(e) =>
//                                       updateAnswer(qIndex, aIndex, "description", e.target.value)
//                                     }
//                                     className="form-step-answer-input"
//                                   />
//                                   <InputNumber
//                                     placeholder="คะแนน"
//                                     value={a.point}
//                                     onChange={(value) =>
//                                       updateAnswer(qIndex, aIndex, "point", value || 0)
//                                     }
//                                     min={0}
//                                     className="form-step-score-input"
//                                   />
//                                   <Button
//                                     danger
//                                     icon={<DeleteOutlined />}
//                                     onClick={() => removeAnswer(qIndex, aIndex)}
//                                   />
//                                 </Space>
//                               ))}
//                             </Space>
//                           </div>

//                           <Button
//                             type="dashed"
//                             onClick={() => addAnswer(qIndex)}
//                             block
//                             className="form-step-add-btn"
//                           >
//                             + เพิ่มตัวเลือก
//                           </Button>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>

//           <div className="form-step-nav-btns">
//             <Button type="primary" onClick={handleSubmit}>
//               บันทึกคำถามเเละคำตอบทั้งหมด
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
//         <p style={{ textAlign: "center" }}>บันทึกข้อมูลคำถามเรียบร้อยแล้ว!</p>
//       </Modal>
//     </div>
//   );
// };

// export default FormStepQuestion;




import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Tag,
} from "antd";
import { DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { createQuestions } from "../../../../services/https/questionnaire";
import "./fromStepQuestion.css";

interface QuestionWithAnswers {
  question: Question & { priority: number };
  answers: AnswerOption[];
}

const FormStepQuestion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questionnaireId = location.state?.questionnaireId;
  const quantity = location.state?.quantity || 3;

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);

  // ✅ สร้าง question พร้อม priority เริ่มต้น
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
          priority: i + 1, // ✅ กำหนด priority เริ่มต้น
        },
        answers: Array.from({ length: 4 }, () => ({ description: "", point: 0 })),
      }));
      setQuestions(init);
    }
  }, [questionnaireId, quantity, navigate]);

  // ✅ อัปเดตข้อความคำถาม
  const updateQuestionText = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].question.nameQuestion = value;
    setQuestions(updated);
  };

  // ✅ อัปเดตคำตอบ
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

  // ✅ เพิ่มคำตอบ
  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({ description: "", point: 0 });
    setQuestions(updated);
  };

  // ✅ ลบคำตอบ
  const removeAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(aIndex, 1);
    setQuestions(updated);
  };

  // ✅ เมื่อ Drag & Drop เสร็จ → อัปเดต priority ใหม่ตามลำดับ
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(questions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    // ✅ อัปเดต priority ให้ตรงกับตำแหน่งใหม่
    const updated = reordered.map((q, index) => ({
      ...q,
      question: { ...q.question, priority: index + 1 },
    }));

    setQuestions(updated);
  };

  // ✅ บันทึกคำถาม + Priority
  const handleSubmit = async () => {
    const cleanedQuestions = questions.map((q) => ({
      question: q.question, // ✅ priority อยู่ใน object นี้
      answers: q.answers.filter((a) => a.description.trim() !== ""),
    }));

    // ตรวจสอบช่องว่าง
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
        <Form layout="vertical">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="question-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((q, qIndex) => (
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
                            marginBottom: 48,
                            background: "#fff",
                            padding: 16,
                            borderRadius: 8,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            position: "relative",
                            ...provided.draggableProps.style,
                          }}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            style={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              cursor: "grab",
                              fontSize: 20,
                              color: "#888",
                            }}
                            title="ลากเพื่อเปลี่ยนลำดับ"
                          >
                            <MenuOutlined />
                          </div>

                          {/* คำถาม + Priority */}
                          <h3 className="form-step-question-title">
                            คำถาม (QUESTION) ข้อที่ {qIndex + 1}
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              ลำดับ: {q.question.priority}
                            </Tag>
                          </h3>

                          <Form.Item label="คำถาม" className="question-label-item">
                            <Input
                              value={q.question.nameQuestion}
                              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                              className="form-step-question-input"
                            />
                          </Form.Item>

                          <Divider orientation="left">ตัวเลือกคำตอบพร้อมคะแนน</Divider>

                          <div className="answers-list-wrapper">
                            <Space direction="vertical" style={{ width: "100%" }}>
                              {q.answers.map((a, aIndex) => (
                                <Space key={aIndex} style={{ display: "flex", width: "100%" }}>
                                  <Input
                                    placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
                                    value={a.description}
                                    onChange={(e) =>
                                      updateAnswer(qIndex, aIndex, "description", e.target.value)
                                    }
                                    className="form-step-answer-input"
                                  />
                                  <InputNumber
                                    placeholder="คะแนน"
                                    value={a.point}
                                    onChange={(value) =>
                                      updateAnswer(qIndex, aIndex, "point", value || 0)
                                    }
                                    min={0}
                                    className="form-step-score-input"
                                  />
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeAnswer(qIndex, aIndex)}
                                  />
                                </Space>
                              ))}
                            </Space>
                          </div>

                          <Button
                            type="dashed"
                            onClick={() => addAnswer(qIndex)}
                            block
                            className="form-step-add-btn"
                          >
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

          <div className="form-step-nav-btns">
            <Button type="primary" onClick={handleSubmit}>
              บันทึกคำถามและคำตอบทั้งหมด
            </Button>
          </div>
        </Form>
      </div>

      <Modal
        title="สร้างคำถามเรียบร้อยแล้ว"
        open={isEditSuccessModalVisible}
        onOk={() => {
          setIsEditSuccessModalVisible(false);
          navigate("/admin/questionnairePage");
        }}
        onCancel={() => setIsEditSuccessModalVisible(false)}
        okText="ตกลง"
        centered
      >
        <p style={{ textAlign: "center" }}>บันทึกข้อมูลคำถามเรียบร้อยแล้ว!</p>
      </Modal>
    </div>
  );
};

export default FormStepQuestion;
