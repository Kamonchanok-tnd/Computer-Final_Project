import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { getAllQuestionnaireGroups } from "../../services/https/assessment/index";
import { Questionnaire } from "../../interfaces/IQuestionnaire";

interface Column {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  editable?: boolean;
  intervalDays?: number;
}


const ManageTestOrder: React.FC = () => {
  const [draggedDays, setDraggedDays] = useState<number>(7);
  const [originalDays, setOriginalDays] = useState<number>(7);
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  const [columns, setColumns] = useState<Column[]>([
  {
    id: 1, // Pre-test group ID
    title: "Pre-test",
    subtitle: "📝 หลังจาก login ครั้งแรก",
    color: "bg-purple-100 border-purple-200",
  },
  {
    id: 2, // Post-test group ID
    title: "Post-test",
    subtitle: "📝 หลังจากใช้งาน chat",
    color: "bg-blue-100 border-blue-200",
  },
  {
    id: 3, // Post-test2 group ID
    title: "Post-test",
    subtitle: `📝 ทุกๆ ${draggedDays} วัน`,
    color: "bg-yellow-100 border-yellow-200",
    editable: true,
    intervalDays: draggedDays,
  },
]);


useEffect(() => {
  const fetchGroups = async () => {
    const groupsData = await getAllQuestionnaireGroups();
    console.log("🔍 กลุ่มแบบสอบถาม:", groupsData);

    // รวมทุก questionnaire จากทุกกลุ่ม มาไว้ใน array แบนราบ
    const allQuestionnaires = groupsData.flatMap((group: any) =>
    group.Questionnaires.map((q: any) => ({
      id: q.ID,
      nameQuestionnaire: q.NameQuestionnaire,
      description: q.Description,
      quantity: q.Quantity,
      groups: [{ id: group.ID, name: group.Name }]
    }))
   );
    console.log("📦 แบบสอบถามทั้งหมด:", allQuestionnaires);

    setQuestionnaires(allQuestionnaires);
  };

  fetchGroups();
}, []);


  // อัปเดต subtitle แบบสด
  useEffect(() => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === 3
          ? {
              ...col,
              subtitle: `📝 ทุกๆ ${draggedDays} วัน`,
              intervalDays: draggedDays,
            }
          : col
      )
    );
  }, [draggedDays]);

  const handleSave = () => {
    setOriginalDays(draggedDays);
    setShowSaveButton(false);
  };

  const handleCancel = () => {
    setDraggedDays(originalDays);
    setShowSaveButton(false);
  };

  const handleDayChange = (val: number) => {
    const limitedVal = Math.max(1, Math.min(30, val));
    setDraggedDays(limitedVal);
    setShowSaveButton(limitedVal !== originalDays);
  };

  const getTasksForColumn = (columnId: number) => {
    const filtered = questionnaires.filter((q) =>
      q.groups?.some((g) => g.id === columnId)
    );
    console.log(`📦 กลุ่ม ${columnId}:`, filtered);
    return filtered;  
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          จัดการลำดับแบบทดสอบ
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
              {/* Column Header */}
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
                    <p className="text-sm text-gray-600">{column.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Questionnaire Cards */}
              <div className="space-y-3">
                {tasks.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {q.nameQuestionnaire}
                    </h4>
                    <p className="text-gray-700 mb-1">{q.description}</p>
                    <p className="text-sm text-gray-500">
                      จำนวนข้อ: {q.quantity}
                    </p>
                  </div>
                ))}

                {/* ถ้าไม่มีแบบสอบถาม */}
                {tasks.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    ไม่มีแบบสอบถามในกลุ่มนี้
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageTestOrder;
