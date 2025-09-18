import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Button, Input, InputNumber, Popconfirm, Modal, message } from "antd";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import criteriaIcon from "../../../../assets/criteria.png";
import { createCriteria } from "../../../../services/https/questionnaire";
import { useNavigate, useLocation } from "react-router-dom";

/* ชนิดข้อมูลของเกณฑ์แต่ละรายการ */
type Criterion = { id?: number; description: string; minScore: number; maxScore: number };

const inputCls =
  "!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors !h-12 !text-base";
const numberCls =
  "w-full !h-12 !rounded-xl !border-slate-300 hover:!border-black focus-within:!border-black transition-colors " +
  "[&_.ant-input-number-input]:!h-12 [&_.ant-input-number-input]:!leading-[48px] [&_.ant-input-number-input]:!py-0 " +
  "[&_.ant-input-number-handler-wrap]:!h-12 [&_.ant-input-number-handler]:!h-6";

const CreateCriteriaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questionnaireId = (location.state as any)?.questionnaireId as number;

  /* toast (antd message) */
  const [msg, contextHolder] = message.useMessage();

  const [description, setDescription] = useState("");
  const [minScore, setMinScore] = useState<number | string>("");
  const [maxScore, setMaxScore] = useState<number | string>("");

  /* รายการเกณฑ์ทั้งหมด */
  const [criteriaList, setCriteriaList] = useState<Criterion[]>([]);

  const formScrollRef = useRef<HTMLDivElement | null>(null);

  const updateFormMaxHeight = () => {
    const el = formScrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const bottomReserved = isMobile ? 72 : 24;
    const max = window.innerHeight - rect.top - bottomReserved;
    el.style.maxHeight = `${Math.max(240, max)}px`;
  };

  useLayoutEffect(() => {
    const handler = () => updateFormMaxHeight();
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    updateFormMaxHeight();
  }, [criteriaList]);

  useEffect(() => {
    if (!questionnaireId) {
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
      Modal.warning({
        title: "ไม่พบแบบทดสอบ",
        content: "ไม่มี questionnaireId ถูกส่งมา",
        onOk: () => navigate(`/${rolePrefix}/questionnairePage`, { replace: true }),
      });
    }
  }, [questionnaireId, navigate]);

  /* ตรวจข้อมูลรวม */
  const validateAll = (list: Criterion[]): string | null => {
    if (!list.length) return "โปรดเพิ่มเกณฑ์อย่างน้อย 1 รายการ";
    const seen = new Set<string>();
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const desc = (c.description ?? "").trim();
      const min = Number(c.minScore);
      const max = Number(c.maxScore);
      if (!desc) return `รายการที่ ${i + 1}: กรุณากรอกคำอธิบายเกณฑ์`;
      const key = desc.toLowerCase();
      if (seen.has(key)) return `รายการที่ ${i + 1}: คำอธิบาย "${desc}" ซ้ำกัน`;
      seen.add(key);
      if (!Number.isFinite(min) || !Number.isFinite(max)) return `รายการที่ ${i + 1}: คะแนนต้องเป็นตัวเลข`;
    }
    const sorted = [...list].sort((a, b) => a.minScore - b.minScore);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.minScore <= prev.maxScore) {
        return `ช่วงคะแนนของ "${curr.description}" (${curr.minScore}-${curr.maxScore}) ซ้อนทับกับ "${prev.description}" (${prev.minScore}-${prev.maxScore})`;
      }
    }
    return null;
  };

  const addCriterion = () => {
    if (!description || minScore === "" || maxScore === "") {
      Modal.warning({ title: "กรุณากรอกข้อมูลให้ครบ", content: "คำอธิบายและช่วงคะแนน" });
      return;
    }
    const minN = Number(minScore);
    const maxN = Number(maxScore);
    const nextItem: Criterion = { description: description.trim(), minScore: minN, maxScore: maxN };

    const err = validateAll([...criteriaList, nextItem]);
    if (err) {
      Modal.warning({ title: "ตรวจสอบข้อมูล", content: err });
      return;
    }
    setCriteriaList(prev => [...prev, nextItem]);
    setDescription("");
    setMinScore("");
    setMaxScore("");

    requestAnimationFrame(() => {
      updateFormMaxHeight();
      const el = formScrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  };

  /* อัปเดต/ลบแถว */
  const updateRow = (idx: number, patch: Partial<Criterion>) =>
    setCriteriaList(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const removeRow = (idx: number) => setCriteriaList(prev => prev.filter((_, i) => i !== idx));

  /* บันทึกทั้งหมด toast ไป questionnaire */
  const saveAll = async () => {
    const err = validateAll(criteriaList);
    if (err) {
      Modal.warning({ title: "ตรวจสอบข้อมูล", content: err });
      return;
    }
    try {
      await createCriteria(criteriaList, questionnaireId);
      await new Promise<void>((resolve) => {
        msg.success({ content: "สร้างเกณฑ์การประเมินสำเร็จ!", duration: 1.2, onClose: resolve });
      });
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";

      navigate(`/${rolePrefix}/questionnairePage`, {
        replace: true,
        state: {
          flash: {
            type: "success",
            content: "บันทึกข้อมูลเเบบทดสอบ คำถาม คำตอบเเละเกณฑ์การประเมินลงฐานข้อมูลเรียบร้อย!",
          },
        },
      });
    } catch (e: any) {
      Modal.error({ title: "บันทึกไม่สำเร็จ", content: e?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      {contextHolder}

      {/* Header */}
      <div className="w-full px-4 pt-4 sm:px-6">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img src={criteriaIcon} alt="criteria" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-800 sm:text-2xl">สร้างเกณฑ์การประเมิน</h1>
              {typeof questionnaireId === "number" && (
                <p className="text-sm text-slate-500">แบบทดสอบ ID: {questionnaireId}</p>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button type="primary" icon={<SaveOutlined />} onClick={saveAll} className="!bg-[#5DE2FF] hover:!bg-cyan-500">
              บันทึกเกณฑ์การประเมิน
            </Button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full px-4 pb-6 sm:px-6">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 pb-16 md:pb-6">
          {/* ตัวอย่างไอเดียช่วงคะแนน */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700 sm:text-base">ตัวอย่างการวัดระดับความสุข</h3>
            <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              <ul className="list-disc pl-6">
                <li>0 = ไม่มีความสุขเลย</li>
                <li>1–2 = ความสุขน้อยที่สุด</li>
                <li>3–4 = ความสุขน้อย</li>
                <li>5–6 = ความสุขปานกลาง</li>
                <li>7–8 = ความสุขมาก</li>
                <li>9–10 = ความสุขมากที่สุด</li>
              </ul>
              <ul className="list-disc pl-6 text-red-500">
                <li>“ไม่มีความสุขเลย” → ต่ำสุด 0 สูงสุด 0</li>
                <li>“ความสุขน้อยที่สุด” → ต่ำสุด 1 สูงสุด 2</li>
                <li>“ความสุขน้อย” → ต่ำสุด 3 สูงสุด 4</li>
                <li>“ความสุขปานกลาง” → ต่ำสุด 5 สูงสุด 6</li>
                <li>“ความสุขมาก” → ต่ำสุด 7 สูงสุด 8</li>
                <li>“ความสุขมากที่สุด” → ต่ำสุด 9 สูงสุด 10</li>
              </ul>
            </div>
          </div>

          <div ref={formScrollRef} className="space-y-6 pr-1 overflow-y-auto hide-scrollbar">
            {/* แถวเพิ่มเกณฑ์ */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-6">
                  <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์</label>
                  <Input
                    size="large"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="กรอกคำอธิบายเกณฑ์"
                    className={inputCls}
                    onPressEnter={addCriterion}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ</label>
                  <InputNumber
                    size="large"
                    min={0}
                    max={10000}
                    value={minScore === "" ? undefined : minScore}
                    onChange={(v) => setMinScore(v === undefined || v === null ? "" : v)}
                    placeholder="ขั้นต่ำ"
                    className={numberCls}
                    onPressEnter={addCriterion as any}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด</label>
                  <InputNumber
                    size="large"
                    min={0}
                    max={10000}
                    value={maxScore === "" ? undefined : maxScore}
                    onChange={(v) => setMaxScore(v === undefined || v === null ? "" : v)}
                    placeholder="สูงสุด"
                    className={numberCls}
                    onPressEnter={addCriterion as any}
                  />
                </div>
                <div className="md:col-span-12 flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={addCriterion} className="!bg-[#5DE2FF] hover:!bg-cyan-500">
                    เพิ่มเกณฑ์
                  </Button>
                </div>
              </div>
            </div>

            {/* รายการเกณฑ์ */}
            {criteriaList.length === 0 ? (
              <div className="text-slate-500">ยังไม่มีเกณฑ์การประเมิน</div>
            ) : (
              <div className="space-y-3">
                {/* หัวตาราง: desktop/tablet */}
                <div className="hidden grid-cols-12 gap-3 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 md:grid">
                  <div className="col-span-6">คำอธิบายเกณฑ์</div>
                  <div className="col-span-3">คะแนนขั้นต่ำ</div>
                  <div className="col-span-2">คะแนนสูงสุด</div>
                  <div className="col-span-1 text-right">ลบ</div>
                </div>

                {criteriaList.map((c, idx) => (
                  <div
                    key={`${c.description}-${idx}`}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-black focus-within:border-black md:grid-cols-12"
                  >
                    <div className="md:col-span-6">
                      <Input
                        size="large"
                        value={c.description}
                        onChange={(e) => updateRow(idx, { description: e.target.value })}
                        placeholder="คำอธิบายเกณฑ์"
                        className={inputCls}
                      />
                    </div>

                    {/* คะแนนขั้นต่ำ — แสดง label เฉพาะมือถือ */}
                    <div className="md:col-span-3">
                      <span className="md:hidden block text-xs text-slate-500 mb-1">คะแนนขั้นต่ำ</span>
                      <InputNumber
                        size="large"
                        min={0}
                        max={10000}
                        value={c.minScore}
                        onChange={(v) => updateRow(idx, { minScore: (v ?? 0) as number })}
                        placeholder="ขั้นต่ำ"
                        className={numberCls}
                      />
                    </div>

                    {/* คะแนนสูงสุด — แสดง label เฉพาะมือถือ */}
                    <div className="md:col-span-2">
                      <span className="md:hidden block text-xs text-slate-500 mb-1">คะแนนสูงสุด</span>
                      <InputNumber
                        size="large"
                        min={0}
                        max={10000}
                        value={c.maxScore}
                        onChange={(v) => updateRow(idx, { maxScore: (v ?? 0) as number })}
                        placeholder="สูงสุด"
                        className={numberCls}
                      />
                    </div>

                    <div className="md:col-span-1 flex items-center justify-end">
                      <Popconfirm title="ลบรายการนี้?" okText="ลบ" cancelText="ยกเลิก" onConfirm={() => removeRow(idx)}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          className="!bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 !border-none !shadow-none"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ปุ่มล่าง (มือถือ) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex gap-2 px-4 py-2">
          <Button block type="primary" icon={<SaveOutlined />} onClick={saveAll} className="!bg-[#5DE2FF] hover:!bg-cyan-500">
            บันทึกเกณฑ์การประเมิน
          </Button>
        </div>
      </div>

      {/* ซ่อน scrollbar แต่ยังเลื่อนได้ */}
      <style>{`
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CreateCriteriaPage;
