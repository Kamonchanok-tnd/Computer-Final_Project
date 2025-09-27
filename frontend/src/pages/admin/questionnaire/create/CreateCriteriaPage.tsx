import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Button, Input, InputNumber, Spin, Popconfirm, message } from "antd";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import criteriaIcon from "../../../../assets/criteria.png";
import { createCriteria } from "../../../../services/https/questionnaire";
import { useNavigate, useLocation, useSearchParams, useParams } from "react-router-dom";

/* Types */
export interface Criterion {
  id?: number;
  description: string;
  minScore: number;
  maxScore: number;
  recommendation?: string;
}
type NavState = { questionnaireId?: number | string };

/* การตกเเต่ง */
const inputCls =
  "!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors !h-12 !text-base";
const numberCls =
  "w-full !h-12 !rounded-xl !border-slate-300 hover:!border-black focus-within:!border-black transition-colors " +
  "[&_.ant-input-number-input]:!h-12 [&_.ant-input-number-input]:!leading-[48px] [&_.ant-input-number-input]:!py-0 " +
  "[&_.ant-input-number-handler-wrap]:!h-12 [&_.ant-input-number-handler]:!h-6";


/* เรียงจากช่วงคะแนนน้อย ไป มาก */
const sortByRange = (list: Criterion[]) =>
  [...list].sort((a, b) => {
    const amin = Number(a.minScore ?? Number.POSITIVE_INFINITY);
    const bmin = Number(b.minScore ?? Number.POSITIVE_INFINITY);
    if (amin !== bmin) return amin - bmin;
    const amax = Number(a.maxScore ?? Number.POSITIVE_INFINITY);
    const bmax = Number(b.maxScore ?? Number.POSITIVE_INFINITY);
    return amax - bmax;
  });

const CreateCriteriaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ questionnaireId?: string; id?: string }>();
  const name = (location.state as any)?.name ?? "";
  const [msg, contextHolder] = message.useMessage();

  /* resolve questionnaireId */
  const stateIdRaw = (location.state as NavState | null)?.questionnaireId;
  const queryIdRaw = searchParams.get("questionnaireId");
  const paramIdRaw = params.questionnaireId ?? params.id;
  const parseNum = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const questionnaireId: number | undefined =
    parseNum(stateIdRaw) ??
    parseNum(queryIdRaw) ??
    parseNum(paramIdRaw) ??
    parseNum(sessionStorage.getItem("last_questionnaire_id"));

  useEffect(() => {
    if (questionnaireId) sessionStorage.setItem("last_questionnaire_id", String(questionnaireId));
  }, [questionnaireId]);

  const [criteriaList, setCriteriaList] = useState<Criterion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading] = useState(false);

  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [minScore, setMinScore] = useState<number | string>("");
  const [maxScore, setMaxScore] = useState<number | string>("");

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
      msg.warning({
        content: "ไม่พบแบบทดสอบ: ไม่มี questionnaireId ถูกส่งมา",
        duration: 1.8,
        onClose: () => navigate(-1),
      });
    }
  }, [questionnaireId, navigate, msg]);

  /* การเเจ้งเตือนการกรอกข้อมูล */
  const validateAll = (list: Criterion[]): string | null => {
    const descSet = new Set<string>();
    for (const [i, raw] of list.entries()) {
      const c = {
        ...raw,
        description: (raw.description ?? "").trim(),
        recommendation: (raw.recommendation ?? "").trim(),
      };
      if (!c.description) return `รายการที่ ${i + 1}: กรุณากรอกคำอธิบาย`;
      if (!c.recommendation) return `รายการที่ ${i + 1}: กรุณากรอกคำแนะนำ`;
      const key = c.description;
      if (descSet.has(key)) return `รายการที่ ${i + 1}: คำอธิบายซ้ำกัน`;
      descSet.add(key);
      if (c.minScore === undefined || c.maxScore === undefined)
        return `รายการที่ ${i + 1}: โปรดกรอกคะแนนขั้นต่ำและสูงสุดให้ครบ`;
      if (Number.isNaN(Number(c.minScore)) || Number.isNaN(Number(c.maxScore)))
        return `รายการที่ ${i + 1}: คะแนนต้องเป็นตัวเลข`;
      if (Number(c.minScore) > Number(c.maxScore))
        return `รายการที่ ${i + 1}: ขั้นต่ำต้อง ≤ สูงสุด`;
    }
    const sorted = sortByRange(list);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.minScore <= prev.maxScore) {
        return `ช่วงคะแนนของ "${curr.description}" (${curr.minScore}-${curr.maxScore}) ซ้อนทับกับ "${prev.description}" (${prev.minScore}-${prev.maxScore})`;
      }
    }
    return null;
  };

  /* เพิ่มเกณฑ์ */
  const addCriterion = () => {
    if (!description || minScore === "" || maxScore === "") {
      msg.warning({ content: "กรุณากรอกคำอธิบายและช่วงคะแนนให้ครบถ้วน", duration: 1.8 });
      return;
    }
    if (!String(recommendation).trim()) {
      msg.warning({ content: "กรุณากรอกคำแนะนำสำหรับเกณฑ์นี้", duration: 1.8 });
      return;
    }
    const minN = Number(minScore);
    const maxN = Number(maxScore);
    if (Number.isNaN(minN) || Number.isNaN(maxN)) {
      msg.warning({ content: "กรุณากรอกคะแนนเป็นตัวเลข", duration: 1.8 });
      return;
    }
    if (minN > maxN) {
      msg.warning({ content: "ช่วงคะแนนไม่ถูกต้อง: ขั้นต่ำต้อง ≤ สูงสุด", duration: 1.8 });
      return;
    }
    const next = [
      ...criteriaList,
      { description: description.trim(), recommendation: recommendation.trim(), minScore: minN, maxScore: maxN },
    ];
    const v = validateAll(next);
    if (v) {
      msg.warning({ content: v, duration: 2.2 });
      return;
    }
    setCriteriaList(sortByRange(next));
    setDescription("");
    setRecommendation("");
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

  const removeRow = (idx: number) =>
    setCriteriaList(prev => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });

  /* บันทึกทั้งหมด */
  const handleSaveAll = async () => {
    if (!questionnaireId) return;
    if (criteriaList.length === 0) {
      msg.warning({ content: "ยังไม่มีเกณฑ์การประเมิน: กรุณาเพิ่มอย่างน้อย 1 รายการ", duration: 1.8 });
      return;
    }
    const sorted = sortByRange(criteriaList);
    const v = validateAll(sorted);
    if (v) {
      msg.warning({ content: v, duration: 2.2 });
      return;
    }
    let didNavigate = false;
    try {
      setSubmitting(true);
      const created = sorted.map(c => ({
        description: (c.description ?? "").trim(),
        minScore: Number(c.minScore),
        maxScore: Number(c.maxScore),
        recommendation: (c.recommendation ?? "").trim(),
      }));
      await createCriteria(created, questionnaireId!);
      await new Promise<void>(resolve =>
        msg.success({ content: "เพิ่มข้อมูลสำเร็จ", duration: 1.2, onClose: resolve })
      );
      didNavigate = true;
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";

      navigate(`/${rolePrefix}/questionnairePage`, {
        replace: true,
        state: { flash: { type: "success", content: "เพิ่มข้อมูลสำเร็จ" } },
      });
    } catch (e: any) {
      msg.error({ content: e?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", duration: 2.2 });
    } finally {
      if (!didNavigate) setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      {contextHolder}
      <Spin spinning={submitting} fullscreen tip="กำลังบันทึกข้อมูล..." />

      {/* Header */}
      <div className="w-full px-4 pt-4 sm:px-6">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img src={criteriaIcon} alt="criteria" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-800 sm:text-2xl">สร้างเกณฑ์การประเมิน</h1>
              {questionnaireId && <p className="text-sm text-slate-500">แบบทดสอบ ID: {questionnaireId}, ชื่อเเบบทดสอบ: {name}</p>}
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAll}
              loading={submitting}
              className="!bg-[#5DE2FF] hover:!bg-cyan-500"
            >
              บันทึกเกณฑ์การประเมิน
            </Button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full px-4 pb-6 sm:px-6">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 pb-16 md:pb-6">
          <Spin spinning={loading} tip="กำลังโหลดข้อมูล...">
            
            {/* ส่วนเเสดงตัวอย่าง */}
            <div className="mb-4 sm:mb-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-700 sm:text-base">ตัวอย่างการวัดระดับความสุข</h3>
              <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                <ul className="list-disc pl-6">
                  <li>0 = ไม่มีความสุขเลย</li><li>1–2 = ความสุขน้อยที่สุด</li><li>3–4 = ความสุขน้อย</li>
                  <li>5–6 = ความสุขปานกลาง</li><li>7–8 = ความสุขมาก</li><li>9–10 = ความสุขมากที่สุด</li>
                </ul>
                <ul className="list-disc pl-6 text-red-500">
                  <li>“ไม่มีความสุขเลย” = ต่ำสุด 0 – สูงสุด 0</li><li>“ความสุขน้อยที่สุด” = ต่ำสุด 1 – สูงสุด 2</li><li>“ความสุขน้อย” = ต่ำสุด 3 – สูงสุด 4</li>
                  <li>“ความสุขปานกลาง” = ต่ำสุด 5 – สูงสุด 6</li><li>“ความสุขมาก” = ต่ำสุด 7 – สูงสุด 8</li><li>“ความสุขมากที่สุด” = ต่ำสุด 9 – สูงสุด 10</li>
                </ul>
              </div>
            </div>

            {/* Form + List (scroll) สามารถเลื่อนได้ */}
            <div ref={formScrollRef} className="space-y-6 pr-1 overflow-y-auto hide-scrollbar">
              {/* Form */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                
                {/* สำหรับ Desktop */}
                <div className="hidden md:grid md:grid-cols-12 md:gap-4">
                  <div className="md:col-span-6">
                    <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์ <span className="text-rose-600">*</span></label>
                    <Input size="large" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="กรอกคำอธิบายเกณฑ์" className={inputCls}/>
                  </div>
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ <span className="text-rose-600">*</span></label>
                    <InputNumber size="large" min={0} max={10000} value={minScore===""?undefined:minScore}
                      onChange={(v)=>setMinScore(v==null?"":v)} placeholder="ขั้นต่ำ" className={numberCls}/>
                  </div>
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด <span className="text-rose-600">*</span></label>
                    <InputNumber size="large" min={0} max={10000} value={maxScore===""?undefined:maxScore}
                      onChange={(v)=>setMaxScore(v==null?"":v)} placeholder="สูงสุด" className={numberCls}/>
                  </div>

                  <div className="md:col-span-12">
                    <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์ <span className="text-rose-600">*</span></label>
                    <Input.TextArea rows={3} value={recommendation} onChange={(e)=>setRecommendation(e.target.value)}
                      placeholder="กรอกคำแนะนำเพิ่มเติมสำหรับเกณฑ์" className="!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors !text-base"/>
                  </div>
                </div>

                {/* สำหรับ Mobile */}
                <div className="grid gap-3 md:hidden">
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์ <span className="text-rose-600">*</span></label>
                    <Input size="large" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="กรอกคำอธิบายเกณฑ์" className={inputCls}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ <span className="text-rose-600">*</span></label>
                      <InputNumber size="large" min={0} max={10000} value={minScore===""?undefined:minScore}
                        onChange={(v)=>setMinScore(v==null?"":v)} placeholder="ขั้นต่ำ" className={numberCls}/>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด <span className="text-rose-600">*</span></label>
                      <InputNumber size="large" min={0} max={10000} value={maxScore===""?undefined:maxScore}
                        onChange={(v)=>setMaxScore(v==null?"":v)} placeholder="สูงสุด" className={numberCls}/>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์ <span className="text-rose-600">*</span></label>
                    <Input.TextArea rows={3} value={recommendation} onChange={(e)=>setRecommendation(e.target.value)}
                      placeholder="กรอกคำแนะนำเพิ่มเติมสำหรับเกณฑ์" className="!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors !text-base"/>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={addCriterion} className="!bg-[#5DE2FF] hover:!bg-cyan-500">
                    เพิ่มเกณฑ์
                  </Button>
                </div>
              </div>

              {/* List */}
              {criteriaList.length === 0 ? (
                <div className="text-slate-500">ยังไม่มีเกณฑ์การประเมิน</div>
              ) : (
                <div className="space-y-3">
                  {criteriaList.map((c, idx) => (
                    <div key={c.id ?? idx} className="rounded-xl border border-slate-200 p-3 transition-colors hover:border-black focus-within:border-black">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="m-0 font-semibold text-slate-700">เกณฑ์ที่ {idx + 1}</p>
                        <Popconfirm title="ลบรายการนี้?" okText="ลบ" cancelText="ยกเลิก" onConfirm={() => removeRow(idx)}>
                          <Button danger icon={<DeleteOutlined />} className="!bg-rose-600 !text-white hover:!bg-rose-700 active:!bg-rose-800 !border-none !shadow-none"/>
                        </Popconfirm>
                      </div>

                      {/* สำหรับ Desktop */}
                      <div className="hidden md:grid md:grid-cols-12 md:gap-4">
                        <div className="md:col-span-6">
                          <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์ <span className="text-rose-600">*</span></label>
                          <Input size="large" value={c.description} onChange={(e)=>updateRow(idx,{description:e.target.value})} placeholder="คำอธิบายเกณฑ์" className={inputCls}/>
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ <span className="text-rose-600">*</span></label>
                          <InputNumber size="large" min={0} max={10000} value={c.minScore}
                            onChange={(v)=>updateRow(idx,{minScore:(v ?? 0) as number})}
                            onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                            placeholder="ขั้นต่ำ" className={numberCls}/>
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด <span className="text-rose-600">*</span></label>
                          <InputNumber size="large" min={0} max={10000} value={c.maxScore}
                            onChange={(v)=>updateRow(idx,{maxScore:(v ?? 0) as number})}
                            onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                            placeholder="สูงสุด" className={numberCls}/>
                        </div>
                        <div className="md:col-span-12">
                          <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์ <span className="text-rose-600">*</span></label>
                          <Input.TextArea rows={2} value={c.recommendation} onChange={(e)=>updateRow(idx,{recommendation:e.target.value})}
                            placeholder="คำแนะนำเกณฑ์" className="!rounded-xl !border-slate-300 hover:!border-black focus:!border-black"/>
                        </div>
                      </div>

                      {/* สำหรับ Mobile */}
                      <div className="grid gap-3 md:hidden">
                        <div>
                          <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์ <span className="text-rose-600">*</span></label>
                          <Input size="large" value={c.description} onChange={(e)=>updateRow(idx,{description:e.target.value})} placeholder="คำอธิบายเกณฑ์" className={inputCls}/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ <span className="text-rose-600">*</span></label>
                            <InputNumber size="large" min={0} max={10000} value={c.minScore}
                              onChange={(v)=>updateRow(idx,{minScore:(v ?? 0) as number})}
                              onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                              placeholder="ขั้นต่ำ" className={numberCls}/>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด <span className="text-rose-600">*</span></label>
                            <InputNumber size="large" min={0} max={10000} value={c.maxScore}
                              onChange={(v)=>updateRow(idx,{maxScore:(v ?? 0) as number})}
                              onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                              placeholder="สูงสุด" className={numberCls}/>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์ <span className="text-rose-600">*</span></label>
                          <Input.TextArea rows={2} value={c.recommendation} onChange={(e)=>updateRow(idx,{recommendation:e.target.value})}
                            placeholder="คำแนะนำเกณฑ์" className="!rounded-xl !border-slate-300 hover:!border-black focus:!border-black"/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Spin>
        </div>
      </div>

      {/* ตำเเหน่งปุ่มบันทึกสำหรับมือถือ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex gap-2 px-4 py-2">
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAll} loading={submitting} className="!bg-[#5DE2FF] hover:!bg-cyan-500" block>
            บันทึกเกณฑ์การประเมิน
          </Button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CreateCriteriaPage;
