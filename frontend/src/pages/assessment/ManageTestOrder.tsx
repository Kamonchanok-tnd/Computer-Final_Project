import React, { useState, useEffect, useRef } from "react"; // UPDATED
import { Plus, GripVertical } from "lucide-react";
import {
  getQuestionnaireGroupByID,
  getAvailableQuestionnairesForGroup,
  addQuestionnaireToGroup,
  removeQuestionnaireFromGroup,
  updateQuestionnaireGroupOrder,
  updateGroupFrequency,
} from "../../services/https/assessment/index";
import iconas from "../../assets/assessment/priority1.png";
import iconadd from "../../assets/assessment/add.png";
import icondelete from "../../assets/assessment/delete.png";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover, InputNumber, Button, message, Modal } from "antd";
import { EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface Questionnaire {
  id: number;
  name: string;
  order_in_group: number;
  condition_on_id?: number;
  condition_score?: number;
}

interface Column {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  editable?: boolean;
  intervalDays?: number;
}

const SortableItem = ({
  id,
  children,
  disabled = false,
}: {
  id: number | string; // UPDATED: ให้รองรับ tail id (string)
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? "z-50" : undefined}
    >
      {children}
    </div>
  );
};

// ADDED: Drop zone ท้ายลิสต์ ช่วยให้วาง “เป็นอันสุดท้าย” ได้แม่น
const DropTail = ({ id }: { id: string }) => {
  const { setNodeRef, isOver } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`h-6 rounded border-2 border-dashed transition-all ${
        isOver ? "border-blue-400 bg-blue-50" : "border-transparent"
      }`}
      aria-hidden // เป็นแค่โซนรับ drop ไม่ใช่ UI จริง
    />
  );
};

// ADDED: tail id helper (หนึ่งอันต่อคอลัมน์)
const tailId = (columnId: number) => `__tail_${columnId}`;

