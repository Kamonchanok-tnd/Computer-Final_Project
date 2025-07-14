// import React, { useEffect, useState } from "react";

import React, { useEffect, useState } from "react";
import {Button,Modal,Row,Col,Spin,Alert,Table,message,Space,Input,} from "antd";
import {DeleteOutlined,SettingOutlined,} from "@ant-design/icons";
import {getAllQuestions,getAllQuestionnaires,deleteQuestion,updateQuestion } from "../../../../services/https/questionnaire";
import { Question } from "../../../../interfaces/IQuestion";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useNavigate } from "react-router-dom";
import "./questionPage.css";

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionnaireMap, setQuestionnaireMap] = useState<Record<number, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedQuestionToDelete, setSelectedQuestionToDelete] = useState<Question | null>(null);
  const [isDeleteSuccessModalVisible, setIsDeleteSuccessModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedQuestionToEdit, setSelectedQuestionToEdit] = useState<Question | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false); // ✅ Modal แก้ไขสำเร็จ

  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
    loadQuestionnaires();
  }, []);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    const data = await getAllQuestions();
    setQuestions(data);
    setLoadingQuestions(false);
  };

  const loadQuestionnaires = async () => {
    const data = await getAllQuestionnaires();
    const map: Record<number, string> = {};
    data.forEach((q: Questionnaire) => {
      map[q.id!] = q.nameQuestionnaire;
    });
    setQuestionnaireMap(map);
  };

  const showDeleteModal = (question: Question) => {
    setSelectedQuestionToDelete(question);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuestionToDelete) return;
    try {
      await deleteQuestion(selectedQuestionToDelete.id!);
      setDeleteModalVisible(false);
      setIsDeleteSuccessModalVisible(true);
      await loadQuestions();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบคำถาม");
    }
  };

  const showEditModal = (question: Question) => {
    setSelectedQuestionToEdit(question);
    setEditedName(question.nameQuestion);
    setEditModalVisible(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedQuestionToEdit) return;
    try {
      await updateQuestion(selectedQuestionToEdit.id!, editedName);
      setEditModalVisible(false);
      setIsEditSuccessModalVisible(true); // ✅ แสดง Modal สำเร็จ
      await loadQuestions();
    } catch (error) {
      message.error("ไม่สามารถแก้ไขคำถามได้");
    }
  };

  const questionColumns = [
    {
      title: "ชื่อคำถาม",
      dataIndex: "nameQuestion",
      key: "nameQuestion",
      align: "center" as const,
    },
    {
      title: "ชื่อแบบทดสอบ",
      dataIndex: "quID",
      key: "quID",
      align: "center" as const,
      render: (quID: number) => questionnaireMap[quID] || "-",
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: Question) => (
        <Space>
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
          <Button icon={<SettingOutlined />} onClick={() => showEditModal(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="question-page-container">
      <Row justify="space-between" align="middle">
        <Col>
          <h2 className="question-page-title">คำถามทั้งหมด (All Questions)</h2>
        </Col>
        <Col>
          <Button
            className="question-create-btn"
            type="primary"
            onClick={() => navigate("/admin/createQuestionnaire")}
          >
            สร้างแบบทดสอบ
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24, marginBottom: 16 }}>
        <Col>
          <Button onClick={() => navigate("/admin/questionnairePage")}>
            📋 ดูแบบทดสอบทั้งหมด
          </Button>
        </Col>
        <Col>
          <Button onClick={() => navigate("/admin/questionPage")}>
            ❓ ดูคำถามทั้งหมด
          </Button>
        </Col>
      </Row>

      <div>
        {loadingQuestions ? (
          <Spin tip="กำลังโหลดคำถาม..." />
        ) : questions.length === 0 ? (
          <Alert message="ไม่มีคำถามในระบบ" type="info" showIcon />
        ) : (
          <div className="question-table-container">
            <Table
              columns={questionColumns}
              dataSource={questions}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </div>

      {/* ✅ Modal ยืนยันการลบ */}
      <Modal
        title="ยืนยันการลบคำถาม"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered
        className="question-modal"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบคำถามนี้:</p>
        <p style={{ fontWeight: "bold", fontSize: "18px", color: "#cf1322" }}>
          {selectedQuestionToDelete?.nameQuestion}
        </p>
      </Modal>

      {/* ✅ Modal แจ้งลบสำเร็จ */}
      <Modal
        title="ลบคำถามเรียบร้อยแล้ว"
        open={isDeleteSuccessModalVisible}
        onOk={() => setIsDeleteSuccessModalVisible(false)}
        onCancel={() => setIsDeleteSuccessModalVisible(false)}
        okText="ตกลง"
        className="questionnaire-modal"
        centered
      >
        <p style={{ textAlign: "center" }}>ลบข้อมูลคำถามเรียบร้อยแล้ว!</p>
      </Modal>

      {/* ✅ Modal แก้ไขคำถาม */}
      <Modal
        title="แก้ไขชื่อคำถาม"
        open={editModalVisible}
        onOk={handleConfirmEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
        className="question-modal"
      >
        <p>กรอกชื่อคำถามใหม่:</p>
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          placeholder="ชื่อคำถามใหม่"
        />
      </Modal>

      {/* ✅ Modal แก้ไขสำเร็จ */}
      <Modal
        title="แก้ไขคำถามเรียบร้อยแล้ว"
        open={isEditSuccessModalVisible}
        onOk={() => setIsEditSuccessModalVisible(false)}
        onCancel={() => setIsEditSuccessModalVisible(false)}
        okText="ตกลง"
        className="questionnaire-modal"
        centered
      >
        <p style={{ textAlign: "center" }}>บันทึกการเเก้ไขข้อมูลคำถามเรียบร้อยแล้ว!</p>
      </Modal>
    </div>
  );
};

export default QuestionPage;
