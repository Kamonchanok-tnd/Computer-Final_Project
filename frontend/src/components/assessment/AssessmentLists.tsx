import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AssessmentNameIcon from "../../assets/assessment/Assessment_Name.png";
import {
  getAvailableGroupsAndNext,
  getQuestionnaireByID,
  createAssessmentResult,
} from "../../services/https/assessment";
import type { Questionnaire } from "../../interfaces/IQuestionnaire";

type Row = {
  id: number;
  name: string;
  quantity: number;
  isCurrent: boolean;
};

const AssessmentLists: React.FC = () => {
  const navigate = useNavigate();
  const { groupId, quid } = useParams<{ groupId: string; quid: string }>();

  const gid = Number(groupId);
  const startQid = Number(quid);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState<string>("แบบคัดกรองสุขภาพจิต");

  useEffect(() => {
    const run = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const uid = Number(user?.id || localStorage.getItem("id"));
        if (!uid || !gid || !startQid) {
          setLoading(false);
          return;
        }

        // ดึงข้อมูลกลุ่มที่กำลังทำอยู่
        const groups = await getAvailableGroupsAndNext(uid, "");
        const found = Array.isArray(groups)
          ? groups.find((g: any) => g?.id === gid)
          : null;
        if (!found) {
          setLoading(false);
          return;
        }
        setGroupName(found?.name || "แบบคัดกรองสุขภาพจิต");

        // queue แบบคัดกรองสุขภาพจิตที่ต้องทำ โดยอัด startQid ให้อยู่หัวคิวเสมอ
        const pending: number[] = (found?.pending_quids || []) as number[];
        const uniqueIds = Array.from(new Set([startQid, ...pending]));

        // ดึงรายละเอียดชื่อ/จำนวนข้อ
        const details: Questionnaire[] = await Promise.all(
          uniqueIds.map(async (id) => {
            const q = await getQuestionnaireByID(id);
            return q;
          })
        );

        const nextRows: Row[] = details.map((q) => ({
          id: Number(q.id),
          name: q.nameQuestionnaire,
          quantity: q.quantity,
          isCurrent: Number(q.id) === startQid,
        }));

        setRows(nextRows);
      } catch (e) {
        console.error("❌ โหลดรายการแบบคัดกรองสุขภาพจิตไม่สำเร็จ:", e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [gid, startQid]);

  // ✅ ทำให้เริ่มทำแบบคัดกรองได้ทั้งคลิกปุ่ม และกด Enter/Space
  const handleStart = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const uid = Number(user?.id || localStorage.getItem("id"));
      if (!uid || !gid || !startQid) return;

      const newArId = await createAssessmentResult(startQid, uid, gid);

      // ค่าให้หน้าถัดไปใช้งาน
      localStorage.setItem("assessmentResultID", String(newArId));
      localStorage.setItem("questionnaireID", String(startQid));
      localStorage.setItem("questionnaireGroupID", String(gid));

      const current = rows.find((r) => r.isCurrent);
      if (current?.name) {
        localStorage.setItem("questionnaireName", current.name);
      }

      navigate("/assessments");
    } catch (e) {
      console.error("❌ เริ่มทำแบบคัดกรองสุขภาพจิตไม่สำเร็จ:", e);
      alert("เริ่มทำแบบคัดกรองสุขภาพจิตไม่สำเร็จ กรุณาลองใหม่");
    }
  }, [rows, gid, startQid, navigate]);

  // ✅ Keydown: Enter หรือ Space = กดปุ่ม "เริ่มทำเลย"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStart, loading]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[2147483647] min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
        กำลังโหลด...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="fixed inset-0 z-[2147483647] min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
        <div className="bg-sky-200 rounded-2xl p-8 text-center shadow-xl">
          <p className="font-semibold">ไม่พบรายการแบบคัดกรองสุขภาพจิตในกลุ่มนี้</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-ibmthai fixed inset-0 z-[2147483647] min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      <div className="bg-sky-200/90 rounded-2xl p-8 w-11/12 max-w-md text-center shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-5">
          <img
            src={AssessmentNameIcon}
            className="w-15 h-15 object-contain"
            alt="Assessment List"
          />
          <h1 className="text-xl font-bold">{groupName}</h1>
        </div>

        <h1 className="text-xl font-semibold mb-4">แบบคัดกรองที่รอการแบ่งปันจากคุณ 🌱</h1>

        <div className="space-y-3 text-left max-h-[45vh] overflow-auto pr-1">
          {rows.map((r, idx) => (
            <div
              key={r.id}
              className={`p-3 rounded-xl border ${
                r.isCurrent
                  ? "bg-white/90 border-blue-300"
                  : "bg-white/70 border-transparent"
              }`}
            >
              <div className="font-medium">
                {idx + 1}. {r.name}{" "}
                {r.isCurrent ? (
                  <span className="text-blue-600">(เริ่มอันนี้)</span>
                ) : null}
              </div>
              <div className="text-sm text-gray-600">
                จำนวนข้อ : {r.quantity} ข้อ
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          เริ่มทำเลย
        </button>
      </div>
    </div>
  );
};

export default AssessmentLists;
