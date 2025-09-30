import React, { useEffect, useMemo, useRef, useState } from "react";
import { message, Spin } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useNavigate } from "react-router-dom";
import createQuestionIcon from "../../../../assets/createQuestionnaire.png";
import { createQuestionnaire, getAllQuestionnaires } from "../../../../services/https/questionnaire";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";

// ชนิดข้อมูล/ตัวเลือก
type TestType = "positive" | "negative";
type Option = { label: string; value: string | number; icon?: React.ReactNode | string };
type CardRefLike =
  | React.MutableRefObject<HTMLDivElement | null>
  | React.RefObject<HTMLDivElement | null>
  | null
  | undefined;

// การตกเเต่งช่องกรอก
const fieldClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 transition-colors " +
  "focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black bg-white";

// Dropdown แบบ custom 
const DropdownSearchSelect: React.FC<{
  value?: string | number;
  onChange: (val: any) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  cardRef?: CardRefLike; // ใช้อ้าง card เพื่อคำนวณพื้นที่แสดงเมนู
}> = ({ value, onChange, options, placeholder = "เลือก...", disabled, className = "", cardRef }) => {
  
  const [open, setOpen] = useState(false);     // สถานะเปิด/ปิดเมนู
  const [term, setTerm] = useState("");        // ข้อความค้นหา
  
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [dropUp, setDropUp] = useState(false); // เด้งขึ้น เมื่อพื้นที่ด้านล่างไม่พอ
  const [menuMaxH, setMenuMaxH] = useState(288);
  const IDEAL_MENU_H = 288;

  const selected = options.find((o) => o.value === value);

  // ปิดเมนูเมื่อคลิกนอกคอมโพเนนต์
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // คำนวณทิศทางและความสูงเมนู (อิงตำแหน่งกับ cardRef)
  const calcDrop = () => {
    const fieldRect = boxRef.current?.getBoundingClientRect();
    if (!fieldRect) return;

    let spaceBelow = window.innerHeight - fieldRect.bottom;
    let spaceAbove = fieldRect.top;

    // ถ้ามี card ครอบ ให้จำกัดพื้นที่ภายใน card
    const cardRect = (cardRef as any)?.current?.getBoundingClientRect?.();
    if (cardRect) {
      spaceBelow = Math.min(spaceBelow, cardRect.bottom - fieldRect.bottom);
      spaceAbove = Math.min(spaceAbove, fieldRect.top - cardRect.top);
    }

    const preferUp = spaceBelow < IDEAL_MENU_H && spaceAbove > spaceBelow;
    setDropUp(preferUp);

    const room = (preferUp ? spaceAbove : spaceBelow) - 12;
    setMenuMaxH(Math.max(200, Math.min(IDEAL_MENU_H, room)));
  };

  // คอย re-calc เมื่อเปิด และเมื่อมี resize/scroll
  useEffect(() => {
    if (!open) return;
    const recalc = () => calcDrop();
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    (cardRef as any)?.current?.addEventListener?.("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      (cardRef as any)?.current?.removeEventListener?.("scroll", recalc, true);
    };
  }, [open, cardRef]);

  // กรองตัวเลือกตามคำค้นหา
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? options.filter((o) => o.label.toLowerCase().includes(t)) : options;
  }, [term, options]);

  return (
    <div ref={boxRef} className={"relative " + className}>
      {/* ปุ่มหลักของ dropdown (แสดงค่าที่เลือก) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          calcDrop();
          setOpen((v) => !v);
        }}
        className={
          fieldClass +
          " flex items-center justify-between " +
          (disabled ? "opacity-60 cursor-not-allowed " : "")
        }
      >
        <span className={selected ? "truncate" : "text-slate-400"}>
          {selected ? (
            <span className="inline-flex items-center gap-2">
              {selected.icon &&
                (typeof selected.icon === "string" ? (
                  <img src={selected.icon} alt="" className="h-4 w-4" />
                ) : (
                  selected.icon
                ))}
              {selected.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <svg
          className={"h-4 w-4 shrink-0 text-slate-500 transition-transform " + (open ? "rotate-180" : "")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
        </svg>
      </button>

      {/* เมนู dropdown */}
      {open && (
        <div
          className={[
            "absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
          ].join(" ")}
        >
          {/* แถบค้นหา */}
          <div className="sticky top-0 z-10 bg-white">
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-slate-200">
              <div className="flex items-center rounded-lg border border-slate-300 px-3 py-2 hover:border-black w-full">
                <svg className="mr-2 h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.5 3a5.5 5.5 0 1 1 3.916 9.416l3.084 3.084a1 1 0 0 1-1.414 1.414l-3.084-3.084A5.5 5.5 0 0 1 8.5 3Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  autoFocus
                  placeholder="ค้นหา..."
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              <button className="mr-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100" onClick={() => setOpen(false)} type="button">
                ปิด
              </button>
            </div>
          </div>

          {/* รายการตัวเลือก */}
          <div className="p-2 overflow-auto" style={{ maxHeight: menuMaxH }}>
            {filtered.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={String(o.value)}
                  className={
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left " +
                    (active ? "bg-slate-100" : "hover:bg-slate-50")
                  }
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    {o.icon && (typeof o.icon === "string" ? <img src={o.icon} alt="" className="h-4 w-4" /> : o.icon)}
                    <span className="text-sm">{o.label}</span>
                  </span>
                  {active && <span className="text-xs text-slate-500">เลือกอยู่</span>}
                </button>
              );
            })}
            {!filtered.length && <div className="px-3 py-2 text-sm text-slate-500">ไม่พบตัวเลือก</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// ตัวเพิ่ม/ลดตัวเลขแบบง่าย (จำนวนข้อ / คะแนนเงื่อนไข)
const NumberStepper: React.FC<{
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}> = ({ value, onChange, min = 1, max = 9999, className = "" }) => {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));
  return (
    <div className={"flex w-full items-stretch gap-2 " + className}>
      <button type="button" onClick={dec} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-black hover:bg-slate-50">−</button>
      <input value={value} readOnly inputMode="numeric" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-slate-800 focus:outline-none hover:border-black" onWheel={(e) => (e.currentTarget as any).blur()} />
      <button type="button" onClick={inc} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-black hover:bg-slate-50">+</button>
    </div>
  );
};

