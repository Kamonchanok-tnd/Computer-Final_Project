import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Button, Input, InputNumber, Spin, Popconfirm, message } from "antd";
import { DeleteOutlined, PlusOutlined, SaveOutlined, RollbackOutlined } from "@ant-design/icons";
import criteriaIcon from "../../../../assets/criteria.png";
import { getAllCriteriaByQuestionnaireId, updateCriteriaByQuestionnaireId } from "../../../../services/https/questionnaire";
import { useNavigate, useLocation, useSearchParams, useParams } from "react-router-dom";

// ชนิดข้อมูลของเกณฑ์
export interface Criterion {
  id?: number;
  description: string;   
  minScore: number;      
  maxScore: number;      
  recommendation?: string; 
}
type NavState = { questionnaireId?: number | string };

// map ข้อมูลจาก Backend เพื่อใช้ในหน้า UI
const toUI = (x: any): Criterion => ({
  id: x?.id ?? x?.ID,
  description: x?.description ?? x?.Description ?? "",
  minScore: Number(x?.minScore ?? x?.MinScore ?? x?.min_criteria_score ?? x?.MinCriteriaScore ?? 0),
  maxScore: Number(x?.maxScore ?? x?.MaxScore ?? x?.max_criteria_score ?? x?.MaxCriteriaScore ?? 0),
  recommendation: x?.recommendation ?? x?.Recommendation ?? "",
});

// ตกเเต่งช่องกรอกข้อมูล
const inputCls =
  "!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors !h-12 !text-base";
const numberCls =
  "w-full !h-12 !rounded-xl !border-slate-300 hover:!border-black focus-within:!border-black transition-colors " +
  "[&_.ant-input-number-input]:!h-12 [&_.ant-input-number-input]:!leading-[48px] [&_.ant-input-number-input]:!py-0 " +
  "[&_.ant-input-number-handler-wrap]:!h-12 [&_.ant-input-number-handler]:!h-6";

// ฟังก์ชันช่วย: เรียงรายการตามช่วงคะแนนน้อยไปมาก ใน list เกณฑ์
const sortByRange = (list: Criterion[]) =>
  [...list].sort((a, b) => {
    const amin = Number(a.minScore ?? Number.POSITIVE_INFINITY);
    const bmin = Number(b.minScore ?? Number.POSITIVE_INFINITY);
    if (amin !== bmin) return amin - bmin;
    const amax = Number(a.maxScore ?? Number.POSITIVE_INFINITY);
    const bmax = Number(b.maxScore ?? Number.POSITIVE_INFINITY);
    return amax - bmax;
  });


const EditCriteriaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ questionnaireId?: string; id?: string }>();
  const name = (location.state as any)?.name ?? "";

  // message การเเจ้งเตือน
  const [msg, contextHolder] = message.useMessage();
  const warn = (content: string, d = 1.8, onClose?: () => void) =>
    msg.warning({ content, duration: d, onClose });
  const errorMsg = (content: string, d = 2.2, onClose?: () => void) =>
    msg.error({ content, duration: d, onClose });
  const ok = (content: string, d = 1.2, onClose?: () => void) =>
    msg.success({ content, duration: d, onClose });

  // รวมแหล่ง questionnaireId (state/query/params/session)
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

  // จำค่าไว้ใน session กันหายเมื่อ refresh
  useEffect(() => {
    if (questionnaireId) sessionStorage.setItem("last_questionnaire_id", String(questionnaireId));
  }, [questionnaireId]);

  // state หลัก 
  const [criteriaList, setCriteriaList] = useState<Criterion[]>([]); // รายการเกณฑ์ที่จะแก้ไข
  const [deletedIds, setDeletedIds] = useState<number[]>([]);        // เก็บ id ที่ลบ เพื่อส่งไปให้ Backend ลบจริง
  const [loading, setLoading] = useState(true);                      // ระหว่างโหลดข้อมูล
  const [submitting, setSubmitting] = useState(false);               // ระหว่างบันทึก

  // ฟอร์มสำหรับเพิ่มเกณฑ์ใหม่
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [minScore, setMinScore] = useState<number | string>("");
  const [maxScore, setMaxScore] = useState<number | string>("");

  // จัดการความสูงโซน scroll
  const formScrollRef = useRef<HTMLDivElement | null>(null);
  const updateFormMaxHeight = () => {
    const el = formScrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const bottomReserved = isMobile ? 72 : 24; // เผื่อพื้นที่ปุ่มล่าง on mobile
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
  }, [criteriaList, loading]);

  // โหลดข้อมูลเกณฑ์จาก Backend เมื่อรู้ questionnaireId
  useEffect(() => {
    if (!questionnaireId) {
      warn("ไม่พบแบบทดสอบ: ไม่มี questionnaireId ถูกส่งมา", 1.8, () => navigate(-1));
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllCriteriaByQuestionnaireId(questionnaireId);
        const list = Array.isArray(data) ? data.map(toUI) : [];
        setCriteriaList(sortByRange(list)); // เรียงทันที
        setDeletedIds([]);
      } catch (e: any) {
        errorMsg(e?.message || "ดึงข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [questionnaireId, navigate]);

  // ตรวจข้อมูลซ้ำ/ช่วงคะแนนทับ 
  const validateNoOverlap = (list: Criterion[]): string | null => {
    const descSet = new Set<string>();
    for (const [i, cRaw] of list.entries()) {
      const c = {
        ...cRaw,
        description: (cRaw.description ?? "").trim(),
        recommendation: (cRaw.recommendation ?? "").trim(),
      };
      if (!c.description) return `รายการที่ ${i + 1}: กรุณากรอกคำอธิบาย`;
      if (!c.recommendation) return `รายการที่ ${i + 1}: กรุณากรอกคำแนะนำ`;
      if (descSet.has(c.description)) return `รายการที่ ${i + 1}: คำอธิบายซ้ำกัน`;
      descSet.add(c.description);
      if (c.minScore === undefined || c.maxScore === undefined) return `รายการที่ ${i + 1}: โปรดกรอกคะแนนครบ`;
      if (Number.isNaN(Number(c.minScore)) || Number.isNaN(Number(c.maxScore))) return `รายการที่ ${i + 1}: คะแนนต้องเป็นตัวเลข`;
      if (Number(c.minScore) > Number(c.maxScore)) return `รายการที่ ${i + 1}: ขั้นต่ำต้อง ≤ สูงสุด`;
    }

    // ตรวจช่วงทับซ้อนหลังเรียง
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
  
  // เพิ่มเกณฑ์ใหม่จากฟอร์มด้านบน
  const addCriterion = () => {
    if (!description || minScore === "" || maxScore === "") return warn("กรุณากรอกคำอธิบายและช่วงคะแนนให้ครบถ้วน");
    if (!String(recommendation).trim()) return warn("กรุณากรอกคำแนะนำสำหรับเกณฑ์นี้");

    const minN = Number(minScore);
    const maxN = Number(maxScore);
    if (Number.isNaN(minN) || Number.isNaN(maxN)) return warn("กรุณากรอกคะแนนเป็นตัวเลข");
    if (minN > maxN) return warn("ช่วงคะแนนไม่ถูกต้อง: ขั้นต่ำต้อง ≤ สูงสุด");

    const next = [...criteriaList, { description: description.trim(), recommendation: recommendation.trim(), minScore: minN, maxScore: maxN }];
    const v = validateNoOverlap(next);
    if (v) return warn(v, 2.0);

    setCriteriaList(sortByRange(next));   // เรียงก่อนเซ็ต
    
    // เคลียร์ฟอร์ม 
    setDescription(""); setRecommendation(""); setMinScore(""); setMaxScore("");
    
    // เลื่อน scroll ลงล่างให้เห็นรายการล่าสุด
    requestAnimationFrame(() => {
      updateFormMaxHeight();
      const el = formScrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  };
  
  // อัปเดต/ลบแถวในรายการ
  const updateRow = (idx: number, patch: Partial<Criterion>) =>
    setCriteriaList(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const removeRow = (idx: number) =>
    setCriteriaList(prev => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed?.id) setDeletedIds(d => [...d, removed.id!]); // เก็บ id เพื่อลบบนเซิร์ฟเวอร์
      if (next.length === 0) warn("ยังไม่มีเกณฑ์การประเมิน: กรุณาเพิ่มอย่างน้อย 1 รายการ");
      return next;
    });

  // บันทึกทั้งหมด: ส่ง updated เเละ deleted ไปที่ Backend
  const handleSaveAll = async () => {
    if (!questionnaireId) return;
    if (criteriaList.length === 0) return warn("ยังไม่มีเกณฑ์การประเมิน: กรุณาเพิ่มอย่างน้อย 1 รายการ");

    const sorted = sortByRange(criteriaList);
    const v = validateNoOverlap(sorted);
    if (v) return warn(v, 2.0);

    let didNavigate = false;
    try {
      setSubmitting(true);
      const updated = sorted.map(c => ({
        id: c.id,
        description: (c.description ?? "").trim(),
        minScore: Number(c.minScore),
        maxScore: Number(c.maxScore),
        recommendation: (c.recommendation ?? "").trim(),
      }));
      await updateCriteriaByQuestionnaireId(questionnaireId, { updated, deleted: deletedIds });
      setDeletedIds([]);

      await new Promise<void>(resolve => ok("แก้ไขข้อมูลสำเร็จ", 1.2, resolve));

      // กลับหน้ารายการแบบทดสอบ พร้อมส่งข้อความไปเเสดง
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
      didNavigate = true;
      navigate(`/${rolePrefix}/questionnairePage`, {
        replace: true,
        state: { flash: { type: "success", content: "แก้ไขข้อมูลสำเร็จ" } },
      });
    } catch (e: any) {
      errorMsg(e?.message || "เเก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      if (!didNavigate) setSubmitting(false);
    }
  };

  // ปุ่มกลับไปหน้าแก้ไขคำถามเเละคำตอบ
  const goBackToQnA = () => {
    if (questionnaireId) {
      navigate(`/admin/editQuestionAndAnswerPage?questionnaireId=${questionnaireId}`, {
        state: { questionnaireId },
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      
      {/* การเเจ้งเตือน */}
      {contextHolder}
      
      <Spin spinning={submitting} fullscreen tip="กำลังบันทึกข้อมูล..." />

      {/* ส่วนหัวข้อ */}
      <div className="w-full px-4 pt-4 sm:px-6">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img src={criteriaIcon} alt="criteria" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-slate-800 sm:text-2xl">แก้ไขเกณฑ์การประเมิน</h1>
              {questionnaireId && <p className="text-sm text-slate-500">แบบทดสอบ ID: {questionnaireId}, ชื่อเเบบทดสอบ: {name}</p>}
            </div>
          </div>

          {/* ปุ่ม กลับเเละบันทึก (เดสก์ท็อป) */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              icon={<RollbackOutlined />}
              onClick={goBackToQnA}
              className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm hover:!border-black hover:!bg-gray-700"
            >
              กลับ
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAll}
              loading={submitting}
              className="!bg-[#5DE2FF] hover:!bg-cyan-500"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </div>
      </div>

      {/* การ์ดหลัก */}
      <div className="w-full px-4 pb-6 sm:px-6">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 pb-16 md:pb-6">
          <Spin spinning={loading} tip="กำลังโหลดข้อมูล...">
            
            {/* เเสดงตัวอย่างเกณฑ์ */}
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

            {/* การ scroll ของ (ฟอร์มเพิ่ม + รายการแก้ไข) */}
            <div ref={formScrollRef} className="space-y-6 pr-1 overflow-y-auto hide-scrollbar">
              {/* ฟอร์มเพิ่มเกณฑ์ใหม่ */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                
                {/* การเเสดงช่องกรอก สำหรับ Desktop */}
                <div className="hidden md:grid md:grid-cols-12 md:gap-4">
                  <div className="md:col-span-6">
                    <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์</label>
                    <Input size="large" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="กรอกคำอธิบายเกณฑ์" className={inputCls}/>
                  </div>
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ</label>
                    <InputNumber size="large" min={0} max={10000} value={minScore===""?undefined:minScore}
                      onChange={(v)=>setMinScore(v==null?"":v)} placeholder="ขั้นต่ำ" className={numberCls}/>
                  </div>
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด</label>
                    <InputNumber size="large" min={0} max={10000} value={maxScore===""?undefined:maxScore}
                      onChange={(v)=>setMaxScore(v==null?"":v)} placeholder="สูงสุด" className={numberCls}/>
                  </div>

                  <div className="md:col-span-12">
                    <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์</label>
                    <Input.TextArea rows={3} value={recommendation} onChange={(e)=>setRecommendation(e.target.value)}
                      placeholder="กรอกคำแนะนำเพิ่มเติมสำหรับเกณฑ์" className="!rounded-xl !border-slate-300 hover:!border-black focus:!border-black focus:!ring-0 transition-colors !text-base"/>
                  </div>
                </div>

                {/* การเเสดงช่องกรอก สำหรับ มือถือ */}
                <div className="grid gap-3 md:hidden">
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์</label>
                    <Input size="large" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="กรอกคำอธิบายเกณฑ์" className={inputCls}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ</label>
                      <InputNumber size="large" min={0} max={10000} value={minScore===""?undefined:minScore}
                        onChange={(v)=>setMinScore(v==null?"":v)} placeholder="ขั้นต่ำ" className={numberCls}/>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด</label>
                      <InputNumber size="large" min={0} max={10000} value={maxScore===""?undefined:maxScore}
                        onChange={(v)=>setMaxScore(v==null?"":v)} placeholder="สูงสุด" className={numberCls}/>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์</label>
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

              {/* รายการเกณฑ์ที่มีให้แก้ไข/ลบ */}
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

                      {/* การเเสดงการแก้ไขค่า สำหรับ (Desktop) */}
                      <div className="hidden md:grid md:grid-cols-12 md:gap-4">
                        <div className="md:col-span-6">
                          <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์</label>
                          <Input size="large" value={c.description} onChange={(e)=>updateRow(idx,{description:e.target.value})} placeholder="คำอธิบายเกณฑ์" className={inputCls}/>
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ</label>
                          <InputNumber size="large" min={0} max={10000} value={c.minScore}
                            onChange={(v)=>updateRow(idx,{minScore:(v ?? 0) as number})}
                            onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                            placeholder="ขั้นต่ำ" className={numberCls}/>
                        </div>
                        <div className="md:col-span-3">
                          <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด</label>
                          <InputNumber size="large" min={0} max={10000} value={c.maxScore}
                            onChange={(v)=>updateRow(idx,{maxScore:(v ?? 0) as number})}
                            onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                            placeholder="สูงสุด" className={numberCls}/>
                        </div>
                        <div className="md:col-span-12">
                          <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์</label>
                          <Input.TextArea rows={2} value={c.recommendation} onChange={(e)=>updateRow(idx,{recommendation:e.target.value})}
                            placeholder="คำแนะนำเกณฑ์" className="!rounded-xl !border-slate-300 hover:!border-black focus:!border-black"/>
                        </div>
                      </div>

                      {/* การเเสดงการแก้ไขค่า สำหรับ (มือถือ) */}
                      <div className="grid gap-3 md:hidden">
                        <div>
                          <label className="mb-1 block text-sm text-slate-700">คำอธิบายเกณฑ์</label>
                          <Input size="large" value={c.description} onChange={(e)=>updateRow(idx,{description:e.target.value})} placeholder="คำอธิบายเกณฑ์" className={inputCls}/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-sm text-slate-700">คะแนนขั้นต่ำ</label>
                            <InputNumber size="large" min={0} max={10000} value={c.minScore}
                              onChange={(v)=>updateRow(idx,{minScore:(v ?? 0) as number})}
                              onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                              placeholder="ขั้นต่ำ" className={numberCls}/>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm text-slate-700">คะแนนสูงสุด</label>
                            <InputNumber size="large" min={0} max={10000} value={c.maxScore}
                              onChange={(v)=>updateRow(idx,{maxScore:(v ?? 0) as number})}
                              onBlur={()=>setCriteriaList(p=>sortByRange(p))}
                              placeholder="สูงสุด" className={numberCls}/>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-slate-700">คำแนะนำเกณฑ์</label>
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

      {/* แถบปุ่มย้อนกลับเเละบันทึกด้านล่าง สำหรับ (มือถือ)*/}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex gap-2 px-4 py-2">
          <Button
            icon={<RollbackOutlined />}
            onClick={goBackToQnA}
            className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:!border-black hover:!bg-gray-700"
            block
          >
            กลับ
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={submitting}
            className="!bg-[#5DE2FF] hover:!bg-cyan-500"
            block
          >
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>

      {/* การตกเเต่งสำหรับ spin */}
      <style>{`
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .ant-spin-fullscreen { background-color: rgba(0,0,0,0.45); }
        .ant-spin-fullscreen .ant-spin-dot-item { background-color: #fff !important; }
        .ant-spin-fullscreen .ant-spin-text { color: #fff !important; }
      `}</style>
    </div>
  );
};

export default EditCriteriaPage;
