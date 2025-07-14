import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Divider, Form, Input, InputNumber, Modal, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Question } from "../../../../interfaces/IQuestion";
import { AnswerOption } from "../../../../interfaces/IAnswerOption";
import { createQuestions } from "../../../../services/https/questionnaire";
import "./fromStepQuestion.css";

interface QuestionWithAnswers {
    question: Question;
    answers: AnswerOption[];
}

const FormStepQuestion: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const questionnaireId = location.state?.questionnaireId;
    const quantity = location.state?.quantity || 3;

    const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);

    useEffect(() => {
        if (!questionnaireId) {
            alert("ไม่พบข้อมูลแบบทดสอบ กรุณาสร้างแบบทดสอบก่อน");
            navigate("/admin/forminfo");
        } else {
            const init: QuestionWithAnswers[] = Array.from({ length: quantity }, () => ({
                question: {
                    id: 0, // ✅ mock id เพื่อให้ TypeScript ไม่ error
                    nameQuestion: "",
                    quID: questionnaireId,
                },
                answers: [],
            }));
            setQuestions(init);
        }
    }, [questionnaireId]);

    const currentQuestion = questions[currentIndex];

    const updateQuestionText = (value: string) => {
        const updated = [...questions];
        updated[currentIndex].question.nameQuestion = value;
        setQuestions(updated);
    };

    const updateAnswer = (aIndex: number, field: "description" | "point", value: string | number) => {
        const updated = [...questions];
        if (field === "description") {
            updated[currentIndex].answers[aIndex].description = value as string;
        } else {
            updated[currentIndex].answers[aIndex].point = value as number;
        }
        setQuestions(updated);
    };

    const addAnswer = () => {
        const updated = [...questions];
        updated[currentIndex].answers.push({ description: "", point: 0 });
        setQuestions(updated);
    };

    const removeAnswer = (index: number) => {
        const updated = [...questions];
        updated[currentIndex].answers.splice(index, 1);
        setQuestions(updated);
    };

    const handleSubmit = async () => {
        console.log("📝 ข้อมูลที่ submit :", JSON.stringify(questions, null, 2));

        for (const [index, q] of questions.entries()) {
            if (!q.question.nameQuestion.trim()) {
                alert(`กรุณากรอกคำถามที่ ${index + 1}`);
                return;
            }
            if (q.answers.length === 0) {
                alert(`กรุณาเพิ่มตัวเลือกในคำถามที่ ${index + 1}`);
                return;
            }
        }

        try {
            await createQuestions(questions);
            setIsEditSuccessModalVisible(true); // ✅ เปิด Modal สำเร็จ
        } catch (error) {
            console.error("❌ Error creating questions:", error);
            alert("❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        }
    };

    if (!currentQuestion) return <p className="form-step-loading">กำลังโหลดคำถาม...</p>;

    return (
        <div className="form-step-question-container">
            <div className="form-step-question-box">
                <h3 className="form-step-question-title">คำถาม (QUESTION) ข้อที่ {currentIndex + 1}</h3>
                <Form layout="vertical">
                    <Form.Item label="คำถาม" className="question-label-item">
                        <Input
                            value={currentQuestion.question.nameQuestion}
                            onChange={(e) => updateQuestionText(e.target.value)}
                            className="form-step-question-input"
                        />
                    </Form.Item>

                    <Divider orientation="left">ตัวเลือกคำตอบพร้อมคะแนน</Divider>

                    <div className="answers-list-wrapper">
                        {currentQuestion.answers.map((a, aIndex) => (
                            <Space key={aIndex} style={{ display: "flex", marginBottom: 8 }}>
                                <Input
                                    placeholder={`ตัวเลือกที่ ${aIndex + 1}`}
                                    value={a.description}
                                    onChange={(e) => updateAnswer(aIndex, "description", e.target.value)}
                                    className="form-step-answer-input"
                                />
                                <InputNumber
                                    placeholder="คะแนน"
                                    value={a.point}
                                    onChange={(value) => updateAnswer(aIndex, "point", value || 0)}
                                    min={0}
                                    className="form-step-score-input"
                                />
                                <Button danger icon={<DeleteOutlined />} onClick={() => removeAnswer(aIndex)} />
                            </Space>
                        ))}
                    </div>

                    <Button type="dashed" onClick={addAnswer} block className="form-step-add-btn">
                        + เพิ่มตัวเลือก
                    </Button>

                    <div className="form-step-nav-btns">
                        <Space>
                            {currentIndex > 0 && (
                                <Button onClick={() => setCurrentIndex((i) => i - 1)}>ข้อก่อนหน้า</Button>
                            )}
                            {currentIndex < questions.length - 1 ? (
                                <Button type="primary" onClick={() => setCurrentIndex((i) => i + 1)}>
                                    ข้อต่อไป
                                </Button>
                            ) : (
                                <Button type="primary" onClick={handleSubmit}>
                                    บันทึกคำถามเเละคำตอบ
                                </Button>
                            )}
                        </Space>
                    </div>
                </Form>
            </div>

            {/* ✅ Modal บันทึกคำถามสำเร็จ */}
            <Modal
                title="สร้างคำถามเรียบร้อยแล้ว"
                open={isEditSuccessModalVisible}
                onOk={() => {
                    setIsEditSuccessModalVisible(false);
                    navigate("/admin/questionnairePage"); // ✅ กลับหน้า questionnaire
                }}
                onCancel={() => setIsEditSuccessModalVisible(false)}
                okText="ตกลง"
                className="questionnaire-modal"
                centered
            >
                <p style={{ textAlign: "center" }}>บันทึกข้อมูลคำถามเรียบร้อยแล้ว!</p>
            </Modal>
        </div>
    );
};

export default FormStepQuestion;