// กล่องอัปโหลดรูป: drag&drop + ปุ่มเลือกไฟล์ + แปลง base64
const UploadBox: React.FC<{
  pictureBase64?: string;
  setPictureBase64: (v?: string) => void;
  messageApi: MessageInstance;
}> = ({ pictureBase64, setPictureBase64, messageApi }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // แปลงไฟล์ เป็น base64
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
    });

  // ตรวจชนิด/ขนาด แล้วอัปเดต state
  const handleFile = async (file?: File) => {
    if (!file) return;
    const accept = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!accept.includes(file.type)) return messageApi.error("อนุญาตเฉพาะไฟล์รูปภาพ (JPG/PNG/WebP/GIF)");
    if (file.size / 1024 / 1024 > 5) return messageApi.error("ไฟล์ใหญ่เกิน 5MB");
    const b64 = await fileToBase64(file);
    setPictureBase64(b64);
    setFileName(file.name);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">อัปโหลดรูปภาพประกอบ</label>

      {/* พื้นที่ drag&drop เเละ preview */}
      <div
        className={`group rounded-[22px] border-2 border-dashed p-4 sm:p-6 transition-colors ${isDragging ? "border-black" : "border-slate-300 hover:border-black"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
      >
        <div className="mx-auto w-full max-w-[780px] rounded-xl bg-slate-100/40 p-3">
          <div className="relative w-full rounded-lg bg-white/60 grid place-items-center overflow-hidden min-h-[220px] max-h-[60vh]">
            {pictureBase64 ? (
              <img src={pictureBase64} alt={fileName || "preview"} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400 p-6">วางไฟล์ที่นี่ หรือกด "เลือกไฟล์"</div>
            )}
          </div>
        </div>

        {/* ปุ่มเลือก/ลบไฟล์ */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-black hover:bg-slate-50">
            เลือกไฟล์
          </button>
          <button type="button" onClick={() => setPictureBase64(undefined)} disabled={!pictureBase64} className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700 shadow-sm transition-colors hover:border-rose-400 disabled:opacity-60">
            ลบไฟล์
          </button>
        </div>

        {/* input file */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
};

// หน้า กรอกข้อมูลแบบทดสอบ แล้วบันทึกไปสร้าง (step ถัดไปคือสร้างคำถาม)
const FormStepInfo: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // ฟิลด์ข้อมูลหลักของแบบทดสอบ
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [testType, setTestType] = useState<TestType>("positive");

  // เงื่อนไข “ต้องทำแบบทดสอบอื่นก่อน” + เกณฑ์คะแนน
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionOnID, setConditionOnID] = useState<number | undefined>(undefined);
  const [conditionScore, setConditionScore] = useState<number | undefined>(undefined);
  const [conditionType, setConditionType] = useState<"greaterThan" | "lessThan">("greaterThan");

  // รายการแบบทดสอบทั้งหมด (ไว้ให้เลือกเป็นเงื่อนไข)
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [loadingQs, setLoadingQs] = useState(true);

  // รูปปก + สถานะบันทึก
  const [pictureBase64, setPictureBase64] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // ref ของการ์ดหลัก (ช่วยจำกัดพื้นที่ dropdown)
  const cardRef = useRef<HTMLDivElement>(null);

  // โหลดรายการแบบทดสอบ (สำหรับ dropdown เงื่อนไขก่อนทำ)
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllQuestionnaires();
        setQuestionnaires(Array.isArray(data) ? data : []);
      } catch {
        messageApi.error("โหลดรายการข้อมูลไม่สำเร็จ");
      } finally {
        setLoadingQs(false);
      }
    })();
  }, [messageApi]);

  // ตรวจความครบถ้วนก่อนบันทึก: ชื่อ/คำอธิบาย/จำนวน/ประเภท/รูป และกรณีเปิดเงื่อนไขให้กรอกครบ
  const validateBeforeSubmit = (): string | null => {
    const n = name.trim();
    const d = description.trim();

    if (!n) return "กรุณากรอกชื่อแบบทดสอบ";
    if (!d) return "กรุณากรอกคำอธิบาย";
    if (!quantity || quantity < 1) return "จำนวนคำถามต้องมากกว่า 0";
    if (!testType) return "กรุณาเลือกประเภทแบบทดสอบ";
    if (!pictureBase64) return "กรุณาอัปโหลดรูปภาพก่อนบันทึก";

    if (hasCondition) {
      if (!conditionOnID) return "กรุณาเลือกแบบทดสอบที่ต้องทำก่อน";
      if (!conditionType) return "กรุณาเลือกเงื่อนไขคะแนน";
      const s = Number(conditionScore ?? NaN);
      if (!Number.isFinite(s)) return "กรุณาระบุคะแนนที่ต้องได้";
      if (s < 1) return "คะแนนที่ต้องได้ต้องมากกว่า 0";
    }
    return null;
  };

  // ส่งข้อมูลสร้างแบบทดสอบ > ถ้าสำเร็จพาไปหน้า “สร้างคำถาม”
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const v = validateBeforeSubmit();
    if (v) {
      messageApi.warning({ content: v, duration: 1.8 });
      return;
    }

    setSubmitting(true);
    let didNavigate = false;

    // ดึง uid จาก localStorage (ผู้สร้าง)
    const idStr = localStorage.getItem("id");
    const uid = idStr ? parseInt(idStr) : undefined;
    if (!uid) {
      messageApi.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      setSubmitting(false);
      return;
    }

    // เผื่อผู้ใช้ยังไม่เลื่อน stepper ให้ตั้งค่า default 1 เมื่อเปิดเงื่อนไข
    const effectiveScore = hasCondition ? (conditionScore ?? 1) : undefined;

    const payload: Questionnaire = {
      nameQuestionnaire: name.trim(),
      description: description.trim(),
      quantity,
      uid,
      testType,
      conditionOnID: hasCondition ? conditionOnID : undefined,
      conditionScore: effectiveScore,
      conditionType: hasCondition ? conditionType : undefined,
      picture: pictureBase64,
      questions: [], // ขั้นนี้ยังไม่สร้างคำถาม
      groups: [],
    };

    try {
      const created = await createQuestionnaire(payload);
      const questionnaireId = (created as any)?.id;
      if (!questionnaireId) throw new Error("ไม่พบ ID ของแบบทดสอบที่สร้าง");

      await new Promise<void>((resolve) => {
        messageApi.success({ content: "เพิ่มข้อมูลสำเร็จ", duration: 1.2, onClose: resolve });
      });

      // เลือก prefix เส้นทางตาม role แล้วพาไปหน้า “สร้างคำถาม”
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";

      didNavigate = true;
      navigate(`/${rolePrefix}/createquestion`, {
        state: { questionnaireId, quantity, name: name.trim() },  // ส่ง id เเละ name ไปใช้หน้าต่อไป
      });
    } catch (err) {
      console.error(err);
      messageApi.error({ content: "ไม่สามารถเพิ่มข้อมูลได้", duration: 2.0 });
    } finally {
      if (!didNavigate) setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Spin spinning={submitting} fullscreen tip="กำลังบันทึกข้อมูล..." />

      <div className="min-h-screen w-full bg-slate-100 py-8">
        <div className="w-full px-6">
          {/* ส่วนหัวของหน้า */}
          <div className="mb-6 flex items-center gap-3">
            <img src={createQuestionIcon} alt="icon" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-slate-800">สร้างแบบทดสอบสุขภาพจิต</h1>
          </div>

          {/* การ์ดหลักของฟอร์ม */}
          <div ref={cardRef} className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={onSubmit} className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
              {/* ซ้าย: ฟอร์มข้อความ/ตัวเลือก */}
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">ชื่อแบบทดสอบ *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">คำอธิบาย *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={fieldClass} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">จำนวนคำถาม *</label>
                    <NumberStepper value={quantity} onChange={setQuantity} min={1} max={999} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">ประเภทแบบทดสอบ *</label>
                    <DropdownSearchSelect
                      value={testType}
                      onChange={(v) => setTestType(v as TestType)}
                      options={[
                        { label: "เชิงบวก", value: "positive", icon: <span className="text-lg">😊</span> },
                        { label: "เชิงลบ", value: "negative", icon: <span className="text-lg">😟</span> },
                      ]}
                      placeholder="เลือกประเภท"
                      cardRef={cardRef}
                    />
                  </div>
                </div>

                {/* กล่องตั้งค่าเงื่อนไขก่อนทำแบบทดสอบ */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 hover:border-black"
                      checked={hasCondition}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasCondition(checked);
                        // เปิดแล้วตั้งค่าเริ่มต้นให้ครบ เพื่อไม่ให้ validate ติด
                        if (checked) { setConditionType("greaterThan"); setConditionScore((s) => s ?? 1); }
                        else { setConditionOnID(undefined); }
                      }}
                    />
                    แบบทดสอบนี้มีเงื่อนไขก่อนทำ
                  </label>

                  {hasCondition && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">แบบทดสอบที่ต้องทำก่อน *</label>
                        <DropdownSearchSelect
                          value={conditionOnID}
                          onChange={(v) => setConditionOnID(typeof v === "number" ? v : Number(v))}
                          options={questionnaires.map((q) => ({ label: q.nameQuestionnaire, value: q.id }))}
                          placeholder="-- เลือกแบบทดสอบ --"
                          className={loadingQs ? "opacity-60" : ""}
                          cardRef={cardRef}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">คะแนนที่ต้องได้ *</label>
                        <NumberStepper value={conditionScore ?? 1} onChange={(n) => setConditionScore(n)} min={1} max={100} />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">เงื่อนไขคะแนน *</label>
                        <DropdownSearchSelect
                          value={conditionType}
                          onChange={(v) => setConditionType(v as any)}
                          options={[
                            { label: "มากกว่าหรือเท่ากับ", value: "greaterThan", icon: <span className="text-base">≥</span> },
                            { label: "น้อยกว่า", value: "lessThan", icon: <span className="text-base">＜</span> },
                          ]}
                          placeholder="เลือกเงื่อนไข"
                          cardRef={cardRef}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ปุ่ม */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button type="button" onClick={() => navigate(-1)} className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700" disabled={submitting}>
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={
                      "rounded-xl px-5 py-2.5 font-medium text-white shadow-sm transition-colors " +
                      (submitting ? "bg-cyan-400 cursor-not-allowed" : "bg-[#5DE2FF] hover:bg-cyan-500")
                    }
                  >
                    {submitting ? "กำลังสร้าง..." : "สร้างแบบทดสอบ"}
                  </button>
                </div>
              </div>

              {/* ขวา: อัปโหลดรูปปกของแบบทดสอบ */}
              <UploadBox pictureBase64={pictureBase64} setPictureBase64={setPictureBase64} messageApi={messageApi} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormStepInfo;
