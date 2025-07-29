import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, Modal, Tag, Collapse, Upload, message } from "antd";
import { DeleteOutlined, MenuOutlined, MinusSquareOutlined, PlusSquareOutlined, UploadOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getQuestionnaireById, updateQuestionnaire, deleteQuestion, deleteAnswer } from "../../../../services/https/questionnaire";
import "./edit_questionnaire.css";


import questionIcon from "../../../../assets/question-mark.png";

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

const backgroundPatterns: string[] = [
  "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
  "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)",
  "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
  "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
  "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)"
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
    setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const expandAll = () => setActiveKeys(questions.map((_, i) => i.toString()));
  const collapseAll = () => setActiveKeys([]);

  const updateQuestionText = (qIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].nameQuestion = value;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, field: "description" | "point", value: string | number) => {
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
    const updated = reordered.map((q, index) => ({ ...q, priority: index + 1 }));
    setQuestions(updated);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      nameQuestion: "",
      priority: questions.length + 1,
      picture: null,
      answers: Array.from({ length: 4 }, () => ({ description: "", point: 0 }))
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    setActiveKeys(updated.map((_, i) => i.toString()));
  };

  const handleSubmit = async () => {
    await updateQuestionnaire(questionnaireId, {
      name: form.getFieldValue("name"),
      description: form.getFieldValue("description"),
      questions: questions.map((q) => ({
        id: q.id,
        nameQuestion: q.nameQuestion,
        priority: q.priority,
        picture: q.picture,
        answers: q.answers.filter((a) => a.description.trim() !== "").map((a) => ({
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
        {/* ✅ หัวข้อใหญ่ตรงกลาง */}
        <h2 style={{ fontSize: 30, display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          แก้ไขรายละเอียดคำถามและคำตอบ
        </h2>

        <Form layout="vertical" form={form}>
          {/* ✅ ชื่อแบบทดสอบ */}
          <Form.Item label={<span style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>ชื่อแบบทดสอบ</span>}name="name">
           <Input />
          </Form.Item>

          {/* ✅ รายละเอียดแบบทดสอบ */}
          <Form.Item label={<span style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>รายละเอียดแบบทดสอบ</span>}name="description">
            <Input.TextArea rows={3} />
           </Form.Item>
          </Form>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button onClick={expandAll} style={{ marginRight: 8 }}>ขยายทั้งหมด</Button>
          <Button onClick={collapseAll}>ย่อทั้งหมด</Button>
        </div>

        {/* ✅ Drag & Drop Questions */}
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
                              header={
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <img src={questionIcon} alt="question-icon" style={{ width: 20, height: 20 }} />
                                    <span style={{fontSize: "16px", fontWeight: "bold"}}>คำถามข้อที่ {qIndex + 1}</span>
                                  </div><Tag color="black"style={{marginLeft: "16px", fontSize: "16px",height: "30px",display: "flex",justifyContent: "center",alignItems: "center",padding: "0 10px",borderRadius: "6px",color: "#fff"}}>ลำดับข้อ : {q.priority}</Tag></div>
                              }
                              key={panelKey}
                              extra={
                                <div className="panel-extra" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <Button
                                    type="text"
                                    icon={activeKeys.includes(panelKey) ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePanel(panelKey);
                                    }}
                                  />
                                  <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => {
                                    e.stopPropagation();
                                    removeQuestion(qIndex);
                                  }} />
                                  <div {...provided.dragHandleProps} className="drag-icon"><MenuOutlined /></div>
                                </div>
                              }
                            >
                              <div className="question-panel-content">
                                <div className="question-panel-left">
                                 <Form.Item label={<span style={{ fontSize: "16px", fontWeight: "bold" }}>คำถาม</span>}><Input value={q.nameQuestion}onChange={(e) => updateQuestionText(qIndex, e.target.value)}/></Form.Item>
                                  <div className="answers-header">
                                    <div className="answers-header-left">ตัวเลือกคำตอบ</div>
                                    <div className="answers-header-right">คะแนน</div>
                                    <div className="answers-header-empty"></div>
                                  </div>
                                  {q.answers.map((a, aIndex) => (
                                    <div key={aIndex} className="answer-row">
                                      <div className="answer-text">
                                        <Input placeholder={`ตัวเลือกที่ ${aIndex + 1}`} value={a.description} onChange={(e) => updateAnswer(qIndex, aIndex, "description", e.target.value)} />
                                      </div>
                                      <div className="answer-point">
                                        <InputNumber style={{ width: "100%" }} value={a.point} onChange={(value) => updateAnswer(qIndex, aIndex, "point", value || 0)} />
                                      </div>
                                      <div className="answer-delete">
                                        <Button danger icon={<DeleteOutlined />} onClick={() => removeAnswer(qIndex, aIndex)} />
                                      </div>
                                    </div>
                                  ))}
                                  <Button type="dashed" onClick={() => addAnswer(qIndex)} block>+ เพิ่มตัวเลือก</Button>
                                </div>

                                {/* ✅ Upload Image */}
                                <div className="question-panel-right">
                                  <div className="upload-label">อัปโหลดรูป (ถ้ามี)</div>
                                  <div className="full-upload">
                                    <Upload
                                      listType="picture-card"
                                      style={{ width: "450px", height: "280px" }}
                                      beforeUpload={(file) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const updated = [...questions];
                                          updated[qIndex].picture = reader.result as string;
                                          setQuestions(updated);
                                        };
                                        reader.readAsDataURL(file);
                                        return false;
                                      }}
                                      fileList={
                                        q.picture
                                          ? [{ uid: "-1", name: "image.png", status: "done", url: q.picture }]
                                          : []
                                      }
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
                                        <div >
                                          <UploadOutlined />
                                          <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
                                        </div>
                                      )}
                                    </Upload>
                                  </div>
                                </div>
                              </div>
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

        <div className="bottom-buttons">
          <Button type="dashed" onClick={addQuestion}>เพิ่มคำถามใหม่</Button>
          <Button type="primary" onClick={handleSubmit}>บันทึกการแก้ไขทั้งหมด</Button>
        </div>

        {/* ✅ Preview Modal */}
          <Modal
          open={previewVisible}
          footer={null}
          centered
          onCancel={() => setPreviewVisible(false)}
          style={{ maxWidth: "90vw", padding: 0 }}
          bodyStyle={{ padding: 0 }}
          width="auto"
        >
          <img
            alt="Preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              display: "block",
              margin: "0 auto",
              objectFit: "contain",
              borderRadius: "12px"
            }}
            src={previewImage!}
          />
        </Modal>

        {/* ✅ Modal แจ้งบันทึกสำเร็จ */}
        <Modal
          title="แก้ไขข้อมูลเรียบร้อย"
          open={isEditSuccessModalVisible}
          centered
          onOk={() => {
            setIsEditSuccessModalVisible(false);
            navigate("/admin/questionnairePage");
          }}
          onCancel={() => setIsEditSuccessModalVisible(false)}
          okText="ตกลง"
        >
          <p style={{ textAlign: "center" }}>บันทึกข้อมูลสำเร็จ!</p>
        </Modal>
      </div>
    </div>
  );
};

export default EditQuestionnaire;
