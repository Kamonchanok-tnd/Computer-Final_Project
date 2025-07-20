// import React, { useEffect, useState } from "react";
// import {Button,Modal,Row,Col,Spin,Alert,Table,message,Space,} from "antd";
// import {DeleteOutlined,SettingOutlined } from "@ant-design/icons";
// import {getAllQuestionnaires,deleteQuestionnaire,getAllUsers } from "../../../../services/https/questionnaire";
// import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
// import EditQuestionnairePage from "../../../../pages/admin/questionnaire/edit/edit_questionnaire";
// import { useNavigate } from "react-router-dom";
// import "./questionnairePage.css";

// const QuestionnairePage: React.FC = () => {
//   const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
//   const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [selectedToDelete, setSelectedToDelete] = useState<Questionnaire | null>(null);
//   const [isDeleteSuccessModalVisible, setIsDeleteSuccessModalVisible] = useState(false);

//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [selectedToEdit, setSelectedToEdit] = useState<Questionnaire | null>(null);
//   const [isEditSuccessModalVisible, setIsEditSuccessModalVisible] = useState(false);

//   const [usersMap, setUsersMap] = useState<Record<number, string>>({});

//   const navigate = useNavigate();

//   useEffect(() => {
//     loadQuestionnaires();
//     loadUsers();
//   }, []);

//   const loadQuestionnaires = async () => {
//     setLoadingQuestionnaires(true);
//     const data = await getAllQuestionnaires();
//     setQuestionnaires(data);
//     setLoadingQuestionnaires(false);
//   };

//   const loadUsers = async () => {
//     try {
//       const users = await getAllUsers();
//       const map: Record<number, string> = {};
//       users.forEach((user: any) => {
//         map[user.ID] = user.username;
//       });
//       setUsersMap(map);
//     } catch (error) {
//       console.error("โหลดข้อมูลผู้ใช้ล้มเหลว:", error);
//     }
//   };

//   const showDeleteModal = (questionnaire: Questionnaire) => {
//     setSelectedToDelete(questionnaire);
//     setDeleteModalVisible(true);
//   };

//   const showEditModal = (questionnaire: Questionnaire) => {
//     setSelectedToEdit(questionnaire);
//     setEditModalVisible(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!selectedToDelete) return;
//     try {
//       await deleteQuestionnaire(selectedToDelete.id!);
//       setDeleteModalVisible(false);
//       setIsDeleteSuccessModalVisible(true);
//       await loadQuestionnaires();
//     } catch (error) {
//       message.error("เกิดข้อผิดพลาดในการลบ");
//     }
//   };

//   const questionnaireColumns = [
//     {
//       title: "ชื่อแบบทดสอบ",
//       dataIndex: "nameQuestionnaire",
//       key: "nameQuestionnaire",
//       align: "center" as const,
//     },
//     {
//       title: "คำอธิบาย",
//       dataIndex: "description",
//       key: "description",
//       align: "center" as const,
//     },
//     {
//       title: "จำนวนข้อ",
//       dataIndex: "quantity",
//       key: "quantity",
//       align: "center" as const,
//     },
//     {
//       title: "ผู้สร้าง",
//       dataIndex: "uid",
//       key: "uid",
//       align: "center" as const,
//       render: (uid: number) => usersMap[uid] || "ไม่ทราบชื่อ",
//     },
//     {
//       title: "การจัดการ",
//       key: "actions",
//       align: "center" as const,
//       render: (_: any, record: Questionnaire) => (
//         <Space>
//           <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
//           <Button icon={<SettingOutlined />} onClick={() => showEditModal(record)} />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="questionnaire-page-container">
//       <Row justify="space-between" align="middle">
//         <Col>
//           <h2 className="questionnaire-page-title">จัดการแบบทดสอบ (Manage Tests)</h2>
//         </Col>
//         <Col>
//           <Button
//             className="questionnaire-create-btn"
//             type="primary"
//             onClick={() => navigate("/admin/createQuestionnaire")}
//           >
//             สร้างแบบทดสอบ
//           </Button>
//         </Col>
//       </Row>

