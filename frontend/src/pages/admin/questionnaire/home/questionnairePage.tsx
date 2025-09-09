import React, { useEffect, useMemo, useState } from "react";
import {Modal,Spin,Alert,Table,message,Space,Input,Select,Button as AntButton,} from "antd";
import type { ColumnsType } from "antd/es/table";
import {DeleteOutlined,SettingOutlined,SearchOutlined,PlusOutlined,TableOutlined,InfoCircleOutlined,ExclamationCircleOutlined,} from "@ant-design/icons";import {getAllQuestionnaires,deleteQuestionnaire,getAllUsers,} from "../../../../services/https/questionnaire";
import { getQuestionnaireGroupByID } from "../../../../services/https/assessment/index"; // ใช้ service เดิมจากหน้า ManageTestOrder
import type { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useLocation, useNavigate } from "react-router-dom";
import manageIcon from "../../../../assets/manage.png";

/** ===== โครงสร้างกระดานลำดับ (stage + items) ===== */
type OrderBoardCol = {
  stage: string; // เช่น "Pre-test", "Post-test", "Post-test Interval"
  items: Array<{ id: number; nameQuestionnaire?: string }>;
};

// ID ของกลุ่มในหน้าจัดการลำดับ (ปรับให้ตรง backend)
const ORDER_GROUP_IDS = [1, 2, 3];

