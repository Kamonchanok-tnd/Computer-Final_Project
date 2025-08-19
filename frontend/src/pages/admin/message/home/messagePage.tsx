import React, { useEffect, useState } from "react";
import { Row, Col, Button, Table, Input, Select, Space, Modal, Spin, Alert, message, Tag, Tooltip } from "antd";
import { DeleteOutlined, SettingOutlined, SearchOutlined } from "@ant-design/icons";
import { getAllWordHealingMessages, deleteWordHealingMessage } from "../../../../services/https/message";
import { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import { useNavigate } from "react-router-dom";
import emailIcon from "../../../../assets/email.png";
import "./messagePage.css";
import type { ColumnType } from "antd/es/table";

const { Option } = Select;

const MessagePage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<WordHealingContent[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<WordHealingContent | null>(null);
  const [, setIsDeleteSuccessModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await getAllWordHealingMessages();
      setMessages(data);
      setFilteredMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
    setLoadingMessages(false);
  };

  const showDeleteModal = (messageItem: WordHealingContent) => {
    setSelectedToDelete(messageItem);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;
    try {
      await deleteWordHealingMessage(selectedToDelete.id.toString());
      setDeleteModalVisible(false);
      setIsDeleteSuccessModalVisible(true);
      await loadMessages();

      // เพิ่มข้อความสำเร็จหลังการลบ
      message.success("ลบข้อมูลบทความในฐานข้อมูลสำเร็จ!");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    filterAndSort(value, sortOption);
  };

  const filterAndSort = (searchValue: string, sortKey: string) => {
    let data = [...messages];

    if (searchValue.trim() !== "") {
      const q = searchValue.toLowerCase();
      data = data.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          (m.articleType || "").toLowerCase().includes(q) ||
          (m.content || "").toLowerCase().includes(q)
      );
    }

    if (sortKey === "nameAsc") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortKey === "nameDesc") {
      data.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortKey === "dateAsc") {
      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortKey === "dateDesc") {
      data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    setFilteredMessages(data);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    filterAndSort(searchText, value);
  };

  // พรีวิวรูป
  const handleImageClick = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  // คอลัมน์ตาราง (เพิ่ม ID แล้ว)
  const messageColumns: ColumnType<WordHealingContent>[] = [
    {
      title: <span className="table-header">ลำดับ</span>,
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
    },
    {
      title: <span className="table-header">ชื่อบทความ</span>,
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: <span className="table-header">ผู้เขียน</span>,
      dataIndex: "author",
      key: "author",
      align: "center",
    },
    {
      title: <span className="table-header">ประเภทบทความ</span>,
      dataIndex: "articleType",
      key: "articleType",
      align: "center",
      render: (type: string) => (type ? <Tag>{type}</Tag> : <span>-</span>),
    },
    {
      title: <span className="table-header">เนื้อหาบทความ</span>,
      dataIndex: "content",
      key: "content",
      align: "center",
      width: 320,
      render: (content: string) => {
        if (!content) return <span>-</span>;
        const text = String(content);
        const short = text.length > 120 ? `${text.slice(0, 120)}…` : text;
        return (
          <Tooltip title={text} overlayStyle={{ maxWidth: 600 }}>
            <span>{short}</span>
          </Tooltip>
        );
      },
    },
    {
      title: <span className="table-header">วันที่สร้าง</span>,
      dataIndex: "date",
      key: "date",
      align: "center",
      render: (date: string) => {
        if (!date || date === "ไม่มีวันที่") return "-";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleDateString();
      },
    },
    {
      title: <span className="table-header">จำนวนการกดถูกใจ</span>,
      dataIndex: "no_of_like",
      key: "no_of_like",
      align: "center",
    },
    {
      title: <span className="table-header">รูปภาพ</span>,
      dataIndex: "photo",
      key: "photo",
      align: "center",
      render: (photo: string | null) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => handleImageClick(photo || "/default-image.png")}
        >
          <img
            src={photo || "/default-image.png"}
            alt="Healing"
            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
          />
        </div>
      ),
    },
    {
      title: <span className="table-header">การจัดการ</span>,
      key: "actions",
      align: "center",
      render: (_text: string, record: WordHealingContent) => (
        <Space>
          <Button
            icon={<SettingOutlined className="edit-icon" />}
            onClick={() =>
              navigate("/admin/editMessagePage", { state: { id: record.id } })
            }
            className="edit-button"
          />
          <Button
            icon={<DeleteOutlined className="delete-icon" />}
            danger
            onClick={() => showDeleteModal(record)}
            className="delete-button"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="message-page-container">
      <Row justify="space-between" align="middle" className="message-page-header">
        <Col>
          <h2 className="message-page-title">
            <img
              src={emailIcon}
              alt="manage icon"
              className="message-page-icon"
            />
            จัดการบทความให้กำลังใจ
          </h2>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => navigate("/admin/createMessagePage")}
            className="message-create-btn"
          >
            + สร้าง
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="ค้นหาบทความ/ผู้เขียน/ประเภท/เนื้อหา..."
            size="large"
            value={searchText}
            onChange={handleSearchChange}
            onPressEnter={() => filterAndSort(searchText, sortOption)}
            addonBefore={<SearchOutlined />}
            allowClear
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
            <Option value="nameAsc">ชื่อบทความ (A → Z)</Option>
            <Option value="nameDesc">ชื่อบทความ (Z → A)</Option>
            <Option value="dateAsc">วันที่สร้าง (เก่าสุด → ใหม่สุด)</Option>
            <Option value="dateDesc">วันที่สร้าง (ใหม่สุด → เก่าสุด)</Option>
          </Select>
        </Col>
      </Row>

      {loadingMessages ? (
        <Spin tip="กำลังโหลดบทความ..." />
      ) : filteredMessages.length === 0 ? (
        <Alert message="ไม่พบบทความ" type="info" showIcon />
      ) : (
        <Table
          columns={messageColumns}
          dataSource={filteredMessages}
          rowKey="id"
          bordered
          pagination={{ pageSize: 7 }}
        />
      )}

      <Modal
        title="ยืนยันการลบบทความ ❌ "
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?</p>
        <p
          style={{
            fontWeight: "bold",
            fontSize: "18px",
            color: "#cf1322",
            textAlign: "center",
          }}
        >
          {selectedToDelete?.name}
        </p>
      </Modal>

      {/* Modal พรีวิวรูปภาพ */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
      >
        <img
          alt="Preview"
          style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default MessagePage;