//       <Row gutter={16} style={{ marginTop: 24, marginBottom: 16 }}>
//         <Col>
//           <Button type="default" onClick={() => navigate("/admin/questionnairePage")}>
//             📋 ดูแบบทดสอบทั้งหมด
//           </Button>
//         </Col>
//         <Col>
//           <Button type="default" onClick={() => navigate("/admin/questionPage")}>
//             ❓ ดูคำถามทั้งหมด
//           </Button>
//         </Col>
//       </Row>

//       <div>
//         {loadingQuestionnaires ? (
//           <Spin tip="กำลังโหลดแบบทดสอบ..." />
//         ) : questionnaires.length === 0 ? (
//           <Alert message="ไม่มีแบบทดสอบในระบบ" type="info" showIcon />
//         ) : (
//           <div className="questionnaire-table-container">
//             <Table
//               columns={questionnaireColumns}
//               dataSource={questionnaires}
//               rowKey="id"
//               bordered
//               pagination={{ pageSize: 8 }}
//             />
//           </div>
//         )}
//       </div>

//       {/* MODALS */}
//       <Modal
//         title="ยืนยันการลบแบบทดสอบ"
//         open={deleteModalVisible}
//         onOk={handleConfirmDelete}
//         onCancel={() => setDeleteModalVisible(false)}
//         okText="ยืนยัน"
//         cancelText="ยกเลิก"
//         centered
//         width={600}
//         className="questionnaire-modal"
//       >
//         <p>คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบ:</p>
//         <p style={{ fontWeight: "bold", fontSize: "18px", color: "#cf1322" }}>
//           {selectedToDelete?.nameQuestionnaire}
//         </p>
//       </Modal>

//       {/* ✅ Modal ลบสำเร็จเหมือน Modal แก้ไข */}
//       <Modal
//         title="ลบแบบทดสอบเรียบร้อยแล้ว"
//         open={isDeleteSuccessModalVisible}
//         onOk={() => setIsDeleteSuccessModalVisible(false)}
//         onCancel={() => setIsDeleteSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//         className="questionnaire-modal"
//       >
//         <p style={{ textAlign: "center" }}>ลบข้อมูลแบบทดสอบเรียบร้อยแล้ว!</p>
//       </Modal>

//       <Modal
//         title="แก้ไขแบบทดสอบ"
//         open={editModalVisible}
//         onCancel={() => setEditModalVisible(false)}
//         footer={null}
//         centered
//         destroyOnClose
//         width={600}
//         className="questionnaire-modal"
//       >
//         {selectedToEdit && (
//           <EditQuestionnairePage
//             questionnaire={selectedToEdit}
//             onClose={() => setEditModalVisible(false)}
//             onSuccess={() => {
//               loadQuestionnaires();
//               setIsEditSuccessModalVisible(true);
//             }}
//           />
//         )}
//       </Modal>

//       <Modal
//         title="บันทึกสำเร็จ"
//         open={isEditSuccessModalVisible}
//         onOk={() => setIsEditSuccessModalVisible(false)}
//         onCancel={() => setIsEditSuccessModalVisible(false)}
//         okText="ตกลง"
//         centered
//         className="questionnaire-modal"
//       >
//         <p style={{ textAlign: "center" }}>บันทึกการแก้ไขข้อมูลแบบทดสอบเรียบร้อยแล้ว!</p>
//       </Modal>
//     </div>
//   );
// };

// export default QuestionnairePage;



import React, { useEffect, useState } from "react";
import { Button, Modal, Row, Col, Spin, Alert, Table, message, Space } from "antd";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { getAllQuestionnaires, deleteQuestionnaire, getAllUsers } from "../../../../services/https/questionnaire";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useNavigate } from "react-router-dom";
import "./questionnairePage.css";

