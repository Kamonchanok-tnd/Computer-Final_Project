import React, { useEffect, useState } from "react";
import { Table, Input, Select, Space, Modal, Spin, Alert, message, Tag, Tooltip, Button as AntButton } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, SettingOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { getAllWordHealingMessages, deleteWordHealingMessage } from "../../../../services/https/message";
import type { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import { useNavigate } from "react-router-dom";
import emailIcon from "../../../../assets/email.png";

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
      await deleteWordHealingMessage(String(selectedToDelete.id));
      setDeleteModalVisible(false);
      setIsDeleteSuccessModalVisible(true);
      await loadMessages();
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

    // Filter
    if (searchValue.trim() !== "") {
      const q = searchValue.toLowerCase();
      data = data.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        (m.articleType || "").toLowerCase().includes(q) ||
        (m.content || "").toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortKey) {
      case "nameAsc":
        data.sort((a, b) => a.name.localeCompare(b.name, 'th', { sensitivity: 'base' }));
        break;
      case "nameDesc":
        data.sort((a, b) => b.name.localeCompare(a.name, 'th', { sensitivity: 'base' }));
        break;
      case "authorAsc":
        data.sort((a, b) => a.author.localeCompare(b.author, 'th', { sensitivity: 'base' }));
        break;
      case "authorDesc":
        data.sort((a, b) => b.author.localeCompare(a.author, 'th', { sensitivity: 'base' }));
        break;
      case "contentAsc":
        data.sort((a, b) => (a.content || '').localeCompare(b.content || '', 'th', { sensitivity: 'base' }));
        break;
      case "contentDesc":
        data.sort((a, b) => (b.content || '').localeCompare(a.content || '', 'th', { sensitivity: 'base' }));
        break;
      case "likesAsc":
        data.sort((a, b) => (a.no_of_like ?? 0) - (b.no_of_like ?? 0));
        break;
      case "likesDesc":
        data.sort((a, b) => (b.no_of_like ?? 0) - (a.no_of_like ?? 0));
        break;
      case "viewsAsc":
        data.sort((a, b) => (a.viewCount ?? 0) - (b.viewCount ?? 0));
        break;
      case "viewsDesc":
        data.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
        break;
      case "dateAsc":
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "dateDesc":
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      default:
        break;
    }

    setFilteredMessages(data);
  };

  // Preview image
  const handleImageClick = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  // Header style for table
  const headerCellStyle = { backgroundColor: '#5DE2FF', color: '#0f172a', fontWeight: 600 } as const;

  const messageColumns: ColumnsType<WordHealingContent> = [
    {
      title: 'ลำดับ',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 80,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: 'ชื่อบทความ',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 320,
      render: (text: string) => <div className="whitespace-normal break-words">{text}</div>,
      onHeaderCell: () => ({ style: headerCellStyle }),
      responsive: ['xs','sm','md','lg','xl'],
    },
    {
      title: 'ผู้เขียน/อ้างอิง/เเหล่งที่มา',
      dataIndex: 'author',
      key: 'author',
      align: 'center',
      width: 480,
      render: (content: string) => {
        if (!content) return <span>-</span>;
        const text = String(content);
        const short = text.length > 140 ? `${text.slice(0, 140)}…` : text;
        return (
          <Tooltip title={text} overlayStyle={{ maxWidth: 600 }}>
            <span className="whitespace-normal break-words">{short}</span>
          </Tooltip>
        );
      },
      onHeaderCell: () => ({ style: headerCellStyle }),
      responsive: ['xs','sm','md','lg','xl'],
    },
    {
      title: 'ประเภทบทความ',
      dataIndex: 'articleType',
      key: 'articleType',
      align: 'center',
      render: (type: string) => (type ? <Tag>{type}</Tag> : <span>-</span>),
      width: 160,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: 'เนื้อหาบทความ',
      dataIndex: 'content',
      key: 'content',
      align: 'center',
      width: 480,
      render: (content: string) => {
        if (!content) return <span>-</span>;
        const text = String(content);
        const short = text.length > 140 ? `${text.slice(0, 140)}…` : text;
        return (
          <Tooltip title={text} overlayStyle={{ maxWidth: 600 }}>
            <span className="whitespace-normal break-words">{short}</span>
          </Tooltip>
        );
      },
      onHeaderCell: () => ({ style: headerCellStyle }),
      responsive: ['xs','sm','md','lg','xl'],
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (date: string) => {
        if (!date || date === 'ไม่มีวันที่') return '-';
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString();
      },
      width: 140,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: 'จำนวนการกดถูกใจ',
      dataIndex: 'no_of_like',
      key: 'no_of_like',
      align: 'center',
      width: 160,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: 'จำนวนการเข้าชม',
      dataIndex: 'viewCount',
      key: 'viewCount',
      align: 'center',
      width: 160,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: 'รูปภาพ',
      dataIndex: 'photo',
      key: 'photo',
      align: 'center',
      render: (photo: string | null) => (
        <div className="flex items-center justify-center cursor-pointer" onClick={() => handleImageClick(photo || "/default-image.png")}>
          <img src={photo || "/default-image.png"} alt="Healing" className="h-[50px] w-[50px] object-cover rounded-md" />
        </div>
      ),
      width: 120,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      align: 'center',
      render: (_: any, record: WordHealingContent) => (
        <Space>
          <AntButton icon={<SettingOutlined />} onClick={() => navigate('/admin/editMessagePage', { state: { id: record.id } })} className="!bg-black !text-white hover:!bg-gray-700 active:!bg-indigo-800 !border-none !shadow-none focus:!shadow-none"/>
          <AntButton danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)}  className="!w-8 !h-8 !p-0 !bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 !border-none !shadow-none"/>
        </Space>
      ),
      width: 140,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={emailIcon} alt="manage icon" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">จัดการบทความให้กำลังใจ</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm text-black bg-[#5DE2FF] hover:bg-cyan-500 transition"
            onClick={() => navigate("/admin/createMessagePage")}
          >
            <PlusOutlined />
            <span>สร้าง</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-9">
          <Input
            placeholder="ค้นหาบทความ/ผู้เขียน/ประเภท/เนื้อหา..."
            size="large"
            value={searchText}
            onChange={handleSearchChange}
            onPressEnter={() => filterAndSort(searchText, sortOption)}
            addonBefore={<SearchOutlined />}
            allowClear
          />
        </div>
        <div className="md:col-span-3">
          <Select
            value={sortOption}
            onChange={(v) => { setSortOption(String(v)); filterAndSort(searchText, String(v)); }}
                        size="large"
            className="w-full"
            options={[
              { value: 'default',   label: 'เรียงลำดับ' },
              { value: 'nameAsc',   label: 'ชื่อบทความ (ก → ฮ)' },
              { value: 'nameDesc',  label: 'ชื่อบทความ (ฮ → ก)' },
              { value: 'authorAsc', label: 'ชื่อผู้เขียน (ก → ฮ)' },
              { value: 'authorDesc',label: 'ชื่อผู้เขียน (ฮ → ก)' },
              { value: 'contentAsc',label: 'เนื้อหาบทความ (ก → ฮ)' },
              { value: 'contentDesc',label: 'เนื้อหาบทความ (ฮ → ก)' },
              { value: 'likesAsc',  label: 'จำนวนการกดถูกใจ (น้อย → มาก)' },
              { value: 'likesDesc', label: 'จำนวนการกดถูกใจ (มาก → น้อย)' },
              { value: 'viewsAsc',  label: 'จำนวนการเข้าชม (น้อย → มาก)' },
              { value: 'viewsDesc', label: 'จำนวนการเข้าชม (มาก → น้อย)' },
              { value: 'dateAsc',   label: 'วันที่สร้าง (เก่าสุด → ใหม่สุด)' },
              { value: 'dateDesc',  label: 'วันที่สร้าง (ใหม่สุด → เก่าสุด)' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-16"><Spin tip="กำลังโหลดบทความ..." /></div>
        ) : filteredMessages.length === 0 ? (
          <Alert message="ไม่พบบทความ" type="info" showIcon />
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <Table<WordHealingContent>
              columns={messageColumns}
              dataSource={filteredMessages}
              rowKey={(r) => String(r.id)}
              bordered
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1280 }}
              sticky
              size="middle"
            />
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
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
        <p className="text-center font-semibold text-lg text-red-600">{selectedToDelete?.name}</p>
      </Modal>

      {/* Preview image modal */}
      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)} centered>
        <img alt="Preview" className="w-full max-h-[80vh] object-contain" src={previewImage} />
      </Modal>
    </div>
  );
};

export default MessagePage;