const QuestionnairePage: React.FC = () => {
  // toast ของ antd
  const [msgApi, contextHolder] = message.useMessage();

  // ข้อมูลแบบทดสอบ + สถานะโหลด/ฟิลเตอร์
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

  // โมดัลลบ
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Questionnaire | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // โมดัลอธิบายความสัมพันธ์
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedForInfo, setSelectedForInfo] = useState<Questionnaire | null>(null);

  // แผนที่ผู้ใช้ (id → username)
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [searchText, setSearchText] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");

  // กระดานลำดับ เพื่อตรวจว่ารายการยังอยู่ในลำดับหรือไม่
  const [orderBoard, setOrderBoard] = useState<OrderBoardCol[]>([]);

  const navigate = useNavigate();
  const location = useLocation() as any;

  /* ===== รับ flash จากหน้าอื่นแล้วแสดงครั้งเดียว ===== */
  useEffect(() => {
    const flash = location.state?.flash as
      | { type: "success" | "error"; content: string }
      | undefined;
    if (flash && !window.history.state?.flash) {
      flash.type === "success" ? msgApi.success(flash.content) : msgApi.error(flash.content);
      window.history.replaceState(
        { flash },
        document.title,
        window.location.pathname + window.location.search
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  /* ===== โหลดข้อมูลเริ่มต้น ===== */
  useEffect(() => {
    loadQuestionnaires();
    loadUsers();
    loadOrderBoard();
  }, []);

  /* ===== ดึงรายการแบบทดสอบทั้งหมด ===== */
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

  /* ===== ดึงรายชื่อผู้ใช้ (ทำ map แสดงชื่อผู้สร้าง) ===== */
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

  /* ===== ดึงกระดานลำดับจาก group IDs (reuse endpoint เดิม) ===== */
  const loadOrderBoard = async () => {
    try {
      const board: OrderBoardCol[] = [];
      for (const gid of ORDER_GROUP_IDS) {
        const g: any = await getQuestionnaireGroupByID(gid);
        if (!g) continue;
        board.push({
          stage: g.name,
          items: (g.questionnaires ?? []).map((q: any) => ({
            id: q.id,
            nameQuestionnaire: q.name, // ฝั่ง manage ใช้ฟิลด์ name
          })),
        });
      }
      setOrderBoard(board);
    } catch (e) {
      // โหลดไม่ได้ → ไม่บล็อกเกินเหตุ (ถือว่าไม่มีในลำดับ)
      setOrderBoard([]);
    }
  };

  /* ===== การกระทำหลัก ===== */
  const showDeleteModal = (questionnaire: Questionnaire) => {
    // เปิดโมดัลลบ + รีโหลดบอร์ดเพื่อความสดใหม่ก่อนเช็ก
    setSelectedToDelete(questionnaire);
    setDeleteConfirmText("");
    setDeleteModalVisible(true);
    loadOrderBoard();
  };

  const showInfoModal = (questionnaire: Questionnaire) => {
    setSelectedForInfo(questionnaire);
    setInfoModalVisible(true);
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    navigate("/admin/editQuestionnaire", {
      state: { questionnaireId: questionnaire.id },
    });
  };

  const handleConfirmDelete = async () => {
    // เรียก API ลบ แล้วรีโหลดตาราง/บอร์ด
    if (!selectedToDelete) return;
    try {
      await deleteQuestionnaire(selectedToDelete.id!);
      setDeleteModalVisible(false);
      setDeleteConfirmText("");
      msgApi.success("ลบแบบทดสอบเรียบร้อยแล้ว!");
      await loadQuestionnaires();
      await loadOrderBoard();
    } catch (error) {
      msgApi.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  /* ===== ควบคุมค้นหา/เรียง ===== */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    filterAndSort(value, sortOption);
  };

  // ฟิลเตอร์ + เรียงลำดับตามตัวเลือก
  const filterAndSort = (searchValue: string, sortKey: string) => {
    let data = [...questionnaires];

    if (searchValue.trim() !== "") {
      data = data.filter((q) => {
        const userName = usersMap[q.uid] || "";
        return (
          q.nameQuestionnaire.toLowerCase().includes(searchValue.toLowerCase()) ||
          userName.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

    switch (sortKey) {
      case "nameAsc":
        data.sort((a, b) =>
          a.nameQuestionnaire.localeCompare(b.nameQuestionnaire, "th", { sensitivity: "base" })
        ); break;
      case "nameDesc":
        data.sort((a, b) =>
          b.nameQuestionnaire.localeCompare(a.nameQuestionnaire, "th", { sensitivity: "base" })
        ); break;
      case "descriptionAsc":
        data.sort((a, b) =>
          a.description.localeCompare(b.description, "th", { sensitivity: "base" })
        ); break;
      case "descriptionDesc":
        data.sort((a, b) =>
          b.description.localeCompare(a.description, "th", { sensitivity: "base" })
        ); break;
      case "authorAsc":
        data.sort((a, b) =>
          (usersMap[a.uid] || "").localeCompare(usersMap[b.uid] || "", "th", { sensitivity: "base" })
        ); break;
      case "authorDesc":
        data.sort((a, b) =>
          (usersMap[b.uid] || "").localeCompare(usersMap[a.uid] || "", "th", { sensitivity: "base" })
        ); break;
      case "quantityAsc": data.sort((a, b) => a.quantity - b.quantity); break;
      case "quantityDesc": data.sort((a, b) => b.quantity - a.quantity); break;
      case "idAsc": data.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); break;
      case "idDesc": data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); break;
      default: break;
    }

    setFilteredQuestionnaires(data);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    filterAndSort(searchText, value);
  };

  // สไตล์หัวตาราง
  const headerCellStyle = {
    backgroundColor: "#5DE2FF",
    color: "#0f172a",
    fontWeight: 600,
  } as const;

  /* ===== ตัวช่วยเรื่องความสัมพันธ์/ลำดับ ===== */

  // คืนค่า conditionOnId โดยรองรับหลาย naming
  const getConditionOnId = (q: any) =>
    ["conditionOnID", "conditionOnId", "condition_on_id"]
      .map((k) => q?.[k])
      .find((v) => v !== undefined);

  // รายการที่ “พึ่ง” แบบที่เลือก (สำหรับ modal info)
  const infoDependents = useMemo(() => {
    if (!selectedForInfo) return [];
    return questionnaires.filter((q: any) => getConditionOnId(q) === selectedForInfo.id);
  }, [selectedForInfo, questionnaires]);

  // รายการที่ “พึ่ง” แบบที่เลือก (สำหรับ modal delete)
  const deleteDependents = useMemo(() => {
    if (!selectedToDelete) return [];
    return questionnaires.filter((q: any) => getConditionOnId(q) === selectedToDelete.id);
  }, [selectedToDelete, questionnaires]);

  // โค้ดยืนยันลบ: ต้องพิมพ์ "ลบ{ชื่อ}" (ยอมรับมี/ไม่มีเว้นวรรค)
  const isDeleteCodeValid = useMemo(() => {
    if (!selectedToDelete) return false;
    const name = selectedToDelete.nameQuestionnaire || "";
    const input = deleteConfirmText.trim();
    return input === `ลบ${name}` || input === `ลบ ${name}`;
  }, [deleteConfirmText, selectedToDelete]);

  // ตรวจว่าแบบนี้ยังอยู่ใน “จัดการลำดับแบบทดสอบ” ไหม และอยู่ stage ไหนบ้าง
  const inOrderStages = useMemo(() => {
    if (!selectedToDelete) return [] as string[];
    const id = selectedToDelete.id!;
    const stages: string[] = [];
    orderBoard?.forEach((col) => {
      if (col?.items?.some((it) => it.id === id)) stages.push(col.stage);
    });
    return stages;
  }, [selectedToDelete, orderBoard]);

  const isPresentInOrder = inOrderStages.length > 0; // true = บล็อกการลบ

  /* ===== คอลัมน์ตาราง ===== */
  const questionnaireColumns: ColumnsType<Questionnaire> = [
    { title: "ลำดับ", dataIndex: "id", key: "id", align: "center", width: 80, onHeaderCell: () => ({ style: headerCellStyle }) },
    {
      title: "ชื่อแบบทดสอบ",
      dataIndex: "nameQuestionnaire",
      key: "nameQuestionnaire",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      render: (text: string) => <div className="whitespace-normal break-words">{text}</div>,
      width: 320,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      render: (text: string) => <div className="whitespace-normal break-words">{text}</div>,
      width: 420,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    { title: "จำนวนข้อ", dataIndex: "quantity", key: "quantity", align: "center", width: 120, onHeaderCell: () => ({ style: headerCellStyle }) },
    { title: "ผู้สร้าง", dataIndex: "uid", key: "uid", align: "center", render: (uid: number) => usersMap[uid] || "ไม่ทราบชื่อ", width: 160, onHeaderCell: () => ({ style: headerCellStyle }) },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center",
      render: (_: any, record: Questionnaire) => (
        <Space>
          {/* ปุ่มแก้ไข */}
          <AntButton
            icon={<SettingOutlined />}
            onClick={() => handleEdit(record)}
            className="!bg-black !text-white hover:!bg-gray-700 active:!bg-indigo-800 !border-none !shadow-none focus:!shadow-none"
          />
          {/* ปุ่มอธิบายเงื่อนไข */}
          <AntButton
            icon={<InfoCircleOutlined />}
            onClick={() => showInfoModal(record)}
            className="!w-8 !h-8 !p-0 !bg-[#5DE2FF] !text-black hover:!bg-cyan-500 active:!bg-cyan-600 !border-none !shadow-none"
            title="ดูว่าแบบทดสอบนี้เป็นเงื่อนไขของแบบทดสอบใดบ้าง"
          />
          {/* ปุ่มลบ */}
          <AntButton
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record)}
            className="!w-8 !h-8 !p-0 !bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 !border-none !shadow-none"
          />
        </Space>
      ),
      width: 180,
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 font-sans">
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

      {/* Delete modal: ปรับสีปุ่มด้วย ok/cancelButtonProps แต่ลอจิกเดิมทั้งหมด */}
      <Modal
        className="!font-ibmthai"
        title="ยืนยันการลบแบบทดสอบ ❌"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteConfirmText("");
        }}
        okText={deleteDependents.length > 0 || isPresentInOrder ? "ไม่สามารถลบได้" : "ยืนยัน"}
        cancelText="ยกเลิก"
        centered
        width={680}
        okButtonProps={{
          danger: true,
          disabled: deleteDependents.length > 0 || isPresentInOrder || !isDeleteCodeValid,
          className:
            "!rounded-xl !border-none !shadow-none " +
            "!bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 " +
            "disabled:!bg-rose-300 disabled:cursor-not-allowed",
        }}
        cancelButtonProps={{
          className:
            "!rounded-xl !border-none !shadow-none " +
            "!bg-black !text-white hover:!bg-gray-700 active:!bg-gray-800",
        }}
        rootClassName="font-sans"
      >
        <div className="space-y-3">
          {/* สรุปข้อมูลที่จะลบ */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-sm text-slate-600">กำลังลบแบบทดสอบ</div>
            <div className="font-semibold !text-red-600">
              {selectedToDelete?.nameQuestionnaire || "-"}
            </div>
            <div className="text-xs text-slate-500">
              ID: {selectedToDelete?.id ?? "-"} • จำนวนข้อ: {selectedToDelete?.quantity ?? "-"} • ผู้สร้าง:{" "}
              {selectedToDelete ? usersMap[selectedToDelete.uid] || "ไม่ทราบชื่อ" : "-"}
            </div>
          </div>

          {/* เตือน: ยังเป็นเงื่อนไขของแบบอื่น → บล็อกปุ่มยืนยัน */}
          {deleteDependents.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <ExclamationCircleOutlined className="mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800">
                    ไม่สามารถลบได้ — แบบทดสอบนี้เป็นเงื่อนไขของแบบทดสอบต่อไปนี้
                  </div>
                  <ul className="list-disc ml-6 mt-1 space-y-1 text-amber-900">
                    {deleteDependents.map((q: any) => (
                      <li key={q.id}><span className="font-medium">{q.nameQuestionnaire}</span></li>
                    ))}
                  </ul>
                  <div className="text-xs text-amber-700 mt-2">
                    โปรดยกเลิกความสัมพันธ์ (condition) ของแบบทดสอบปลายทางก่อน
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* เตือน: ยังอยู่ในลำดับการแสดงผล → บล็อกปุ่มยืนยัน + ปุ่มลัดไปหน้า manage */}
          {isPresentInOrder && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <ExclamationCircleOutlined className="mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800">
                    ไม่สามารถลบได้ — แบบทดสอบนี้ยังอยู่ใน “ลำดับการแสดงผล”
                  </div>
                  <div className="text-amber-900">
                    อยู่ในคอลัมน์: <span className="font-medium">{inOrderStages.join(", ")}</span>
                  </div>
                  <div className="text-xs text-amber-700 mt-2">
                    กรุณาไปลบออกจากหน้า <span className="font-semibold">จัดการลำดับแบบทดสอบ</span> ก่อน แล้วจึงกลับมาลบที่นี่
                  </div>
                  <div className="mt-2">
                    <AntButton
                      className="!bg-[#5DE2FF] !text-black hover:!bg-cyan-500 !border-none !rounded-xl"
                      onClick={() =>
                        navigate("/admin/manageTestOrder", {
                          state: { highlightQuestionnaireId: selectedToDelete?.id },
                        })
                      }
                    >
                      ไปที่หน้าจัดการลำดับแบบทดสอบ
                    </AntButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ช่องยืนยันโค้ดลบ: ต้องพิมพ์ ลบ{ชื่อ} (มี/ไม่มีเว้นวรรคก็ได้) */}
          <div className="pt-1">
            <p className="mb-1">
              เพื่อยืนยัน โปรดพิมพ์{" "}
              <span className="font-semibold !text-red-600">{`ลบ${selectedToDelete?.nameQuestionnaire ?? ""}`}</span>{" "}
              (รับทั้ง “ลบ{selectedToDelete?.nameQuestionnaire ?? ""}” และ “ลบ {selectedToDelete?.nameQuestionnaire ?? ""}”)
            </p>
            <Input
              placeholder={`พิมพ์: ลบ${selectedToDelete?.nameQuestionnaire ?? ""}`}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleteDependents.length > 0 || isPresentInOrder}
            />
          </div>
        </div>
      </Modal>

      {/* Info / Condition modal: เพิ่ม “ขั้นตอนก่อนลบ” + ปุ่มสีปรับเอง */}
      <Modal
        className="!font-ibmthai"
        title="แบบทดสอบนี้เป็นเงื่อนไขก่อนทำแบบทดสอบใดบ้าง?"
        open={infoModalVisible}
        onOk={() => setInfoModalVisible(false)}
        onCancel={() => setInfoModalVisible(false)}
        okText="ปิด"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        width={640}
        rootClassName="font-sans"
        okButtonProps={{
          className:
            "!rounded-xl !border-none !shadow-none " +
            "!bg-black !text-white hover:!bg-gray-700 active:!bg-gray-800",
        }}
      >
        <div className="space-y-3">
          {/* ระบุแบบทดสอบต้นทาง */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-sm text-slate-600">แบบทดสอบต้นทาง (Prerequisite)</div>
            <div className="font-semibold !text-red-600">{selectedForInfo?.nameQuestionnaire || "-"}</div>
          </div>

          {/* รายการแบบทดสอบที่ “พึ่ง” แบบนี้ */}
          {infoDependents.length === 0 ? (
            <p className="text-slate-600">ไม่เป็นเงื่อนไขของแบบทดสอบใด</p>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-700">เป็นเงื่อนไขก่อนทำแบบทดสอบต่อไปนี้:</p>
              <ul className="list-disc ml-6 space-y-1">
                {infoDependents.map((q: any) => {
                  const score = q?.conditionScore ?? q?.condition_score;
                  const type  = q?.conditionType  ?? q?.condition_type;
                  return (
                    <li key={q.id} className="break-words">
                      <span className="font-medium !text-red-600">{q.nameQuestionnaire}</span>
                      {score != null && (
                        <span className="text-slate-600"> (ต้องได้อย่างน้อย {score} คะแนน)</span>
                      )}
                      {type && (
                        <span className="ml-1 text-xs text-slate-500">[{String(type)}]</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ขั้นตอนก่อนลบ (คู่มือย่อ) */}
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
            <div className="font-semibold text-slate-800">ขั้นตอนก่อนลบ</div>
            <ol className="list-decimal ml-6 mt-2 space-y-1 text-slate-700">
              <li>
                <span className="font-medium">ตรวจสอบความสัมพันธ์</span> — ถ้าแบบทดสอบนี้ถูกใช้เป็นเงื่อนไข
                (condition) ของแบบทดสอบอื่น ให้ไปยกเลิกความสัมพันธ์ที่แบบทดสอบปลายทางก่อน
              </li>
              <li>
                <span className="font-medium">ลบออกจากลำดับการแสดงผล</span> — ไปที่หน้า
                <span className="font-semibold"> จัดการลำดับแบบทดสอบ </span>
                แล้วนำแบบทดสอบนี้ออกจากคอลัมน์ที่เกี่ยวข้อง (เช่น Pre-test / Post-test / Interval)
              </li>
            </ol>
            <div className="mt-2">
              <AntButton
                className="!bg-[#5DE2FF] !text-black hover:!bg-cyan-500 !border-none !rounded-xl"
                onClick={() =>
                  navigate("/admin/manageTestOrder", {
                    state: { highlightQuestionnaireId: selectedForInfo?.id },
                  })
                }
              >
                เปิดหน้าจัดการลำดับแบบทดสอบ
              </AntButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionnairePage;
