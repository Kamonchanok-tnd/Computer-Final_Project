import React, { useEffect, useMemo, useState } from "react";
import {Modal,Spin,Alert,Table,message,Space,Input,Select,Button as AntButton,} from "antd";
import type { ColumnsType } from "antd/es/table";
import {DeleteOutlined,SettingOutlined,SearchOutlined,PlusOutlined,TableOutlined,InfoCircleOutlined,ExclamationCircleOutlined,} from "@ant-design/icons";
import {getAllQuestionnaires,deleteQuestionnaire,getAllUsers,} from "../../../../services/https/questionnaire";
import { getQuestionnaireGroupByID } from "../../../../services/https/assessment/index"; // reuse endpoint กลุ่มลำดับ
import type { Questionnaire } from "../../../../interfaces/IQuestionnaire";
import { useLocation, useNavigate } from "react-router-dom";
import manageIcon from "../../../../assets/manage.png";

// โครงสร้างกระดานลำดับ (stage + items)
type OrderBoardCol = {
  stage: string;           // ชื่อคอลัมน์ เช่น Pre-test / Post-test
  items: Array<{ id: number; nameQuestionnaire?: string }>;
};

// ID กลุ่มตามฝั่ง backend ที่ใช้สร้างกระดานลำดับ
const ORDER_GROUP_IDS = [1, 2, 3];

