import React, { useEffect, useMemo, useRef, useState } from "react";
import { message, Spin } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import createQuestionIcon from "../../../../assets/createQuestionnaire.png";
import { getAllQuestionnaires, getQuestionnaireById, updateQuestionnaire } from "../../../../services/https/questionnaire";
import { Questionnaire } from "../../../../interfaces/IQuestionnaire";

// Types & helpers พื้นฐาน
type TestType = "positive" | "negative";
type Option = { label: string; value: string | number; icon?: React.ReactNode | string };

//* คลาส input มาตรฐานของฟอร์ม
const fieldClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 transition-colors " +
  "focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black bg-white";

// ref ที่รับได้ (ส่งให้ dropdown เพื่อคุมพื้นที่ popup ภายในการ์ด)
type CardRefLike =
  | React.MutableRefObject<HTMLDivElement | null>
  | React.RefObject<HTMLDivElement | null>
  | null
  | undefined;

// Dropdown แบบค้นหา + เลือกเด้งขึ้น/ลงอัตโนมัติ
const DropdownSearchSelect: React.FC<{
  value?: string | number;
  onChange: (val: any) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  cardRef?: CardRefLike;
}> = ({
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  disabled,
  className = "",
  cardRef,
}) => {
  const [open, setOpen] = useState(false);             // เปิด/ปิดเมนู
  const [term, setTerm] = useState("");                // คำค้นหา
  const boxRef = useRef<HTMLDivElement | null>(null);  // กล่องหลัก
  const selected = options.find((o) => o.value === value);

  // จัดทิศเมนู (drop-up/drop-down) และจำกัดความสูงตามพื้นที่
  const [dropUp, setDropUp] = useState(false);
  const [menuMaxH, setMenuMaxH] = useState(288);
  const IDEAL_MENU_H = 288;

  // คำนวณพื้นที่ว่างด้านบน/ล่าง แล้วตัดสินใจให้เมนูเด้งขึ้น/ลง
  const calcDrop = () => {
    const fieldRect = boxRef.current?.getBoundingClientRect();
    if (!fieldRect) return;

    let spaceBelow = window.innerHeight - fieldRect.bottom;
    let spaceAbove = fieldRect.top;

    // ถ้าอยู่ใน card ให้ไม่ให้เมนูล้นออกนอก card
    const cardRect = (cardRef as any)?.current?.getBoundingClientRect?.();
    if (cardRect) {
      spaceBelow = Math.min(spaceBelow, cardRect.bottom - fieldRect.bottom);
      spaceAbove = Math.min(spaceAbove, fieldRect.top - cardRect.top);
    }

    const preferUp = spaceBelow < IDEAL_MENU_H && spaceAbove > spaceBelow;
    setDropUp(preferUp);
    const room = (preferUp ? spaceAbove : spaceBelow) - 12; // กันชน
    setMenuMaxH(Math.max(200, Math.min(IDEAL_MENU_H, room)));
  };

  // จัดการปิดเมื่อคลิกนอก/กด Esc และผูก event resize/scroll เพื่อ recalculation
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const recalc = () => calcDrop();

    calcDrop();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    (cardRef as any)?.current?.addEventListener?.("scroll", recalc, true);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      (cardRef as any)?.current?.removeEventListener?.("scroll", recalc, true);
    };
  }, [open, cardRef]);

  // กรองรายการตามคำค้น
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? options.filter((o) => o.label.toLowerCase().includes(t)) : options;
  }, [term, options]);

  return (
    <div ref={boxRef} className={"relative " + className}>
      {/* ปุ่มหลักของ dropdown */}
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
        {/* ลูกศรเปิด/ปิด */}
        <svg
          className={"h-4 w-4 shrink-0 text-slate-500 transition-transform " + (open ? "rotate-180" : "")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
        </svg>
      </button>

      {/* กล่องเมนูตัวเลือก */}
      {open && (
        <div
          className={[
            "absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
          ].join(" ")}
        >
          {/* แถบค้นหา (sticky) */}
          <div className="sticky top-0 z-10 bg-white">
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-slate-200">
              <div className="flex items-center rounded-lg border border-slate-300 px-3 py-2 hover:border-black w-full">
                {/* ไอคอนค้นหา */}
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
              <button
                className="mr-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                type="button"
              >
                ปิด
              </button>
            </div>
          </div>

          {/* รายการตัวเลือก (scroll ได้) */}
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
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    {o.icon &&
                      (typeof o.icon === "string" ? (
                        <img src={o.icon} alt="" className="h-4 w-4" />
                      ) : (
                        o.icon
                      ))}
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

// Stepper เลือกจำนวนเลขแบบกด + / - 
const NumberStepper: React.FC<{
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}> = ({ value, onChange, min = 1, max = 9999, className = "" }) => {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className={"flex w-full items-stretch gap-2 " + className}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-black hover:bg-slate-50"
      >
        −
      </button>
      <input
        value={value}
        readOnly
        inputMode="numeric"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-slate-800 focus:outline-none hover:border-black"
        onWheel={(e) => (e.currentTarget as any).blur()}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-black hover:bg-slate-50"
      >
        +
      </button>
    </div>
  );
};

// กล่องอัปโหลดรูป: แปลงไฟล์เป็น base64 + ลบรูป
const UploadBox: React.FC<{
  pictureBase64?: string;
  setPictureBase64: (v?: string) => void;
  messageApi: MessageInstance;
  onPick?: () => void;   // เรียกเมื่อเลือกรูปใหม่
  onRemove?: () => void; // เรียกเมื่อลบรูป
}> = ({ pictureBase64, setPictureBase64, messageApi, onPick, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // helper: ไฟล์ > base64
  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
    });

  // ตรวจชนิด/ขนาดไฟล์ แล้วแปลงเป็น base64
  const handleFile = async (file?: File) => {
    if (!file) return;
    const accept = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!accept.includes(file.type))
      return messageApi.error("อนุญาตเฉพาะไฟล์รูปภาพ (JPG/PNG/WebP/GIF)");
    if (file.size / 1024 / 1024 > 5) return messageApi.error("ไฟล์ใหญ่เกิน 5MB");
    const b64 = await fileToBase64(file);
    setPictureBase64(b64);
    setFileName(file.name);
    onPick?.();
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">อัปโหลดรูปภาพประกอบ</label>

      {/* โซนลากวางไฟล์รูป + พรีวิว */}
      <div
        className={`group rounded-[22px] border-2 border-dashed p-4 sm:p-6 transition-colors ${
          isDragging ? "border-black" : "border-slate-300 hover:border-black"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="mx-auto w-full max-w-[780px] rounded-xl bg-slate-100/40 p-3">
          <div className="relative w-full rounded-lg bg-white/60 grid place-items-center overflow-hidden min-h-[220px] max-h-[60vh]">
            {pictureBase64 ? (
              <img
                src={pictureBase64}
                alt={fileName || "preview"}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400 p-6">
                วางไฟล์ที่นี่ หรือกด "เลือกไฟล์"
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มเลือก/ลบรูป */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-black hover:bg-slate-50"
          >
            เลือกไฟล์
          </button>
          <button
            type="button"
            onClick={() => {
              setPictureBase64(undefined);
              onRemove?.();
            }}
            disabled={!pictureBase64}
            className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700 shadow-sm transition-colors hover:border-rose-400 disabled:opacity-60"
          >
            ลบไฟล์
          </button>
        </div>

        {/* input จริงที่ซ่อนอยู่ */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
};

// หน้าแก้ไขแบบคัดกรอง 
const EditQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const [msg, contextHolder] = message.useMessage();

  // หา id ของแบบคัดกรอง: จาก URL param -> state -> query
  const qidFromState = (location.state as any)?.questionnaireId as number | undefined;
  const qid = useMemo(() => {
    if (params.id && !isNaN(Number(params.id))) return Number(params.id);
    if (qidFromState) return qidFromState;
    const search = new URLSearchParams(location.search).get("id");
    return search ? Number(search) : undefined;
  }, [params.id, qidFromState, location.search]);

  // สเตตฟอร์มหลัก
  const [saving, setSaving] = useState(false);  // สถานะกำลังบันทึก

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [testType, setTestType] = useState<TestType>("positive");

  // เงื่อนไขก่อนทำแบบคัดกรอง (optional)
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionOnID, setConditionOnID] = useState<number | undefined>(undefined);
  const [conditionScore, setConditionScore] = useState<number | undefined>(undefined);
  const [conditionType, setConditionType] = useState<"greaterThan" | "lessThan">("greaterThan");

  const [questionnaires, setQuestionnaires] = useState<any[]>([]); // รายการแบบคัดกรองอื่น ๆ ให้เลือกตั้งเป็นเงื่อนไข
  const [current, setCurrent] = useState<any | null>(null);        // ข้อมูลแบบคัดกรองปัจจุบัน

  const [pictureBase64, setPictureBase64] = useState<string | undefined>(undefined); // รูปใหม่ที่อัปโหลด (base64)
  const [pictureRemoved, setPictureRemoved] = useState(false); // ผู้ใช้เลือกลบรูปเดิมหรือไม่

  const cardRef = useRef<HTMLDivElement>(null);

  // โหลดข้อมูลเริ่มต้นของแบบคัดกรอง + รายการแบบคัดกรองทั้งหมด
  useEffect(() => {
    const load = async () => {
      if (!qid) {
        msg.error("ไม่พบรหัสแบบคัดกรอง");
        navigate(-1);
        return;
      }
      try {
        const [data, list] = await Promise.all([
          getQuestionnaireById(qid),
          getAllQuestionnaires(),
        ]);
        setCurrent(data);
        setQuestionnaires((Array.isArray(list) ? list : []).filter((x) => x.id !== qid));

        // เซ็ตค่าเริ่มต้นลงฟอร์ม
        setName(data?.nameQuestionnaire ?? "");
        setDescription(data?.description ?? "");
        setQuantity(Number(data?.quantity ?? 1));
        setTestType((data?.testType as TestType) ?? "positive");

        setHasCondition(Boolean(data?.conditionOnID));
        setConditionOnID(data?.conditionOnID ?? undefined);
        setConditionScore(data?.conditionScore ?? undefined);
        setConditionType((data?.conditionType as any) ?? "greaterThan");

        // แปลงรูปจาก Backend ให้แสดงเป็น data URL ถ้ายังไม่ใช่
        const ensureDataUrl = (pic?: string | null) =>
          !pic ? undefined : pic.startsWith("data:") ? pic : `data:image/jpeg;base64,${pic}`;
        const url = ensureDataUrl(data?.picture);
        setPictureBase64(url);
        setPictureRemoved(false);
      } catch (err) {
        console.error(err);
        msg.error("โหลดข้อมูลไม่สำเร็จ");
        navigate(-1);
      }
    };
    load();
  }, [qid]);

  // ตรวจความถูกต้องก่อนบันทึก (แจ้งด้วย message)
  const validateBeforeSave = (): string | null => {
    const n = name.trim();
    const d = description.trim();

    if (!n) return "กรุณากรอกชื่อแบบคัดกรอง";
    if (!d) return "กรุณากรอกคำอธิบาย";
    if (!quantity || quantity < 1) return "จำนวนคำถามต้องมากกว่า 0";
    if (!testType) return "กรุณาเลือกประเภทแบบคัดกรอง";

    // กรณีรูป: ถ้าผู้ใช้กดลบ ต้องมีการอัปโหลดใหม่
    if (pictureRemoved && !pictureBase64) return "กรุณาอัปโหลดรูปภาพก่อนบันทึก";
    
    // ถ้าไม่ได้ลบ แต่ไม่มีทั้งรูปใหม่และรูปเดิม
    if (!pictureRemoved && !pictureBase64 && !current?.picture)
      return "กรุณาอัปโหลดรูปภาพก่อนบันทึก";

    if (hasCondition) {
      if (!conditionOnID) return "กรุณาเลือกแบบคัดกรองที่ต้องทำก่อน";
      if (!conditionType) return "กรุณาเลือกเงื่อนไขคะแนน";
      const s = Number(conditionScore ?? NaN);
      if (!Number.isFinite(s)) return "กรุณาระบุคะแนนที่ต้องได้";
      if (s < 1) return "คะแนนที่ต้องได้ต้องมากกว่า 0";
    }
    return null;
  };
  
  // submit: ตรวจ > สร้าง payload > เรียก API > เด้งไปหน้าแก้ไขคำถาม/คำตอบ
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qid) return;
    
    // ตรวจ
    const v = validateBeforeSave();
    if (v) {
      msg.warning({ content: v, duration: 1.8 });
      return;
    }
    
    setSaving(true);
    let didNavigate = false;
    try {
      const payload: Questionnaire = {
        nameQuestionnaire: name.trim(),
        description: description.trim(),
        quantity,
        uid: current?.uid, // ใช้ uid ของเจ้าของเดิม
        testType,
        conditionOnID: hasCondition ? conditionOnID : undefined,
        conditionScore: hasCondition ? conditionScore : undefined,
        conditionType: hasCondition ? conditionType : undefined,

        // กติกาเลือกรูป: ถ้าลบ > ใช้รูปใหม่, ถ้าไม่ลบ > ใช้รูปใหม่หรือรูปเดิม
        picture: pictureRemoved ? pictureBase64! : (pictureBase64 ?? current?.picture),

        // ส่งคืนกลุ่ม/คำถามเดิม (ไม่ได้แก้ในหน้านี้)
        questions: current?.questions ?? [],
        groups: current?.groups ?? [],
      };
 
      // เรียกฟังก์ชัน
      await updateQuestionnaire(qid, payload);

      await new Promise<void>((resolve) =>
        msg.success({ content: "แก้ไขข้อมูลสำเร็จ", duration: 1.2, onClose: resolve })
      );

      didNavigate = true;
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";

      // เสร็จแล้วไปหน้าแก้ไขคำถาม/คำตอบต่อ พร้อมส่ง id + name ไปด้วย
      navigate(`/${rolePrefix}/editQuestionAndAnswerPage`, {
        state: { questionnaireId: qid, name: name.trim(), },
      });
    } catch (err) {
      console.error(err);
      msg.error("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      if (!didNavigate) setSaving(false);
    }
  };

  // UI หลักของหน้า
  return (
    <div className="min-h-screen w-full bg-slate-100 py-8">
      {/* การเเจ้งเตือน */}
      {contextHolder}
  
      <Spin spinning={saving} fullscreen tip="กำลังบันทึกข้อมูล..." />

      <div className="w-full px-6">
        {/* หัวเรื่อง */}
        <div className="mb-6 flex items-center gap-3">
          <img src={createQuestionIcon} alt="icon" className="h-12 w-12 object-contain" />
          <h1 className="text-2xl font-bold text-slate-800">แก้ไขแบบคัดกรองสุขภาพจิต</h1>
        </div>

        {/* การ์ดฟอร์ม */}
        <div ref={cardRef} className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
            
            {/* ซ้าย: ฟอร์มข้อความหลัก */}
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">ชื่อแบบคัดกรอง *</label>
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">ประเภทแบบคัดกรอง *</label>
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

              {/* บล็อก: ตั้งค่าเงื่อนไขก่อนทำ (optional) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 hover:border-black"
                    checked={hasCondition}
                    onChange={(e) => setHasCondition(e.target.checked)}
                  />
                  แบบคัดกรองนี้มีเงื่อนไขก่อนทำ
                </label>

                {hasCondition && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">แบบคัดกรองที่ต้องทำก่อน *</label>
                      <DropdownSearchSelect
                        value={conditionOnID}
                        onChange={(v) => setConditionOnID(typeof v === "number" ? v : Number(v))}
                        options={questionnaires.map((q) => ({
                          label: q.nameQuestionnaire,
                          value: q.id,
                        }))}
                        placeholder="-- เลือกแบบคัดกรอง --"
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

              {/* ปุ่ม บันทึกเเละยกเลิก */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700"
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={
                    "rounded-xl px-5 py-2.5 font-medium text-white shadow-sm transition-colors " +
                    (saving ? "bg-cyan-400 cursor-not-allowed" : "bg-[#5DE2FF] hover:bg-cyan-500")
                  }
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </div>

            {/* ขวา: อัปโหลด/ลบรูป + sync สถานะลบ */}
            <UploadBox
              pictureBase64={pictureBase64}
              setPictureBase64={setPictureBase64}
              messageApi={msg}
              onPick={() => setPictureRemoved(false)}   // เลือกรูปใหม่ = ถือว่าไม่ได้ลบแล้ว
              onRemove={() => setPictureRemoved(true)}  // ลบรูป = ต้องอัปโหลดใหม่ตอนบันทึก
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionnaire;
