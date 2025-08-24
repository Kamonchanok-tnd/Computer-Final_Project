import React, { useEffect, useState } from "react";
import { Button, Modal, Row, Col, Spin, Alert, Table, message, Space, Input, Select } from "antd";
import { DeleteOutlined, SettingOutlined, SearchOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import { getAllQuestionnaires, deleteQuestionnaire, getAllUsers } from "../../../../services/https/questionnaire";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useLocation, useNavigate } from "react-router-dom";
import manageIcon from "../../../../assets/manage.png";
import "./questionnairePage.css";

const { Option } = Select;

const QuestionnairePage: React.FC = () => {
  // antd toast
  const [msgApi, contextHolder] = message.useMessage();

  // states
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Questionnaire | null>(null);

  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [searchText, setSearchText] = useState<string>("");

  const [sortOption, setSortOption] = useState<string>("default");

  const navigate = useNavigate();
  const location = useLocation() as unknown as {
    state?: { flash?: { type: "success" | "error"; content: string } };
  };

  // รับ flash จากหน้าสร้าง/แก้ไข แล้วแสดง toast ครั้งเดียว
  useEffect(() => {
    const flash = location.state?.flash;
    if (flash) {
      // ใช้ window.history เพื่อล้างสถานะ flash หลังจากการแสดงผลเพื่อไม่ให้แสดงซ้ำ
      if (!window.history.state?.flash) {
        if (flash.type === "success") {
          msgApi.success(flash.content);
        } else {
          msgApi.error(flash.content);
        }
        window.history.replaceState({ flash }, document.title, window.location.pathname + window.location.search);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    loadQuestionnaires();
    loadUsers();
  }, []);

  const loadQuestionnaires = async () => {
    setLoadingQuestionnaires(true);
    try {
      const data = await getAllQuestionnaires();
      setQuestionnaires(data);
      setFilteredQuestionnaires(data);
    } catch (err) {
      msgApi.error("เกิดข้อผิดพลาดในการโหลดแบบทดสอบ");
      console.error(err);
    } finally {
      setLoadingQuestionnaires(false);
    }
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
      msgApi.error("โหลดข้อมูลผู้ใช้ล้มเหลว");
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
      msgApi.success("ลบแบบทดสอบเรียบร้อยแล้ว!");
      await loadQuestionnaires();
    } catch (error) {
      msgApi.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    filterAndSort(value, sortOption);
  };

 const filterAndSort = (searchValue: string, sortKey: string) => {
  let data = [...questionnaires];

  // ฟิลเตอร์ตามคำค้น
  if (searchValue.trim() !== "") {
    data = data.filter((q) => {
      const userName = usersMap[q.uid] || "";
      return (
        q.nameQuestionnaire.toLowerCase().includes(searchValue.toLowerCase()) ||
        userName.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  }

  // เรียงลำดับตามที่เลือก
  if (sortKey === "nameAsc") {
    data.sort((a, b) => a.nameQuestionnaire.localeCompare(b.nameQuestionnaire, 'th', { sensitivity: 'base' }));
  } else if (sortKey === "nameDesc") {
    data.sort((a, b) => b.nameQuestionnaire.localeCompare(a.nameQuestionnaire, 'th', { sensitivity: 'base' }));
  } else if (sortKey === "descriptionAsc") {
    data.sort((a, b) => a.description.localeCompare(b.description, 'th', { sensitivity: 'base' }));
  } else if (sortKey === "descriptionDesc") {
    data.sort((a, b) => b.description.localeCompare(a.description, 'th', { sensitivity: 'base' }));
  } else if (sortKey === "authorAsc") {
    data.sort((a, b) => {
      const authorA = usersMap[a.uid] || "";
      const authorB = usersMap[b.uid] || "";
      return authorA.localeCompare(authorB, 'th', { sensitivity: 'base' });
    });
  } else if (sortKey === "authorDesc") {
    data.sort((a, b) => {
      const authorA = usersMap[a.uid] || "";
      const authorB = usersMap[b.uid] || "";
      return authorB.localeCompare(authorA, 'th', { sensitivity: 'base' });
    });
  } else if (sortKey === "quantityAsc") {
    data.sort((a, b) => a.quantity - b.quantity);
  } else if (sortKey === "quantityDesc") {
    data.sort((a, b) => b.quantity - a.quantity);
  } else if (sortKey === "idAsc") {
    data.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); // ใช้ `??` เพื่อตรวจสอบ undefined และกำหนดค่าเป็น 0 ถ้าเป็น undefined
  } else if (sortKey === "idDesc") {
    data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); // ใช้ `??` เพื่อตรวจสอบ undefined และกำหนดค่าเป็น 0 ถ้าเป็น undefined
  }

  setFilteredQuestionnaires(data);
};

  const handleSortChange = (value: string) => {
    setSortOption(value);
    filterAndSort(searchText, value);
  };

  const questionnaireColumns = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      align: "center" as const,
    },
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
          <Button icon={<SettingOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="questionnaire-page-container">
      {/* สำหรับแสดง antd message */}
      {contextHolder}

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2
            className="questionnaire-page-title"
            style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", fontWeight: 700 }}
          >
            <img src={manageIcon} alt="manage icon" style={{ width: 50, height: 50, objectFit: "contain" }} />
            จัดการแบบทดสอบ
          </h2>
        </Col>
        <Row gutter={8}>
          <Col>
          <button className="bg-button-blue text-white py-2 px-2 rounded "
            onClick={() => navigate("/admin/manageTestOrder")}
            >
            <div className="flex gap-2">
              <TableOutlined />
              <span>จัดการลำดับ</span>
            </div>
          </button>
          </Col>
          <Col>
          <button className="bg-button-blue text-white py-2 px-4 rounded mr-2"
            onClick={() => navigate("/admin/createQuestionnaire")}
            >
            <div className="flex gap-2">
              <PlusOutlined />
              <span>สร้าง</span>
            </div>
          </button>
          </Col>
        </Row>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="ค้นหาแบบทดสอบหรือผู้สร้าง..."
            size="large"
            value={searchText}
            onChange={handleSearchChange}
            addonBefore={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select value={sortOption} onChange={handleSortChange} size="large" style={{ width: "100%" }}>
            <Option value="default">เรียงลำดับ</Option>
            <Option value="nameAsc">ชื่อแบบทดสอบ (ก → ฮ)</Option>
            <Option value="nameDesc">ชื่อแบบทดสอบ (ฮ → ก)</Option>
            <Option value="descriptionAsc">คำอธิบาย (ก → ฮ)</Option>
            <Option value="descriptionDesc">คำอธิบาย (ฮ → ก)</Option>
            <Option value="authorAsc">ผู้สร้าง (ก → ฮ)</Option>
            <Option value="authorDesc">ผู้สร้าง (ฮ → ก)</Option>
            <Option value="quantityAsc">จำนวนข้อ (น้อย → มาก)</Option>
            <Option value="quantityDesc">จำนวนข้อ (มาก → น้อย)</Option>
            <Option value="idAsc">ID (น้อย → มาก)</Option>
            <Option value="idDesc">ID (มาก → น้อย)</Option>
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
        <p style={{ fontWeight: "bold", fontSize: "18px", textAlign: "center", color: "#cf1322" }}>
          {selectedToDelete?.nameQuestionnaire}
        </p>
      </Modal>
    </div>
  );
};

export default QuestionnairePage;
