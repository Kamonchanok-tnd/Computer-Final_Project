import React, { useEffect, useState } from "react";
import {Button,Modal,Row,Col,Spin,Alert,Table,message,Space,Input,Select,} from "antd";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import {getAllQuestionnaires,deleteQuestionnaire,getAllUsers,} from "../../../../services/https/questionnaire";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useNavigate } from "react-router-dom";
import manageIcon from "../../../../assets/manage.png";
import "./questionnairePage.css";

const { Search } = Input;
const { Option } = Select;

const QuestionnairePage: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Questionnaire | null>(null);
  const [isDeleteSuccessModalVisible, setIsDeleteSuccessModalVisible] = useState(false);

  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [searchText, setSearchText] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");

  const navigate = useNavigate();

  useEffect(() => {
    loadQuestionnaires();
    loadUsers();
  }, []);

  const loadQuestionnaires = async () => {
    setLoadingQuestionnaires(true);
    const data = await getAllQuestionnaires();
    setQuestionnaires(data);
    setFilteredQuestionnaires(data);
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

  /** ✅ ค้นหาแบบ Real-time */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    filterAndSort(value, sortOption);
  };

  const onSearch = (value: string) => {
    filterAndSort(value, sortOption);
  };

  /** ✅ ฟังก์ชันรวมการกรอง + เรียง */
  const filterAndSort = (searchValue: string, sortKey: string) => {
    let data = [...questionnaires];

    // ✅ กรองด้วย Search
    if (searchValue.trim() !== "") {
      data = data.filter((q) => {
        const userName = usersMap[q.uid] || "";
        return (
          q.nameQuestionnaire.toLowerCase().includes(searchValue.toLowerCase()) ||
          userName.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

    // ✅ เรียงตามตัวเลือก
    if (sortKey === "nameAsc") {
      data.sort((a, b) => a.nameQuestionnaire.localeCompare(b.nameQuestionnaire));
    } else if (sortKey === "nameDesc") {
      data.sort((a, b) => b.nameQuestionnaire.localeCompare(a.nameQuestionnaire));
    } else if (sortKey === "quantityAsc") {
      data.sort((a, b) => a.quantity - b.quantity);
    } else if (sortKey === "quantityDesc") {
      data.sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredQuestionnaires(data);
  };

  /** ✅ เปลี่ยน Sort Option */
  const handleSortChange = (value: string) => {
    setSortOption(value);
    filterAndSort(searchText, value);
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
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record)}
          />
          <Button
            icon={<SettingOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="questionnaire-page-container">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2
            className="questionnaire-page-title"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "24px",
              fontWeight: 700
            }}
          >
            <img
              src={manageIcon}
              alt="manage icon"
              style={{ width: 50, height: 50, objectFit: "contain" }}
            />
            จัดการแบบทดสอบ
          </h2>
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

      {/* ✅ Search + Sort */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="ค้นหาแบบทดสอบหรือผู้สร้าง..."
            allowClear
            enterButton="ค้นหา"
            size="large"
            value={searchText}
            onChange={handleSearchChange}
            onSearch={onSearch}
            className="questionnaire-search"
          />
        </Col>
        <Col span={6}>
          <Select
            value={sortOption}
            onChange={handleSortChange}
            size="large"
            style={{ width: "100%" }}
          >
            <Option value="default">เรียงลำดับ</Option>
            <Option value="nameAsc">ชื่อแบบทดสอบ (A → Z)</Option>
            <Option value="nameDesc">ชื่อแบบทดสอบ (Z → A)</Option>
            <Option value="quantityAsc">จำนวนข้อ (น้อย → มาก)</Option>
            <Option value="quantityDesc">จำนวนข้อ (มาก → น้อย)</Option>
          </Select>
        </Col>
      </Row>

      <div>
        {loadingQuestionnaires ? (
          <Spin tip="กำลังโหลดแบบทดสอบ..." />
        ) : filteredQuestionnaires.length === 0 ? (
          <Alert message="ไม่พบแบบทดสอบ" type="info" showIcon />
        ) : (
          <div className="questionnaire-table-container">
            <Table
              columns={questionnaireColumns}
              dataSource={filteredQuestionnaires}
              rowKey="id"
              bordered
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </div>

      {/* MODAL ลบ */}
      <Modal
        title="ยืนยันการลบแบบทดสอบ ❌ "
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered
        width={600}
        className="questionnaire-modal"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบ?</p>
        <p style={{ fontWeight: "bold", fontSize: "18px",  textAlign: "center", color: "#cf1322" }}>
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
        <p style={{ textAlign: "center" }}>✅ลบข้อมูลแบบทดสอบเรียบร้อยแล้ว!</p>
      </Modal>
    </div>
  );
};

export default QuestionnairePage;