const QuestionnairePage: React.FC = () => {
  
  // message/toast ของ antd
  const [msgApi, contextHolder] = message.useMessage();

  // สเตตรายการแบบคัดกรอง + สถานะโหลด/หลังฟิลเตอร์
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] =
    useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(true);

  // โมดัลลบ + state ที่เลือกจะลบ + ข้อความยืนยัน
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] =
    useState<Questionnaire | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // โมดัลดูความสัมพันธ์ 
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedForInfo, setSelectedForInfo] =
    useState<Questionnaire | null>(null);

  // map ผู้ใช้ (uid > username) สำหรับโชว์ชื่อคนสร้าง
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});
  const [searchText, setSearchText] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");

  // ข้อมูลกระดานลำดับ (ใช้ตรวจบล็อกการลบถ้าแบบคัดกรองยังอยู่ใน sequence)
  const [orderBoard, setOrderBoard] = useState<OrderBoardCol[]>([]);

  const navigate = useNavigate();
  const location = useLocation() as any;

  // helper: นำทางตาม role (admin/superadmin)
  function getRolePath(subPath: string) {
    const role = localStorage.getItem("role");
    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
    navigate(`/${rolePrefix}/${subPath}`);
  }

  // อ่าน flash จากหน้าอื่น (เช่น บันทึกสำเร็จ) แล้วโชว์ครั้งเดียว
  useEffect(() => {
    const flash = location.state?.flash as
      | { type: "success" | "error"; content: string }
      | undefined;
    if (flash && !window.history.state?.flash) {
      flash.type === "success"
        ? msgApi.success(flash.content)
        : msgApi.error(flash.content);
      // ป้องกันแสดงซ้ำเมื่อ back/forward
      window.history.replaceState(
        { flash },
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }, [location.state]);

  // โหลดข้อมูลเริ่มต้น (รายการแบบคัดกรอง, ผู้ใช้, กระดานลำดับ)
  useEffect(() => {
    loadQuestionnaires();
    loadUsers();
    loadOrderBoard();
  }, []);

  // เรียก API: ดึงรายการแบบคัดกรองทั้งหมด
  const loadQuestionnaires = async () => {
    setLoadingQuestionnaires(true);
    try {
      const data = await getAllQuestionnaires();
      setQuestionnaires(data);
      setFilteredQuestionnaires(data);
    } catch (err) {
      msgApi.error("เกิดข้อผิดพลาดในการโหลดแบบคัดกรอง");
      console.error(err);
    } finally {
      setLoadingQuestionnaires(false);
    }
  };

  // เรียก API: ดึงผู้ใช้ทั้งหมดเพื่อทำ uid > username
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

  // เรียก API: ดึงข้อมูลกระดานลำดับตาม group ids
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
            nameQuestionnaire: q.name, // ชื่อฟิลด์ตามฝั่ง manage
          })),
        });
      }
      setOrderBoard(board);
    } catch (e) {
      // ถ้าโหลดไม่ได้ ให้ถือว่าไม่มีการอยู่ในลำดับ (ไม่บล็อกการทำงานอื่น)
      setOrderBoard([]);
    }
  };

  //* Actions: เปิดโมดัลลบ/ข้อมูลความสัมพันธ์/แก้ไข
  const showDeleteModal = (questionnaire: Questionnaire) => {
    setSelectedToDelete(questionnaire);
    setDeleteConfirmText("");
    setDeleteModalVisible(true);
    loadOrderBoard(); // รีเฟรชบอร์ดก่อนเช็กบล็อก
  };

  const showInfoModal = (questionnaire: Questionnaire) => {
    setSelectedForInfo(questionnaire);
    setInfoModalVisible(true);
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    const role = localStorage.getItem("role");
    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
    navigate(`/${rolePrefix}/editQuestionnaire`, {
      state: { questionnaireId: questionnaire.id },
    });
  };

  const handleConfirmDelete = async () => {
    // ยืนยันลบ > เรียก API > รีโหลดหน้าจอ
    if (!selectedToDelete) return;
    try {
      await deleteQuestionnaire(selectedToDelete.id!);
      setDeleteModalVisible(false);
      setDeleteConfirmText("");
      msgApi.success("ลบข้อมูลสำเร็จ");
      await loadQuestionnaires();
      await loadOrderBoard();
    } catch (error) {
      msgApi.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  //* ค้นหาและเรียงลำดับ
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    filterAndSort(value, sortOption);
  };

  // รวมฟิลเตอร์ + sort ตามตัวเลือก UI
  const filterAndSort = (searchValue: string, sortKey: string) => {
    let data = [...questionnaires];

    // ฟิลเตอร์ด้วยชื่อแบบคัดกรองหรือชื่อผู้สร้าง
    if (searchValue.trim() !== "") {
      data = data.filter((q) => {
        const userName = usersMap[q.uid] || "";
        return (
          q.nameQuestionnaire
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          userName.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

    // ตัวเลือกการเรียง (ชื่อ/คำอธิบาย/ผู้สร้าง/จำนวนข้อ/ID)
    switch (sortKey) {
      case "nameAsc":
        data.sort((a, b) =>
          a.nameQuestionnaire.localeCompare(b.nameQuestionnaire, "th", {
            sensitivity: "base",
          })
        );
        break;
      case "nameDesc":
        data.sort((a, b) =>
          b.nameQuestionnaire.localeCompare(a.nameQuestionnaire, "th", {
            sensitivity: "base",
          })
        );
        break;
      case "descriptionAsc":
        data.sort((a, b) =>
          a.description.localeCompare(b.description, "th", {
            sensitivity: "base",
          })
        );
        break;
      case "descriptionDesc":
        data.sort((a, b) =>
          b.description.localeCompare(a.description, "th", {
            sensitivity: "base",
          })
        );
        break;
      case "authorAsc":
        data.sort((a, b) =>
          (usersMap[a.uid] || "").localeCompare(usersMap[b.uid] || "", "th", {
            sensitivity: "base",
          })
        );
        break;
      case "authorDesc":
        data.sort((a, b) =>
          (usersMap[b.uid] || "").localeCompare(usersMap[a.uid] || "", "th", {
            sensitivity: "base",
          })
        );
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

  // สีหัวตาราง
  const headerCellStyle = {
    backgroundColor: "#5DE2FF",
    color: "#0f172a",
    fontWeight: 600,
  } as const;

  // ความสัมพันธ์/ลำดับ
  // คืนค่าฟิลด์ conditionOnID (รองรับ naming หลายแบบจาก Backend)
  const getConditionOnId = (q: any) =>
    ["conditionOnID", "conditionOnId", "condition_on_id"]
      .map((k) => q?.[k])
      .find((v) => v !== undefined);

  // แบบคัดกรองที่พึ่ง selectedForInfo (ไว้แสดงใน modal info)
  const infoDependents = useMemo(() => {
    if (!selectedForInfo) return [];
    return questionnaires.filter(
      (q: any) => getConditionOnId(q) === selectedForInfo.id
    );
  }, [selectedForInfo, questionnaires]);

  // แบบคัดกรองที่พึ่ง selectedToDelete (ไว้บล็อกการลบ)
  const deleteDependents = useMemo(() => {
    if (!selectedToDelete) return [];
    return questionnaires.filter(
      (q: any) => getConditionOnId(q) === selectedToDelete.id
    );
  }, [selectedToDelete, questionnaires]);

  // ตรวจโค้ดยืนยันลบถูกต้องหรือยัง (ลบ{ชื่อ} / ลบ {ชื่อ})
  const isDeleteCodeValid = useMemo(() => {
    if (!selectedToDelete) return false;
    const name = selectedToDelete.nameQuestionnaire || "";
    const input = deleteConfirmText.trim();
    return input === `ลบ${name}` || input === `ลบ ${name}`;
  }, [deleteConfirmText, selectedToDelete]);

  // หา stage ที่รายการนี้ยังคงอยู่ในจัดการลำดับแบบคัดกรอง
  const inOrderStages = useMemo(() => {
    if (!selectedToDelete) return [] as string[];
    const id = selectedToDelete.id!;
    const stages: string[] = [];
    orderBoard?.forEach((col) => {
      if (col?.items?.some((it) => it.id === id)) stages.push(col.stage);
    });
    return stages;
  }, [selectedToDelete, orderBoard]);

  const isPresentInOrder = inOrderStages.length > 0; // ถ้าอยู่ในลำดับ > บล็อกการลบ

  // คอลัมน์ตารางหลัก
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
      title: "ชื่อแบบคัดกรอง",
      dataIndex: "nameQuestionnaire",
      key: "nameQuestionnaire",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      render: (text: string) => (
        <div className="whitespace-normal break-words">{text}</div>
      ),
      width: 320,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      render: (text: string) => (
        <div className="whitespace-normal break-words">{text}</div>
      ),
      width: 420,
      responsive: ["xs", "sm", "md", "lg", "xl"],
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
          {/* ปุ่มแก้ไขแบบคัดกรอง */}
          <AntButton
            icon={<SettingOutlined />}
            onClick={() => handleEdit(record)}
            className="!bg-black !text-white hover:!bg-gray-700 active:!bg-indigo-800 !border-none !shadow-none focus:!shadow-none"
          />
          {/* ปุ่มดูความสัมพันธ์ */}
          <AntButton
            icon={<InfoCircleOutlined />}
            onClick={() => showInfoModal(record)}
            className="!w-8 !h-8 !p-0 !bg-[#5DE2FF] !text-black hover:!bg-cyan-500 active:!bg-cyan-600 !border-none !shadow-none"
            title="ดูว่าแบบคัดกรองนี้เป็นเงื่อนไขของแบบคัดกรองใดบ้าง"
          />
          {/* ปุ่มลบ (จะถูกบล็อกในโมดัลถ้ามีความสัมพันธ์/ยังอยู่ในลำดับ) */}
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

      {/* หัวเรื่อง: ชื่อหน้า + ปุ่มทางลัด */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={manageIcon}
            alt="manage icon"
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          จัดการแบบคัดกรองสุขภาพจิต
          </h2>
        </div>
       

        {/* ปุ่ม: จัดการลำดับ / สร้างใหม่ */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-300 bg-[#5DE2FF] hover:bg-cyan-500 transition"
            onClick={() => getRolePath("manageTestOrder")}
          >
            <TableOutlined />
            <span>จัดการลำดับ</span>
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm text-black bg-[#5DE2FF] hover:bg-cyan-500 transition"
            onClick={() => getRolePath("createQuestionnaire")}
          >
            <PlusOutlined />
            <span>สร้าง</span>
          </button>
        </div>
      </div>

      {/* แถบค้นหา เเละ ตัวเลือกเรียง (sort) */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="order-1 md:order-none md:col-span-9">
          <Input
            placeholder="ค้นหาแบบคัดกรองหรือผู้สร้าง..."
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
              { value: "nameAsc", label: "ชื่อแบบคัดกรอง (ก → ฮ)" },
              { value: "nameDesc", label: "ชื่อแบบคัดกรอง (ฮ → ก)" },
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

      {/* ตารางหลัก */}
      <div className="mt-4">
        {loadingQuestionnaires ? (
          <div className="flex items-center justify-center py-16">
            <Spin tip="กำลังโหลดแบบคัดกรอง..." />
          </div>
        ) : filteredQuestionnaires.length === 0 ? (
          <Alert message="ไม่พบแบบคัดกรอง" type="info" showIcon />
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

      {/* โมดัลลบ: บล็อกปุ่มยืนยันถ้ายังมีความสัมพันธ์/ยังอยู่ในลำดับ */}
      <Modal
        className="!font-ibmthai"
        title="ยืนยันการลบแบบคัดกรอง ❌"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteConfirmText("");
        }}
        okText={
          deleteDependents.length > 0 || isPresentInOrder
            ? "ไม่สามารถลบได้"
            : "ยืนยัน"
        }
        cancelText="ยกเลิก"
        centered
        width={680}
        okButtonProps={{
          danger: true,
          disabled:
            deleteDependents.length > 0 ||
            isPresentInOrder ||
            !isDeleteCodeValid,
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
          {/* สรุปรายการที่จะลบ */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-sm text-slate-600">กำลังลบแบบคัดกรอง</div>
            <div className="font-semibold !text-red-600">
              {selectedToDelete?.nameQuestionnaire || "-"}
            </div>
            <div className="text-xs text-slate-500">
              ID: {selectedToDelete?.id ?? "-"} • จำนวนข้อ:{" "}
              {selectedToDelete?.quantity ?? "-"} • ผู้สร้าง:{" "}
              {selectedToDelete ? usersMap[selectedToDelete.uid] || "ไม่ทราบชื่อ" : "-"}
            </div>
          </div>

          {/* เตือน: มีแบบอื่นพึ่งอยู่ > ห้ามลบ */}
          {deleteDependents.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <ExclamationCircleOutlined className="mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800">
                    ไม่สามารถลบได้ — แบบคัดกรองนี้เป็นเงื่อนไขของแบบคัดกรองต่อไปนี้
                  </div>
                  <ul className="list-disc ml-6 mt-1 space-y-1 text-amber-900">
                    {deleteDependents.map((q: any) => (
                      <li key={q.id}>
                        <span className="font-medium">{q.nameQuestionnaire}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-amber-700 mt-2">
                    โปรดยกเลิกความสัมพันธ์ (condition) ของแบบคัดกรองปลายทางก่อน
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* เตือน: ยังอยู่ในจัดการลำดับ > ห้ามลบ + ปุ่มลัดไปหน้าจัดการลำดับ */}
          {isPresentInOrder && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <ExclamationCircleOutlined className="mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800">
                    ไม่สามารถลบได้ — แบบคัดกรองนี้ยังอยู่ใน “ลำดับการแสดงผล”
                  </div>
                  <div className="text-amber-900">
                    อยู่ในคอลัมน์:{" "}
                    <span className="font-medium">{inOrderStages.join(", ")}</span>
                  </div>
                  <div className="text-xs text-amber-700 mt-2">
                    กรุณาไปลบออกจากหน้า{" "}
                    <span className="font-semibold">จัดการลำดับแบบคัดกรอง</span>{" "}
                    ก่อน แล้วจึงกลับมาลบที่นี่
                  </div>
                  <div className="mt-2">
                  <AntButton
                  className="!bg-[#5DE2FF] !text-black hover:!bg-cyan-500 !border-none !rounded-xl"
                  onClick={() => {
                    const role = localStorage.getItem("role");
                    const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
                    navigate(`/${rolePrefix}/manageTestOrder`, {
                      state: { highlightQuestionnaireId: selectedToDelete?.id },
                    });
                  }}
                >
                  ไปที่หน้าจัดการลำดับแบบคัดกรอง
                </AntButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ช่องยืนยันโค้ดลบ */}
          <div className="pt-1">
            <p className="mb-1">
              เพื่อยืนยัน โปรดพิมพ์{" "}
              <span className="font-semibold !text-red-600">{`ลบ${
                selectedToDelete?.nameQuestionnaire ?? ""
              }`}</span>{" "}
              (รับทั้ง “ลบ{selectedToDelete?.nameQuestionnaire ?? ""}” และ “ลบ{" "}
              {selectedToDelete?.nameQuestionnaire ?? ""}”)
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

      {/* โมดัลข้อมูลความสัมพันธ์: แสดงรายการที่พึ่งแบบคัดกรองนี้ + คู่มือย่อก่อนลบ */}
      <Modal
        className="!font-ibmthai"
        title="แบบคัดกรองนี้เป็นเงื่อนไขก่อนทำแบบคัดกรองใดบ้าง?"
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
            "!rounded-xl !border-none !shadow-none !bg-black !text-white hover:!bg-gray-700 active:!bg-gray-800",
        }}
      >
        <div className="space-y-3">
          {/* ระบุแบบคัดกรองต้นทาง */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-sm text-slate-600">แบบคัดกรองต้นทาง (Prerequisite)</div>
            <div className="font-semibold !text-red-600">
              {selectedForInfo?.nameQuestionnaire || "-"}
            </div>
          </div>

          {/* รายการปลายทางที่พึ่งแบบคัดกรองนี้ */}
          {infoDependents.length === 0 ? (
            <p className="text-slate-600">ไม่เป็นเงื่อนไขของแบบคัดกรองใด</p>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-700">เป็นเงื่อนไขก่อนทำแบบคัดกรองต่อไปนี้:</p>
              <ul className="list-disc ml-6 space-y-1">
                {infoDependents.map((q: any) => {
                  const score = q?.conditionScore ?? q?.condition_score;
                  const type = q?.conditionType ?? q?.condition_type;
                  return (
                    <li key={q.id} className="break-words">
                      <span className="font-medium !text-red-600">
                        {q.nameQuestionnaire}
                      </span>
                      {score != null && (
                        <span className="text-slate-600">
                          {" "}
                          (ต้องได้อย่างน้อย {score} คะแนน)
                        </span>
                      )}
                      {type && (
                        <span className="ml-1 text-xs text-slate-500">
                          [{String(type)}]
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* คู่มือย่อ: ขั้นตอนก่อนลบ */}
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
            <div className="font-semibold text-slate-800">ขั้นตอนก่อนลบ</div>
            <ol className="list-decimal ml-6 mt-2 space-y-1 text-slate-700">
              <li>
                <span className="font-medium">ตรวจสอบความสัมพันธ์</span> — ถ้าแบบคัดกรองนี้ถูกใช้เป็นเงื่อนไข
                ให้ไปยกเลิกที่แบบคัดกรองปลายทางก่อน
              </li>
              <li>
                <span className="font-medium">ลบออกจากลำดับการแสดงผล</span> — ไปที่หน้า
                <span className="font-semibold"> จัดการลำดับแบบคัดกรอง </span>
                แล้วนำแบบคัดกรองนี้ออกจากคอลัมน์ที่เกี่ยวข้อง
              </li>
            </ol>
            <div className="mt-2">
             <AntButton
              className="!bg-[#5DE2FF] !text-black hover:!bg-cyan-500 !border-none !rounded-xl"
              onClick={() => {
                const role = localStorage.getItem("role");
                const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
                navigate(`/${rolePrefix}/manageTestOrder`, {
                  state: { highlightQuestionnaireId: selectedForInfo?.id },
                });
              }}
            >
              เปิดหน้าจัดการลำดับแบบคัดกรอง
            </AntButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionnairePage;