const ManageTestOrder: React.FC = () => {
  const [draggedDays, setDraggedDays] = useState<number>(0);
  const [columns, setColumns] = useState<Column[]>([]);
  const [questionnaireMap, setQuestionnaireMap] = useState<
    Record<number, Questionnaire[]>
  >({});
  const [dropdownGroupId, setDropdownGroupId] = useState<number | null>(null);
  const [availableList, setAvailableList] = useState<
    { id: number; name: string }[]
  >([]);
  const [isDragMode, setIsDragMode] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  const stopDrag = {
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
  };

  const groupIDs = [1, 2, 3];
  const colors = [
    "bg-purple-100 border-purple-200",
    "bg-blue-100 border-blue-200",
    "bg-yellow-100 border-yellow-200",
  ];

  useEffect(() => {
    const fetchAllGroups = async () => {
      const allCols: Column[] = [];
      const qMap: Record<number, Questionnaire[]> = {};

      for (let i = 0; i < groupIDs.length; i++) {
        const id = groupIDs[i];
        const group = await getQuestionnaireGroupByID(id);
        if (!group) continue;

        if (group.id === 3) {
          const daysFromDB = Number(group.frequency_days ?? 14);
          setDraggedDays(daysFromDB);
          allCols.push({
            id: group.id,
            title: group.name,
            subtitle: `📅 ทุกๆ ${daysFromDB} วัน`,
            color: colors[i],
            editable: true,
            intervalDays: daysFromDB,
          });
        } else {
          allCols.push({
            id: group.id,
            title: group.name,
            subtitle: group.description,
            color: colors[i],
            editable: false,
            intervalDays: group.frequency_days ?? undefined,
          });
        }

        qMap[group.id] = Array.isArray(group.questionnaires)
          ? group.questionnaires.map((q: any) => ({
              id: q.id,
              name: q.name,
              order_in_group: q.order_in_group,
              condition_on_id: q.condition_on_id,
              condition_score: q.condition_score,
            }))
          : [];
      }

      setColumns(allCols);
      setQuestionnaireMap(qMap);
    };

    fetchAllGroups();
  }, []);

  useEffect(() => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === 3
          ? {
              ...col,
              subtitle: `📅ทุกๆ ${draggedDays} วัน`,
              intervalDays: draggedDays,
            }
          : col
      )
    );
  }, [draggedDays]);

  const handleToggleDropdown = async (groupId: number) => {
    if (!dropdownGroupId || dropdownGroupId !== groupId) {
      setIsDragMode(false);
    }

    if (dropdownGroupId === groupId) {
      setDropdownGroupId(null);
      setAvailableList([]);
    } else {
      setDropdownGroupId(groupId);
      const list = await getAvailableQuestionnairesForGroup(groupId);
      setAvailableList(list ?? []);
    }
  };

  const handleAddToGroup = async (qid: number) => {
    if (dropdownGroupId === null) return;
    const res = await addQuestionnaireToGroup(dropdownGroupId, qid);
    try {
      if (res?.message_th) {
        message.success(res.message_th);
      } else if (res?.message) {
        message.success(res.message);
      } else {
        message.success("เพิ่มข้อมูลสำเร็จ");
      }
    } catch (e) {
      message.success("เพิ่มข้อมูลสำเร็จ");
    }
    const updatedGroup = await getQuestionnaireGroupByID(dropdownGroupId);
    setQuestionnaireMap((prev) => ({
      ...prev,
      [dropdownGroupId]: updatedGroup.questionnaires,
    }));
    setDropdownGroupId(null);
    setAvailableList([]);
  };

  // ADDED: click outside เพื่อหุบเมนู
  const dropdownAnchors = useRef<Record<number, HTMLDivElement | null>>({});
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownGroupId == null) return;
      const anchor = dropdownAnchors.current[dropdownGroupId];
      if (anchor && !anchor.contains(e.target as Node)) {
        setDropdownGroupId(null);
        setAvailableList([]);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dropdownGroupId != null) {
        setDropdownGroupId(null);
        setAvailableList([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [dropdownGroupId]);

  const handleRemoveFromGroup = async (groupId: number, qid: number) => {
    try {
      const group = questionnaireMap[groupId] ?? [];
      const target = group.find((q) => q.id === qid);
      const children = group.filter((q) => q.condition_on_id === qid);
      const hasChildren = children.length > 0;

      // ✅ กล่องยืนยันก่อนลบ
      Modal.confirm({
        title: "ยืนยันการลบแบบทดสอบสุขภาพจิต",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div className="text-sm">
            <div>
              คุณต้องการลบ <b>{target?.name ?? `ID ${qid}`}</b> ใช่หรือไม่?
            </div>
            {hasChildren && (
              <div className="mt-1">
                รายการนี้มี “แบบทดสอบสุขภาพจิตลูก” อีก {children.length}{" "}
                รายการที่จะถูกลบไปด้วย:
                <ul className="list-disc ml-5 mt-1">
                  {children.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
        okText: "ลบ",
        okButtonProps: { danger: true },
        cancelText: "ยกเลิก",
        async onOk() {
          const idsToRemove = [qid, ...children.map((c) => c.id)];

          const hide = message.loading("กำลังลบแบบทดสอบสุขภาพจิต...", 0);
          try {
            for (const id of idsToRemove) {
              await removeQuestionnaireFromGroup(groupId, id);
            }

            const updatedGroup = await getQuestionnaireGroupByID(groupId);
            setQuestionnaireMap((prev) => ({
              ...prev,
              [groupId]: updatedGroup.questionnaires,
            }));

            hide();
            message.success(
              hasChildren
                ? `ลบ “${target?.name ?? qid}” พร้อมลูกอีก ${
                    children.length
                  } รายการเรียบร้อย`
                : `ลบ “${target?.name ?? qid}” เรียบร้อย`
            );
          } catch (err) {
            hide();
            message.error("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            console.error(err);
          }
        },
      });
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเตรียมลบ");
      console.error("❌ เกิดข้อผิดพลาดในการลบ:", error);
    }
  };

  const getTasksForColumn = (columnId: number) =>
    questionnaireMap[columnId] ?? [];

  /** รวมข้อมูลเป็น “บล็อกกลุ่ม” (แม่+ลูก) พร้อม index ช่วง */
  const getGroups = (list: Questionnaire[]) => {
    const ids = list.map((q) => q.id);
    return list
      .filter((q) => !q.condition_on_id)
      .map((parent) => {
        const groupIds = [
          parent.id,
          ...list
            .filter((x) => x.condition_on_id === parent.id)
            .map((c) => c.id),
        ];
        const idxs = groupIds
          .map((id) => ids.indexOf(id))
          .sort((a, b) => a - b);
        return {
          parentId: parent.id,
          ids: groupIds,
          start: idxs[0],
          end: idxs[idxs.length - 1],
        };
      })
      .sort((a, b) => a.start - b.start);
  };

  const onDragEnd = async (event: DragEndEvent, columnId: number) => {
    if (!isDragMode) return;

    const { active, over } = event;
    if (!over) {
      // ปล่อยในช่องว่าง → วางท้ายสุด
      const tasks = getTasksForColumn(columnId);
      const activeId = Number(active.id);
      const fromIndex = tasks.findIndex((q) => q.id === activeId);
      if (fromIndex === -1) return;

      const groupToMove = tasks.filter(
        (q) => q.id === activeId || q.condition_on_id === activeId
      );
      const reordered = [...tasks];
      reordered.splice(fromIndex, groupToMove.length);
      reordered.push(...groupToMove);

      setQuestionnaireMap((prev) => ({ ...prev, [columnId]: reordered }));
      try {
        await updateQuestionnaireGroupOrder(
          columnId,
          reordered.map((q) => q.id)
        );
        message.success("อัปเดตลำดับเรียบร้อย");
      } catch {
        message.error("อัปเดตลำดับไม่สำเร็จ");
      }
      return;
    }

    if (active.id === over.id) return;

    const activeId = Number(active.id);
    const overRaw = over.id;
    const tasks = getTasksForColumn(columnId);
    const dragged = tasks.find((q) => q.id === activeId);

    // ❌ ห้ามลากลูก
    if (dragged?.condition_on_id) return;

    const ids = tasks.map((q) => q.id);
    const fromIndex = ids.indexOf(activeId);

    // tail?
    const isTail = overRaw === tailId(columnId);
    const overIndex = isTail ? tasks.length : ids.indexOf(Number(overRaw));
    const movingDown = overIndex > fromIndex;

    // กลุ่มแม่-ลูกในคอลัมน์
    const groups = getGroups(tasks);
    const activeGroup = groups.find((g) => g.parentId === activeId);
    const overGroup = isTail
      ? null
      : groups.find((g) => g.ids.includes(Number(overRaw)));

    // ✅ กติกาใหม่: ถ้าลากขึ้น → วางก่อนกลุ่มเป้าหมาย, ถ้าลากลง → วางหลังกลุ่มเป้าหมาย
    let toIndex: number;
    if (isTail) {
      toIndex = tasks.length;
    } else if (
      overGroup &&
      (!activeGroup || overGroup.parentId !== activeGroup.parentId)
    ) {
      toIndex = movingDown ? overGroup.end + 1 : overGroup.start;
    } else {
      toIndex = overIndex;
    }

    // ย้ายเป็น “ก้อน” แม่+ลูก
    const block = tasks.filter(
      (q) => q.id === activeId || q.condition_on_id === activeId
    );
    const blockLen = block.length;

    let insertIndex = toIndex;
    if (fromIndex < insertIndex) insertIndex -= blockLen; // ขยับเป้าหมายเมื่อเราถอดก้อนออกแล้ว

    insertIndex = Math.max(
      0,
      Math.min(insertIndex, tasks.length - blockLen + 1)
    );

    const reordered = [...tasks];
    reordered.splice(fromIndex, blockLen);
    reordered.splice(insertIndex, 0, ...block);

    setQuestionnaireMap((prev) => ({
      ...prev,
      [columnId]: reordered,
    }));

    try {
      await updateQuestionnaireGroupOrder(
        columnId,
        reordered.map((q) => q.id)
      );
      message.success("อัปเดตลำดับเรียบร้อย");
    } catch {
      message.error("อัปเดตลำดับไม่สำเร็จ");
    }
  };

  const [editingFrequency, setEditingFrequency] = useState<{
    groupId: number;
    value: number;
  } | null>(null);

  const handleSaveFrequency = async () => {
    if (!editingFrequency) return;

    const { groupId, value } = editingFrequency;
    const hide = message.loading("กำลังอัปเดตจำนวนวัน...", 0);
    try {
      await updateGroupFrequency(groupId, value);
      setDraggedDays(value);
      setEditingFrequency(null);
      hide();
      message.success(`อัปเดตความถี่เป็นทุก ๆ ${value} วันแล้ว`);
    } catch (err) {
      hide();
      message.error("อัปเดตความถี่ไม่สำเร็จ");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <img src={iconas} alt="priority" className="w-10 h-10" />
          จัดการลำดับการแสดงแบบทดสอบสุขภาพจิต
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const tasks = getTasksForColumn(column.id);
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 border-2 border-dashed`}
            >
              <div className="font-ibmthai flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {tasks.length}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {column.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {column.subtitle}
                      {column.editable && (
                        <Popover
                          content={
                            <div className="flex flex-col gap-2">
                              <InputNumber
                                min={1}
                                value={editingFrequency?.value}
                                onChange={(val) =>
                                  setEditingFrequency((prev) =>
                                    prev
                                      ? { ...prev, value: val ?? prev.value }
                                      : prev
                                  )
                                }
                              />
                              <Button
                                type="primary"
                                size="small"
                                onClick={handleSaveFrequency}
                              >
                                บันทึก
                              </Button>
                            </div>
                          }
                          title="แก้ไขจำนวนวัน"
                          trigger="click"
                          open={editingFrequency?.groupId === column.id}
                          onOpenChange={(visible) => {
                            if (visible) {
                              setEditingFrequency({
                                groupId: column.id,
                                value: column.intervalDays ?? 7,
                              });
                            } else {
                              setEditingFrequency(null);
                            }
                          }}
                        >
                          <button
                            className="ml-1 p-1 rounded hover:bg-gray-200"
                            title="แก้ไขจำนวนวัน"
                          >
                            <EditOutlined className="text-gray-500" />
                          </button>
                        </Popover>
                      )}
                    </p>
                  </div>
                </div>

                {/* ปุ่มสลับโหมดลาก-จัดเรียง + ปุ่มเพิ่ม (Plus) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsDragMode((v) => {
                        const next = !v;
                        if (next) {
                          setDropdownGroupId(null);
                          setAvailableList([]);
                        }
                        return next;
                      });
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isDragMode
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-600"
                    } ${
                      dropdownGroupId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="โหมดจัดลำดับ"
                    aria-label="โหมดจัดลำดับ"
                    disabled={!!dropdownGroupId}
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  <div
                    className="relative"
                    ref={(el) => {
                      dropdownAnchors.current[column.id] = el;
                    }}
                  >
                    <button
                      onClick={() => handleToggleDropdown(column.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isDragMode
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-gray-50 text-gray-600"
                      }`}
                      title="เพิ่มแบบทดสอบสุขภาพจิต"
                      aria-label="เพิ่มแบบทดสอบสุขภาพจิต"
                      disabled={isDragMode}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {dropdownGroupId === column.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow z-10">
                        {availableList.length === 0 ? (
                          <p className="p-2 text-sm text-gray-500">
                            ไม่มีแบบทดสอบสุขภาพจิตใหม่
                          </p>
                        ) : (
                          <ul className="p-2 space-y-1">
                            {availableList.map((q) => (
                              <li
                                key={q.id}
                                className="flex justify-between items-center text-sm hover:bg-gray-100 px-2 py-1 rounded"
                              >
                                <span>{q.name}</span>
                                <button
                                  onClick={() => handleAddToGroup(q.id)}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <img
                                    src={iconadd}
                                    alt="add"
                                    className="w-4 h-4"
                                  />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                measuring={{
                  droppable: { strategy: MeasuringStrategy.Always },
                }}
                onDragEnd={(e) => onDragEnd(e, column.id)}
              >
                <SortableContext
                  // UPDATED: เติม tail id ต่อท้ายรายการ เพื่อให้มีจุดวางท้ายลิสต์จริง ๆ
                  items={[...tasks.map((q) => q.id), tailId(column.id)]}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {tasks.map((q) => (
                      <SortableItem
                        key={q.id}
                        id={q.id}
                        disabled={!isDragMode || !!q.condition_on_id}
                      >
                        <div
                          className={`relative bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                            isDragMode ? "cursor-move" : ""
                          }`}
                        >
                          {isDragMode && (
                            <div
                              className={`absolute right-2 top-1/2 -translate-y-1/2
                ${
                  q.condition_on_id
                    ? "opacity-30 cursor-not-allowed"
                    : "opacity-100"
                }
               `}
                              title={
                                q.condition_on_id
                                  ? "รายการย่อย — ลากไม่ได้"
                                  : "กดค้างเพื่อจัดลำดับ"
                              }
                            >
                              <GripVertical className="w-5 h-5 text-gray-500" />
                            </div>
                          )}

                          {/* เนื้อหาในการ์ด */}
                          <div className="flex flex-col gap-2">
                            <h4 className="font-semibold text-gray-900 pr-10">
                              {q.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              เงื่อนไข📝 :{" "}
                              {q.condition_score != null
                                ? `ถ้าคะแนน >= ${q.condition_score}`
                                : "-"}
                            </p>
                          </div>

                          {/* ปุ่มลบโชว์ตอนปิด drag mode */}
                          {!isDragMode && (
                            <button
                              {...stopDrag}
                              onClick={() =>
                                handleRemoveFromGroup(column.id, q.id)
                              }
                              className="absolute right-2 top-2 p-1 rounded hover:bg-red-50 transition-colors"
                              title="ลบแบบทดสอบสุขภาพจิต"
                            >
                              <img
                                src={icondelete}
                                alt="delete"
                                className="w-7 h-7"
                              />
                            </button>
                          )}
                        </div>
                      </SortableItem>
                    ))}

                    {/* ADDED: โซนวางท้ายลิสต์ */}
                    <SortableItem id={tailId(column.id)} disabled>
                      <DropTail id={tailId(column.id)} />
                    </SortableItem>

                    {tasks.length === 0 && (
                      <p className="text-gray-500 text-sm italic">
                        ไม่มีแบบทดสอบสุขภาพจิตในกลุ่มนี้
                      </p>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageTestOrder;
