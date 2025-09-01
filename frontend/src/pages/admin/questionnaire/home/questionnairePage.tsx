import React, { useEffect, useState } from "react";
import { Modal, Spin, Alert, Table, message, Space, Input, Select, Button as AntButton } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, SettingOutlined, SearchOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import { getAllQuestionnaires, deleteQuestionnaire, getAllUsers } from "../../../../services/https/questionnaire";
import type { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useLocation, useNavigate } from "react-router-dom";
import manageIcon from "../../../../assets/manage.png";

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
  const location = useLocation() as any;

  // รับ flash จากหน้าสร้าง/แก้ไข แล้วแสดง toast ครั้งเดียว
  useEffect(() => {
    const flash = location.state?.flash as { type: "success" | "error"; content: string } | undefined;
    if (flash) {
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
      (users || []).forEach((user: any) => {
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
    switch (sortKey) {
      case "nameAsc":
        data.sort((a, b) => a.nameQuestionnaire.localeCompare(b.nameQuestionnaire, "th", { sensitivity: "base" }));
        break;
      case "nameDesc":
        data.sort((a, b) => b.nameQuestionnaire.localeCompare(a.nameQuestionnaire, "th", { sensitivity: "base" }));
        break;
      case "descriptionAsc":
        data.sort((a, b) => a.description.localeCompare(b.description, "th", { sensitivity: "base" }));
        break;
      case "descriptionDesc":
        data.sort((a, b) => b.description.localeCompare(a.description, "th", { sensitivity: "base" }));
        break;
      case "authorAsc":
        data.sort((a, b) => (usersMap[a.uid] || "").localeCompare(usersMap[b.uid] || "", "th", { sensitivity: "base" }));
        break;
      case "authorDesc":
        data.sort((a, b) => (usersMap[b.uid] || "").localeCompare(usersMap[a.uid] || "", "th", { sensitivity: "base" }));
        break;
      case "quantityAsc":
        data.sort((a, b) => a.quantity - b.quantity);
        break;
      case "quantityDesc":
        data.sort((a, b) => b.quantity - a.quantity);
        break;
      case "idAsc":
        data.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        break;
      case "idDesc":
        data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      default:
        break;
    }

    setFilteredQuestionnaires(data);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    filterAndSort(searchText, value);
  };

  const headerCellStyle = { backgroundColor: '#5DE2FF', color: '#0f172a', fontWeight: 600 } as const;

  const questionnaireColumns: ColumnsType<Questionnaire> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: "ชื่อแบบทดสอบ",
      dataIndex: "nameQuestionnaire",
      key: "nameQuestionnaire",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      render: (text: string) => <div className="whitespace-normal break-words">{text}</div>,
      width: 320,
      responsive: ['xs','sm','md','lg','xl'],
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      render: (text: string) => <div className="whitespace-normal break-words">{text}</div>,
      width: 420,
      responsive: ['xs','sm','md','lg','xl'],
    },
    {
      title: "จำนวนข้อ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 120,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: "ผู้สร้าง",
      dataIndex: "uid",
      key: "uid",
      align: "center",
      render: (uid: number) => usersMap[uid] || "ไม่ทราบชื่อ",
      width: 160,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center",
      render: (_: any, record: Questionnaire) => (
        <Space>
          <AntButton icon={<SettingOutlined />} onClick={() => handleEdit(record)} className="!bg-black !text-white hover:!bg-gray-700 active:!bg-indigo-800 !border-none !shadow-none focus:!shadow-none"/>
          <AntButton danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)} className="!w-8 !h-8 !p-0 !bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 !border-none !shadow-none"/>
        </Space>
      ),
      width: 140,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      {contextHolder}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={manageIcon} alt="manage icon" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">จัดการแบบทดสอบ</h2>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-300 bg-[#5DE2FF] hover:bg-cyan-500 transition"
            onClick={() => navigate("/admin/manageTestOrder")}
          >
            <TableOutlined />
            <span>จัดการลำดับ</span>
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm text-black bg-[#5DE2FF] hover:bg-cyan-500 transition"
            onClick={() => navigate("/admin/createQuestionnaire")}
          >
            <PlusOutlined />
            <span>สร้าง</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="order-1 md:order-none md:col-span-9">
          <Input
            placeholder="ค้นหาแบบทดสอบหรือผู้สร้าง..."
            size="large"
            value={searchText}
            onChange={handleSearchChange}
            addonBefore={<SearchOutlined />}
            allowClear
          />
        </div>
        <div className="order-2 md:order-none md:col-span-3">
          <Select
            value={sortOption}
            onChange={handleSortChange}
            size="large"
            className="w-full"
            options={[
              { value: "default", label: "เรียงลำดับ" },
              { value: "nameAsc", label: "ชื่อแบบทดสอบ (ก → ฮ)" },
              { value: "nameDesc", label: "ชื่อแบบทดสอบ (ฮ → ก)" },
              { value: "descriptionAsc", label: "คำอธิบาย (ก → ฮ)" },
              { value: "descriptionDesc", label: "คำอธิบาย (ฮ → ก)" },
              { value: "authorAsc", label: "ผู้สร้าง (ก → ฮ)" },
              { value: "authorDesc", label: "ผู้สร้าง (ฮ → ก)" },
              { value: "quantityAsc", label: "จำนวนข้อ (น้อย → มาก)" },
              { value: "quantityDesc", label: "จำนวนข้อ (มาก → น้อย)" },
              { value: "idAsc", label: "ID (น้อย → มาก)" },
              { value: "idDesc", label: "ID (มาก → น้อย)" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        {loadingQuestionnaires ? (
          <div className="flex items-center justify-center py-16">
            <Spin tip="กำลังโหลดแบบทดสอบ..." />
          </div>
        ) : filteredQuestionnaires.length === 0 ? (
          <Alert message="ไม่พบแบบทดสอบ" type="info" showIcon />
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <Table<Questionnaire>
              columns={questionnaireColumns}
              dataSource={filteredQuestionnaires}
              rowKey={(r) => String(r.id ?? Math.random())}
              bordered
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 1100 }}
              sticky
              size="middle"
            />
          </div>
        )}
      </div>

      {/* Delete modal */}
      <Modal
        title="ยืนยันการลบแบบทดสอบ ❌ "
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered
        width={560}
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบแบบทดสอบ?</p>
        <p className="text-center font-semibold text-lg text-red-600">{selectedToDelete?.nameQuestionnaire}</p>
      </Modal>
    </div>
  );
};

export default QuestionnairePage;
