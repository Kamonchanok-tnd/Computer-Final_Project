import React, { useState, useEffect } from "react";
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
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover, InputNumber, Button } from "antd";
import {
  EditOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

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
  id: number;
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

const ManageTestOrder: React.FC = () => {
  const [draggedDays, setDraggedDays] = useState<number>(0);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [questionnaireMap, setQuestionnaireMap] = useState<
    Record<number, Questionnaire[]>
  >({});
  const [dropdownGroupId, setDropdownGroupId] = useState<number | null>(null);
  const [availableList, setAvailableList] = useState<
    { id: number; name: string }[]
  >([]);
  const [isDragMode, setIsDragMode] = useState<boolean>(false);

  console.log("🧪:", showSaveButton);

  const groupIDs = [1, 2, 3];
  const colors = [
    "bg-purple-100 border-purple-200",
    "bg-blue-100 border-blue-200",
    "bg-yellow-100 border-yellow-200",
  ];

  const sensors = useSensors(useSensor(PointerSensor));

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
          setDraggedDays(daysFromDB); // ← ตั้งค่าจาก DB
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
    await addQuestionnaireToGroup(dropdownGroupId, qid);
    const updatedGroup = await getQuestionnaireGroupByID(dropdownGroupId);
    setQuestionnaireMap((prev) => ({
      ...prev,
      [dropdownGroupId]: updatedGroup.questionnaires,
    }));
    setDropdownGroupId(null);
    setAvailableList([]);
  };

  const handleRemoveFromGroup = async (groupId: number, qid: number) => {
    try {
      const group = questionnaireMap[groupId];
      const hasChildren = group.some((q) => q.condition_on_id === qid);
      let idsToRemove = [qid];
      if (hasChildren) {
        const children = group.filter((q) => q.condition_on_id === qid);
        idsToRemove.push(...children.map((q) => q.id));
      }

      for (const id of idsToRemove) {
        const res = await removeQuestionnaireFromGroup(groupId, id);
        console.log("✅ response จากการลบ ID", id, ":", res);
      }

      const updatedGroup = await getQuestionnaireGroupByID(groupId);
      console.log("📅 group หลังลบ:", updatedGroup);

      setQuestionnaireMap((prev) => ({
        ...prev,
        [groupId]: updatedGroup.questionnaires,
      }));
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการลบ:", error);
    }
  };

  const getTasksForColumn = (columnId: number) =>
    questionnaireMap[columnId] ?? [];

  const onDragEnd = async (event: DragEndEvent, columnId: number) => {
    if (!isDragMode) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    const tasks = getTasksForColumn(columnId);
    const dragged = tasks.find((q) => q.id === activeId);

    // ❌ ห้ามลากลูก
    if (dragged?.condition_on_id) return;

    const oldOrder = tasks.map((q) => q.id);
    const fromIndex = oldOrder.indexOf(activeId);
    const toIndex = oldOrder.indexOf(overId);

    // ⛔ ดึงกลุ่มแม่ลูกทั้งหมดในคอลัมน์นี้
    const parentWithChildren = tasks.reduce((groups: number[][], q) => {
      if (!q.condition_on_id) {
        const group = [q.id];
        const children = tasks.filter((x) => x.condition_on_id === q.id);
        group.push(...children.map((c) => c.id));
        groups.push(group);
      }
      return groups;
    }, []);

    // ⛔ กันไม่ให้สิ่งอื่นแทรกกลางกลุ่มแม่ลูก
    for (const group of parentWithChildren) {
      if (group.length <= 1) continue;

      const indices = group
        .map((id) => oldOrder.indexOf(id))
        .sort((a, b) => a - b);
      const min = indices[0];
      const max = indices[indices.length - 1];

      const isDraggingSelfGroup = group.includes(activeId);

      // ❌ ถ้าไปตกอยู่ในกลุ่มที่ไม่ใช่ของตัวเอง → ห้าม
      if (!isDraggingSelfGroup && toIndex >= min && toIndex <= max) {
        return;
      }
    }

    // ✅ ดึงแม่+ลูกของตัวเอง
    const moveGroup = (id: number) => {
      const main = tasks.find((q) => q.id === id);
      if (!main) return [id];
      const group = tasks.filter(
        (q) => q.id === id || q.condition_on_id === id
      );
      return group;
    };
    const activeGroup = moveGroup(activeId);

    const reordered = [...tasks];
    const toMove = reordered.splice(fromIndex, activeGroup.length);
    reordered.splice(toIndex, 0, ...toMove);

    setQuestionnaireMap((prev) => ({
      ...prev,
      [columnId]: reordered,
    }));

    setShowSaveButton(true);
    const orderedIds = reordered.map((q) => q.id);
    await updateQuestionnaireGroupOrder(columnId, orderedIds);
    setShowSaveButton(false);
  };

  const [editingFrequency, setEditingFrequency] = useState<{
    groupId: number;
    value: number;
  } | null>(null);

  const handleSaveFrequency = async () => {
    if (!editingFrequency) return;

    try {
      await updateGroupFrequency(
        editingFrequency.groupId,
        editingFrequency.value
      );
      setDraggedDays(editingFrequency.value); // สำหรับ group.id === 3
      setEditingFrequency(null);
    } catch (err) {
      alert("ไม่สามารถอัปเดตความถี่ได้");
      console.error(err);
    }
  };

  const moveItemUpDown = async (
    direction: "up" | "down",
    groupId: number,
    qid: number
  ) => {
    const list = questionnaireMap[groupId];
    if (!list) return;

    const index = list.findIndex((q) => q.id === qid);
    if (index === -1) return;

    // ห้ามเลื่อนลูก
    if (list[index].condition_on_id) return;

    const moveGroup = (id: number) => {
      const group = list.filter((q) => q.id === id || q.condition_on_id === id);
      return group;
    };

    const groupToMove = moveGroup(qid);
    const fromIndex = index;
    const toIndex = direction === "up" ? index - 1 : index + 1;

    // เช็กขอบเขต
    if (toIndex < 0 || toIndex >= list.length) return;

    // ถ้าเลื่อนชนลูกของอันอื่น → ข้ามไม่ได้
    if (
      direction === "down" &&
      list[toIndex].condition_on_id &&
      !groupToMove.find((q) => q.id === list[toIndex].condition_on_id)
    ) {
      return;
    }

    const newList = [...list];
    newList.splice(fromIndex, groupToMove.length); // ตัดออก
    newList.splice(toIndex, 0, ...groupToMove); // แทรกใหม่

    setQuestionnaireMap((prev) => ({
      ...prev,
      [groupId]: newList,
    }));

    const newOrder = newList.map((q) => q.id);
    await updateQuestionnaireGroupOrder(groupId, newOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <img src={iconas} alt="priority" className="w-10 h-10" />
          จัดการลำดับการแสดงแบบทดสอบถาม
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
              <div className="flex items-center justify-between mb-4">
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
                    onClick={() => setIsDragMode((v) => !v)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isDragMode
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-600"
                    }`}
                    title={isDragMode ? "ปิดโหมดจัดเรียง" : "เปิดโหมดจัดเรียง"}
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => handleToggleDropdown(column.id)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                    {dropdownGroupId === column.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow z-10">
                        {availableList.length === 0 ? (
                          <p className="p-2 text-sm text-gray-500">
                            ไม่มีแบบสอบถามใหม่
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
                collisionDetection={closestCenter}
                onDragEnd={(e) => onDragEnd(e, column.id)}
              >
                <SortableContext
                  items={tasks.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {tasks.map((q) => (
                      <SortableItem key={q.id} id={q.id} disabled={!isDragMode}>
                        <div
                          className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex justify-between items-start gap-3 ${
                            isDragMode ? "cursor-move" : ""
                          }`}
                        >
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-gray-900">
                                {q.name}
                              </h4>
                              {isDragMode && !q.condition_on_id && (
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() =>
                                      moveItemUpDown("up", column.id, q.id)
                                    }
                                    title="เลื่อนขึ้น"
                                    className="text-gray-500 hover:text-black"
                                  >
                                    <CaretUpOutlined />
                                  </button>
                                  <button
                                    onClick={() =>
                                      moveItemUpDown("down", column.id, q.id)
                                    }
                                    title="เลื่อนลง"
                                    className="text-gray-500 hover:text-black"
                                  >
                                    <CaretDownOutlined />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              เงื่อนไข📝 :{" "}
                              {q.condition_score != null
                                ? `ถ้าคะแนน >= ${q.condition_score}`
                                : "-"}
                            </p>
                          </div>

                          {!isDragMode && (
                            <button
                              onClick={() =>
                                handleRemoveFromGroup(column.id, q.id)
                              }
                              className="p-1 rounded hover:bg-red-50 transition-colors"
                              title="ลบแบบสอบถาม"
                            >
                              <img
                                src={icondelete}
                                alt="delete"
                                className="w-7 h-7 text-red-500 hover:text-red-600"
                              />
                            </button>
                          )}
                        </div>
                      </SortableItem>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-gray-500 text-sm italic">
                        ไม่มีแบบสอบถามในกลุ่มนี้
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