const QuestionnairePage: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Questionnaire | null>(null);
  const [isDeleteSuccessModalVisible, setIsDeleteSuccessModalVisible] = useState(false);

  const [usersMap, setUsersMap] = useState<Record<number, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    loadQuestionnaires();
    loadUsers();
  }, []);

  const loadQuestionnaires = async () => {
    setLoadingQuestionnaires(true);
    const data = await getAllQuestionnaires();
    setQuestionnaires(data);
    setLoadingQuestionnaires(false);
  };

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      const map: Record<number, string> = {};
      users.forEach((user: any) => {
        map[user.ID] = user.username;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("โหลดข้อมูลผู้ใช้ล้มเหลว:", error);
    }
  };

  const showDeleteModal = (questionnaire: Questionnaire) => {
    setSelectedToDelete(questionnaire);
    setDeleteModalVisible(true);
  };

  // ✅ แทนที่การเปิด Modal ด้วยการ navigate ไปยังหน้าแก้ไข
  const handleEdit = (questionnaire: Questionnaire) => {
    navigate("/admin/editQuestionnaire", {
      state: { questionnaireId: questionnaire.id },
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;
    try {
      await deleteQuestionnaire(selectedToDelete.id!);
      setDeleteModalVisible(false);
      setIsDeleteSuccessModalVisible(true);
      await loadQuestionnaires();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const questionnaireColumns = [
    {
      title: "ชื่อแบบทดสอบ",
      dataIndex: "nameQuestionnaire",
      key: "nameQuestionnaire",
      align: "center" as const,
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center" as const,
    },
    {
      title: "จำนวนข้อ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "ผู้สร้าง",
      dataIndex: "uid",
      key: "uid",
      align: "center" as const,
      render: (uid: number) => usersMap[uid] || "ไม่ทราบชื่อ",
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: Questionnaire) => (
        <Space>
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
          <Button icon={<SettingOutlined />} onClick={() => handleEdit(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="questionnaire-page-container">
      <Row justify="space-between" align="middle">
        <Col>
          <h2 className="questionnaire-page-title">จัดการแบบทดสอบ (Manage Tests)</h2>
        </Col>
        <Col>
          <Button
            className="questionnaire-create-btn"
            type="primary"
            onClick={() => navigate("/admin/createQuestionnaire")}
          >
            สร้างแบบทดสอบ
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24, marginBottom: 16 }}>
        <Col>
          <Button type="default" onClick={() => navigate("/admin/questionnairePage")}>
            📋 ดูแบบทดสอบทั้งหมด
          </Button>
        </Col>
        <Col>
          <Button type="default" onClick={() => navigate("/admin/questionPage")}>
            ❓ ดูคำถามทั้งหมด
          </Button>
        </Col>
      </Row>

      <div>
        {loadingQuestionnaires ? (
          <Spin tip="กำลังโหลดแบบทดสอบ..." />
        ) : questionnaires.length === 0 ? (
          <Alert message="ไม่มีแบบทดสอบในระบบ" type="info" showIcon />
        ) : (
          <div className="questionnaire-table-container">
            <Table
              columns={questionnaireColumns}
              dataSource={questionnaires}
              rowKey="id"
              bordered
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}
      </div>

      {/* MODAL ลบ */}
      <Modal
        title="ยืนยันการลบแบบทดสอบ"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered
        width={600}
        className="questionnaire-modal"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบ:</p>
        <p style={{ fontWeight: "bold", fontSize: "18px", color: "#cf1322" }}>
          {selectedToDelete?.nameQuestionnaire}
        </p>
      </Modal>

      {/* MODAL ลบสำเร็จ */}
      <Modal
        title="ลบแบบทดสอบเรียบร้อยแล้ว"
        open={isDeleteSuccessModalVisible}
        onOk={() => setIsDeleteSuccessModalVisible(false)}
        onCancel={() => setIsDeleteSuccessModalVisible(false)}
        okText="ตกลง"
        centered
        className="questionnaire-modal"
      >
        <p style={{ textAlign: "center" }}>ลบข้อมูลแบบทดสอบเรียบร้อยแล้ว!</p>
      </Modal>
    </div>
  );
};

export default QuestionnairePage;
