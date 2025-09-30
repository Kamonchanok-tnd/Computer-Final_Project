import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { FileText, MessageSquare, Pencil, Trash2, Plus } from "lucide-react";
import { getWordHealingMessageById, updateWordHealingMessage } from "../../../../services/https/message";
import {getAllArticleTypes,createArticleType,updateArticleType as apiUpdateArticleType,deleteArticleType as apiDeleteArticleType,} from "../../../../services/https/articletype";
import type { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import type { ArticleType } from "../../../../interfaces/IArticleType";
import editMessageIcon from "../../../../assets/editMessageIcon.png";

//ค่าคงที่ 
// รูปแบบตัวเลือกประเภทบทความที่โชว์ใน dropdown
type ArticleTypeOption = { id: number; label: string; description?: string };

// โหมดเนื้อหาบทความ หรือ ข้อความ
type ContentKind = "long" | "short";

// ข้อความ/บทความสั้น ให้ fallback หา id=29 หรือชื่อ ข้อความ
const SHORT_FALLBACK_ID = 29;            // id ของบทความประเภทข้อความ ในฝั่ง Backend
const SHORT_FALLBACK_NAME = "ข้อความ";

// หาค่า id ของประเภทข้อความ
function resolveShortTypeId(options: ArticleTypeOption[]) {
  const byId = options.find((o) => o.id === SHORT_FALLBACK_ID);
  if (byId) return byId.id;
  const byName = options.find((o) => o.label === SHORT_FALLBACK_NAME);
  if (byName) return byName.id;
  return undefined;
}

// แปลงวันที่ให้เป็นรูปแบบ YYYY-MM-DD
function formatYMD(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

//  ฟังก์ชันช่วยตรวจจับ error กรณี "ประเภทถูกเรียกใช้" จากฝั่ง Backend เพื่อแสดงเตือนใน FE
function isTypeInUseError(e: any) {
  //  เช็คสถานะ 409 (Conflict) เป็นหลัก
  const status = e?.response?.status;
  if (status === 409) return true;
  //  เผื่อ BE ส่ง code: "IN_USE"
  const code = e?.response?.data?.code || e?.code;
  if (code && String(code).toUpperCase().includes("IN_USE")) return true;
  //  เช็คข้อความภาษาไทย/อังกฤษ
  const msg = e?.response?.data?.message || e?.message || e?.toString?.() || "";
  return /ถูกใช้งาน|ถูกเรียกใช้|in use|referenced/i.test(msg);
}

// กำหนดชนิดข้อมูลฟอร์มสำหรับ state ภายในหน้า
interface FormDataType
  extends Omit<WordHealingContent, "photo" | "article_type_id" | "date" | "error"> {
  photo: string | null;          
  date: string;                 
  article_type_id: number | null;
  error: (message: string) => unknown;
}

// Main Component 
const EditMessagePage: React.FC = () => {
 
  const navigate = useNavigate();

  // รับค่า state จาก useLocation เพื่อทราบ id ที่ต้องการแก้ไข
  const { state } = useLocation() as { state?: { id?: number } };
  const editingId = state?.id;

  // อ้างอิง input[type=file] เพื่อสั่งเปิดด้วยปุ่ม
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ระบบแจ้งเตือน
  const [msgApi, msgCtx] = message.useMessage();

  // เก็บวันเผยแพร่เดิมเป็น ISO string (เพื่อส่งกลับไปตอนอัปเดต โดยไม่เปลี่ยนวัน)
  const originalDateISO = useRef<string>("");

  // โหมดเนื้อหา  long= บทความ เเละ short = ข้อความ
  const [contentKind, setContentKind] = useState<ContentKind>("long");

  // state หลักของฟอร์ม 
  const [formData, setFormData] = useState<FormDataType>({
    id: editingId ?? 0,
    name: "",
    author: "",
    no_of_like: 0,
    date: "",              
    photo: null,
    content: "",
    article_type_id: null,
    error: (m: string) => console.error(m),
    viewCount: 0,
  });

  // state สำหรับรูปตัวอย่าง และ modal รูป
  const [preview, setPreview] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // รายการประเภทบทความ สถานะโหลด เเละ id ประเภทข้อความ
  const [articleTypeOptions, setArticleTypeOptions] = useState<ArticleTypeOption[]>([]);
  const [articleTypeLoading, setArticleTypeLoading] = useState<boolean>(false);
  const [shortTypeId, setShortTypeId] = useState<number | undefined>(undefined);

  // สถานะและตัวช่วยของ dropdown ประเภท (กันล้นการ์ด + inline CRUD) 
  // สถานะระหว่างสร้าง/แก้ไข/ลบ ประเภทใน dropdown
  const [opLoading, setOpLoading] = useState<boolean>(false);
  // โหมดจัดการประเภท: none / create / edit
  const [manageMode, setManageMode] = useState<"none" | "create" | "edit">("none");
  
  // id ของประเภทที่กำลังแก้ไข โหมด edit
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  
  // ฟิลด์ในฟอร์มย่อยสร้าง/แก้ชื่อและคำอธิบายประเภท
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");

  // คุมการเปิด/ปิด dropdown และตำแหน่งเปิด (ขึ้นบน/ลงล่าง) ตามพื้นที่ว่างจริง
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");        // ข้อความค้นหาใน dropdown
  const [dropUp, setDropUp] = useState(false);           // true = เปิดขึ้นบน
  const [menuMaxH, setMenuMaxH] = useState<number>(280); // ความสูงสูงสุดของเมนู (dynamic)

  // อ้างอิง DOM เพื่อคำนวณพื้นที่ว่าง
  const typeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // จำกัดจำนวนแถวที่แสดง (ให้ list กระชับ)
  const VISIBLE_ITEMS = 5;
  const ITEM_ROW_H = 44;
  const listMaxH = Math.min(menuMaxH, VISIBLE_ITEMS * ITEM_ROW_H + 8);

  // สำหรับควบคุมโฟกัส item ใน list (เลื่อนเข้าเห็นอัตโนมัติ)
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);

 
  const calcDropDirection = () => {
    const fieldRect = typeRef.current?.getBoundingClientRect();
    if (!fieldRect) return;

    const cardRect = cardRef.current?.getBoundingClientRect();
    let spaceBelow = window.innerHeight - fieldRect.bottom;
    let spaceAbove = fieldRect.top;

    // จำกัดไม่ให้ทะลุขอบการ์ด
    if (cardRect) {
      spaceBelow = Math.min(spaceBelow, cardRect.bottom - fieldRect.bottom);
      spaceAbove = Math.min(spaceAbove, fieldRect.top - cardRect.top);
    }
    const preferUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    setDropUp(preferUp);
    const room = Math.max(160, Math.min(280, (preferUp ? spaceAbove : spaceBelow) - 12));
    setMenuMaxH(room);
  };

  // ปิดเมนูเมื่อคลิกนอก
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!typeRef.current) return;
      if (!typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
        resetManage();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ปิดเมนูเมื่อกด ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTypeOpen(false);
        resetManage();
      }
    };
    if (typeOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [typeOpen]);

  // เมื่อเมนูเปิด: ผูก resize/scroll เพื่อ recalculation ตำแหน่งและความสูง
  useEffect(() => {
    if (!typeOpen) return;
    const recalc = () => calcDropDirection();
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    cardRef.current?.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      cardRef.current?.removeEventListener("scroll", recalc, true);
    };
  }, [typeOpen]);

  // กรองตัวเลือกใน dropdown ตามคำค้นหา 
  const filteredTypeOptions = useMemo(() => {
    const q = typeQuery.trim().toLowerCase();
    if (!q) return articleTypeOptions;
    return articleTypeOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase() || "").includes(q)
    );
  }, [typeQuery, articleTypeOptions]);

  // ตั้ง activeIdx ให้เป็น 0 เมื่อเมนูเปิดและมีรายการ (หรือ -1 เมื่อไม่มี)
  useEffect(() => {
    if (articleTypeLoading || !typeOpen) return;
    if (filteredTypeOptions.length === 0) { setActiveIdx(-1); return; }
    setActiveIdx((i) => (i < 0 ? 0 : Math.min(i, filteredTypeOptions.length - 1)));
  }, [filteredTypeOptions, typeOpen, articleTypeLoading]);

  // เลื่อนรายการให้ item active อยู่ในสายตา
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  //สวิตช์สลับโหมด (pill)
  // เก็บตำแหน่ง/ขนาดของแท่ง highlight
  const [thumb, setThumb] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const pillRef = useRef<HTMLDivElement>(null);
  const longRef = useRef<HTMLButtonElement>(null);
  const shortRef = useRef<HTMLButtonElement>(null);

  // คำนวณตำแหน่ง/ขนาดของ thumb ให้ครอบปุ่มที่เลือกพอดี
  const updateThumb = () => {
    const target = contentKind === "long" ? longRef.current : shortRef.current;
    const container = pillRef.current;
    if (!target || !container) return;
    const btnRect = target.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const left = Math.max(0, btnRect.left - contRect.left + 4);
    const width = Math.max(0, btnRect.width - 8);
    setThumb({ left, width });
  };

  // อัปเดตเมื่อโหมดเปลี่ยน
  useEffect(() => { updateThumb(); }, [contentKind]);

  // ผูก ResizeObserver + event resize/scroll เพื่อให้ thumb ตามตำแหน่งเสมอ
  useEffect(() => {
    const ro = new ResizeObserver(updateThumb);
    if (pillRef.current) ro.observe(pillRef.current);
    if (longRef.current) ro.observe(longRef.current);
    if (shortRef.current) ro.observe(shortRef.current);
    window.addEventListener("resize", updateThumb);
    window.addEventListener("scroll", updateThumb, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateThumb);
      window.removeEventListener("scroll", updateThumb, true);
    };
  }, []);

  // โหลดประเภทบทความ เเละ โหลดข้อมูลเดิมของรายการที่กำลังแก้ไข
  useEffect(() => {
    (async () => {
      try {
        setArticleTypeLoading(true);

        // โหลดประเภทบทความทั้งหมดจาก Backend
        const list: ArticleType[] = await getAllArticleTypes();
        const opts: ArticleTypeOption[] = (list || []).map((t) => ({
          id: Number(t.id!),
          label: t.name,
          description: t.description || "",
        }));
        setArticleTypeOptions(opts);

        // เก็บ id ของประเภท
        const shortId = resolveShortTypeId(opts);
        setShortTypeId(shortId);

        // ถ้ามี id ที่จะแก้  โหลดข้อมูลเดิมของข้อความ/บทความ
        if (editingId) {
          const data = await getWordHealingMessageById(String(editingId));
          if (!data) throw new Error("not found");

          // เก็บวันเดิมเป็น ISO string เพื่อส่งคืนตอนอัปเดต โดยไม่เปลี่ยนวัน
          const asDate = new Date(String(data.date));
          originalDateISO.current = !isNaN(asDate.getTime())
            ? asDate.toISOString()
            : (formatYMD(String(data.date)) ? new Date(`${formatYMD(String(data.date))}T00:00:00`).toISOString() : "");

          // เซ็ตค่าฟอร์มจากข้อมูลเดิม
          setFormData((prev) => ({
            ...prev,
            id: data.id ?? editingId,
            name: data.name ?? "",
            author: data.author ?? "",
            no_of_like: data.no_of_like ?? 0,
            date: formatYMD(String(data.date)),
            photo: data.photo ?? null,
            content: data.content ?? "",
            article_type_id: data.article_type_id ?? null,
            viewCount: data.viewCount ?? 0,
          }));

          // ถ้ารูปเป็น data URL โชว์พรีวิว
          if (data.photo && (String(data.photo).startsWith("data:") || String(data.photo).startsWith("http"))) {
            setPreview(String(data.photo));
          } else {
            setPreview("");
          }

          // ตรวจเป็นโหมด short หรือ long จาก article_type_id ที่โหลดมา
          const isShort =
            (data.article_type_id != null &&
              (data.article_type_id === shortId || data.article_type_id === SHORT_FALLBACK_ID)) ||
            (!!shortId === false &&
              opts.find((o) => o.label === SHORT_FALLBACK_NAME && o.id === data.article_type_id));
          setContentKind(isShort ? "short" : "long");
        }
      } catch {
        msgApi.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setArticleTypeLoading(false);
      }
    })();
  }, [editingId]);


  //จัดการไฟล์รูปภาพ (เลือก/drag&drop/ลบ)
  //เลือกไฟล์จากเครื่อง
  const handleFilePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // จำกัดเฉพาะไฟล์ภาพ และขนาด ≤ 5MB
    if (!file.type.startsWith("image/")) return msgApi.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    if (file.size / 1024 / 1024 >= 5) return msgApi.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");

    // เคลียร์รูปเดิม
    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));

    // แปลงเป็น base64 เพื่อส่งขึ้น Backend และแสดงพรีวิว
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, photo: base64 }));
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // ลบรูปออกจากฟอร์ม
  const removeFile = () => {
    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));
    msgApi.info("ลบรูปแล้ว");
  };

  //ฟังก์ชันช่วยสำหรับจัดการประเภทใน dropdown
  // รีเซ็ตโหมดจัดการประเภท
  const resetManage = () => {
    setManageMode("none");
    setEditTargetId(null);
    setNameInput("");
    setDescInput("");
  };

  // เริ่มโหมดสร้างประเภท
  const beginCreate = () => {
    setManageMode("create");
    setEditTargetId(null);
    setNameInput(typeQuery.trim() || "");
    setDescInput("");
  };

  // เริ่มโหมดแก้ไขประเภท
  const beginEdit = (opt: ArticleTypeOption) => {
    setManageMode("edit");
    setEditTargetId(opt.id);
    setNameInput(opt.label);
    setDescInput(opt.description || "");
  };

  // เรียก API สร้างประเภทแล้วอัปเดต state
  const handleCreateType = async () => {
    const name = nameInput.trim();
    if (!name) return msgApi.warning("กรุณาระบุชื่อประเภท");
    try {
      setOpLoading(true);
      const created = await createArticleType({ name, description: descInput.trim() });
      const newOpt: ArticleTypeOption = {
        id: Number(created.id),
        label: created.name,
        description: created.description || "",
      };
      setArticleTypeOptions((prev) => [newOpt, ...prev]);
      setFormData((prev) => ({ ...prev, article_type_id: newOpt.id }));
      setShortTypeId((prev) => prev ?? resolveShortTypeId([newOpt, ...articleTypeOptions]));
      msgApi.success("สร้างประเภทบทความสำเร็จ");
      resetManage();
      setTypeOpen(false);
    } catch {
      msgApi.error("สร้างประเภทบทความไม่สำเร็จ");
    } finally {
      setOpLoading(false);
    }
  };

  // เรียก API แก้ไขประเภท แล้วอัปเดต state
  const handleEditType = async () => {
    if (!editTargetId) return;
    const name = nameInput.trim();
    if (!name) return msgApi.warning("กรุณาระบุชื่อประเภท");
    try {
      setOpLoading(true);
      const updated = await apiUpdateArticleType(editTargetId, { name, description: descInput.trim() });
      setArticleTypeOptions((prev) =>
        prev.map((o) => (o.id === editTargetId ? { ...o, label: updated.name, description: updated.description || "" } : o))
      );
      msgApi.success("แก้ไขประเภทบทความสำเร็จ");
      resetManage();
      setTypeOpen(false);
    } catch {
      msgApi.error("แก้ไขประเภทบทความไม่สำเร็จ");
    } finally {
      setOpLoading(false);
    }
  };

  // เรียก API ลบประเภท แล้วอัปเดต state 
  const handleDeleteType = async (opt: ArticleTypeOption) => {
    try {
      setOpLoading(true);
      await apiDeleteArticleType(opt.id);

      setArticleTypeOptions((prev) => prev.filter((o) => o.id !== opt.id));
      setFormData((prev) => {
        if (prev.article_type_id === opt.id) {
          const rest = articleTypeOptions.filter((o) => o.id !== opt.id);
          return { ...prev, article_type_id: rest[0]?.id ?? null };
        }
        return prev;
      });

      msgApi.success("ลบประเภทบทความสำเร็จ");
    } catch (e: any) {
      //  เตือนกรณีประเภทถูกเรียกใช้อยู่ (มาจาก BE ส่ง 409/IN_USE)
      if (isTypeInUseError(e)) {
        msgApi.warning("ไม่สามารถลบประเภทนี้ได้ เนื่องจากกำลังถูกใช้งานอยู่ในบทความ/ข้อความ");
      } else {
        msgApi.error(e?.message || "ลบประเภทบทความไม่สำเร็จ");
      }
    } finally {
      setOpLoading(false);
    }
  };


  // submit ฟอร์มเพื่อบันทึกข้อมูลที่แก้ไขกลับไป Backend
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; 

    // ตรวจสอบความครบถ้วนขั้นต่ำของฟอร์ม
    if (formData.name.trim() === "") return msgApi.warning("กรุณากรอกชื่อบทความ/ข้อความ");
    if (formData.author.trim() === "") return msgApi.warning("กรุณากรอกชื่อผู้เขียน/แหล่งที่มา");
    if (formData.content.trim() === "") return msgApi.warning("กรุณากรอกเนื้อหา");
    if (!formData.photo) return msgApi.warning("กรุณาอัปโหลดรูปภาพประกอบ (จำเป็น)");

    // กำหนดประเภทบทความที่ใช้จริง: ถ้าโหมด short บังคับใช้ shortTypeId (หรือ fallback id)
    const resolvedArticleTypeId =
      contentKind === "short" ? (shortTypeId ?? SHORT_FALLBACK_ID) : formData.article_type_id ?? undefined;
    if (!resolvedArticleTypeId) return msgApi.warning("กรุณาเลือกประเภทบทความ");

    // เตรียม body สำหรับอัปเดต
    const body = {
      name: formData.name.trim(),
      author: formData.author.trim(),
      no_of_like: formData.no_of_like ?? 0,
      content: formData.content.trim(),
      photo: formData.photo,
      article_type_id: resolvedArticleTypeId,
      date: originalDateISO.current || (formData.date ? new Date(`${formData.date}T00:00:00`).toISOString() : undefined),
    };

    setSaving(true);
    let didNavigate = false;
    try {

      // เรียก API อัปเดต
      const ok = await updateWordHealingMessage(String(formData.id), body as any);
      if (!ok) throw new Error("update failed");

      // แจ้งเตือน เเละ navigate
      await new Promise<void>((resolve) =>
        msgApi.success({ content: "แก้ไขข้อมูลสำเร็จ", duration: 1.2, onClose: resolve })
      );

      didNavigate = true;
      const role = localStorage.getItem("role");
      const rolePrefix = role === "superadmin" ? "superadmin" : "admin";
      navigate(`/${rolePrefix}/messagePage`, {
        replace: true,
        state: { flash: { type: "success", content: "เเก้ไขข้อมูลสำเร็จ" } },
      });
    } catch {
      msgApi.error({ content: "เกิดข้อผิดพลาดในการเเก้ไขข้อมูล", duration: 2.0 });
    } finally {
      // ถ้าไม่ได้ย้ายหน้า ให้คืนสถานะปุ่ม
      if (!didNavigate) setSaving(false);
    }
  };

 
  return (
    <div className="w-full min-h-screen bg-slate-100 p-6 lg:p-8">
      {/* เเจ้งเตือนสถานะ */}
      {msgCtx}

      
      <Spin spinning={saving} fullscreen tip="กำลังบันทึกข้อมูล..." />

      {/* ส่วนหัวเรื่อง */}
      <div className="mb-3 flex items-center gap-1 sm:gap-2">
        <img src={editMessageIcon} alt="manage icon" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 inline-block" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">แก้ไขข้อความให้กำลังใจ</h1>
      </div>

      {/* การ์ดครอบฟอร์ม */}
      <div
        ref={cardRef}
        className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-5 shadow-sm lg:p-8 xl:p-10 lg:overflow-hidden"
      >
        {/* ฟอร์มหลัก แบ่ง 2 คอลัมน์บนจอใหญ่ */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-2">

          {/* คอลัมน์ซ้าย: ชื่อ/ผู้เขียน/สวิตช์โหมด/ประเภท/เนื้อหา */}
          <div className="space-y-5">
            {/* ชื่อบทความ/ข้อความ */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                ชื่อข้อความหรือบทความ <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                placeholder="เช่น กำลังใจในวันที่เหนื่อยล้า"
              />
            </div>

            {/* ผู้เขียน/อ้างอิง/แหล่งที่มา */}
            <div className="space-y-2">
              <label htmlFor="author" className="block text-sm font-medium text-slate-700">
                ผู้เขียน/อ้างอิง/แหล่งที่มา <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="author"
                name="author"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                placeholder="เช่น ทีมงานดูแลใจ"
              />
            </div>

            {/* สวิตช์โหมดเนื้อหา */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">โหมดเนื้อหา</label>
              <div className="w-full flex justify-center">
                <div className="relative w-fit mx-auto">
                  <div ref={pillRef} className="relative inline-flex rounded-2xl border border-slate-200 bg-[#5DE2FF] p-1 shadow-sm">
                    <span className="absolute top-1 bottom-1 rounded-xl bg-white shadow transition-all duration-300" style={{ left: `${thumb.left}px`, width: `${thumb.width}px` }} />
                    <div className="relative z-10 grid grid-cols-2 gap-1">
                      <button
                        ref={longRef}
                        type="button"
                        onClick={() => setContentKind("long")}
                        className={[
                          "flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 sm:px-5 py-2 text-sm font-medium transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
                          contentKind === "long" ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
                        ].join(" ")}
                        aria-pressed={contentKind === "long"}
                      >
                        <FileText className="h-4 w-4" />
                        บทความ
                      </button>
                      <button
                        ref={shortRef}
                        type="button"
                        onClick={() => setContentKind("short")}
                        className={[
                          "flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 sm:px-5 py-2 text-sm font-medium transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
                          contentKind === "short" ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
                        ].join(" ")}
                        aria-pressed={contentKind === "short"}
                      >
                        <MessageSquare className="h-4 w-4" />
                        ข้อความ/บทความสั้น
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* เลือกประเภทบทความ (แสดงเฉพาะโหมด "บทความ") */}
            {contentKind === "long" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  ประเภทบทความ <span className="text-rose-500">*</span>
                </label>

                {/* dropdown แบบ custom */}
                <div ref={typeRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { calcDropDirection(); setTypeOpen((o) => !o); }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-slate-900"
                  >
                    <span>
                      {articleTypeLoading
                        ? "กำลังโหลดประเภทบทความ..."
                        : (articleTypeOptions.find((o) => o.id === formData.article_type_id)?.label || "เลือกประเภทบทความ")}
                    </span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4 opacity-60">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {typeOpen && (
                    <div
                      className={[
                        "absolute z-20 w-full overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-lg",
                        dropUp ? "bottom-full mb-1" : "top-full mt-1",
                      ].join(" ")}
                      style={{ maxHeight: menuMaxH }}
                    >
                      {/* ช่องค้นหาเเละปุ่มสร้างประเภท */}
                      <div className="p-2">
                        <div className="flex gap-2">
                          <input
                            value={typeQuery}
                            onChange={(e) => setTypeQuery(e.target.value)}
                            placeholder="ค้นหา..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 sm:py-1.5"
                          />
                          <button
                            type="button"
                            onClick={beginCreate}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 sm:py-1.5"
                          >
                            <Plus className="h-4 w-4" /> สร้าง
                          </button>
                        </div>
                      </div>

                      {/* รายการประเภท ปุ่มแก้/ลบ ต่อ item */}
                      <ul role="listbox" ref={listRef} className="overflow-y-auto py-1" style={{ maxHeight: listMaxH }}>
                        {articleTypeLoading && <li className="px-3 py-2 text-sm text-slate-500">กำลังโหลด...</li>}
                        {!articleTypeLoading && filteredTypeOptions.length === 0 && (
                          <li className="px-3 py-2 text-sm text-slate-500">ไม่พบประเภทบทความ</li>
                        )}

                        {filteredTypeOptions.map((o, idx) => (
                          <li key={o.id}>
                            <div className="flex items-center">
                              <button
                                type="button"
                                data-idx={idx}
                                className={[
                                  "flex-1 px-3 py-3 text-left text-base hover:bg-slate-100",
                                  "sm:py-2 sm:text-sm",
                                  o.id === formData.article_type_id ? "bg-slate-50 font-medium" : "",
                                ].join(" ")}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, article_type_id: o.id }));
                                  setTypeOpen(false);
                                  setTypeQuery("");
                                  resetManage();
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm sm:text-[13px]">{o.label}</span>
                                  {o.description && <span className="text-xs text-slate-500 line-clamp-2">{o.description}</span>}
                                </div>
                              </button>

                              <div className="pr-2 flex items-center gap-1">
                                <button
                                  type="button"
                                  title="แก้ไข"
                                  onClick={(e) => { e.stopPropagation(); beginEdit(o); }}
                                  className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="ลบ"
                                  disabled={opLoading}
                                  onClick={(e) => { e.stopPropagation(); handleDeleteType(o); }}
                                  className="rounded-md p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* โซนฟอร์มย่อย (create/edit) */}
                      {(manageMode === "create" || manageMode === "edit") && (
                        <div className="border-t border-slate-200 p-3 bg-white sticky bottom-0">
                          <div className="text-xs text-slate-500 mb-2">
                            {manageMode === "create" ? "สร้างประเภทบทความใหม่" : "แก้ไขประเภทบทความ"}
                          </div>

                          <div className="space-y-2">
                            <input
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                              placeholder="ชื่อประเภท เช่น บทความเชิงวิเคราะห์"
                              maxLength={128}
                            />
                            <textarea
                              value={descInput}
                              onChange={(e) => setDescInput(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                              placeholder="คำอธิบาย (ไม่บังคับ)"
                              maxLength={1000}
                              rows={2}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-end gap-2">
                            <button type="button" onClick={resetManage} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" disabled={opLoading}>
                              ยกเลิก
                            </button>
                            {manageMode === "create" ? (
                              <button type="button" onClick={handleCreateType} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50" disabled={opLoading}>
                                {opLoading ? "กำลังสร้าง..." : "สร้าง"}
                              </button>
                            ) : (
                              <button type="button" onClick={handleEditType} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50" disabled={opLoading}>
                                {opLoading ? "กำลังบันทึก..." : "บันทึก"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* กล่องกรอกเนื้อหา */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                เนื้อหา{contentKind === "short" ? " (ข้อความ/บทความสั้น)" : "บทความ"} <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                className="min-h-40 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                placeholder={contentKind === "short" ? "พิมพ์ข้อความสั้นๆ ให้กำลังใจ..." : "พิมพ์ข้อความให้กำลังใจที่นี่..."}
              />
            </div>
          </div>

          {/* คอลัมน์ขวา: อัปโหลดรูป เเละ ปุ่ม action*/}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              อัปโหลดรูปภาพประกอบ <span className="text-rose-500">*</span>
            </label>

            {/* กล่องอัปโหลด */}
            <div
              className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f && f.type.startsWith("image/")) {
                  const evt = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFilePick(evt);
                } else {
                  msgApi.error("กรุณาลากไฟล์รูปภาพเท่านั้น");
                }
              }}
            >
              {/* อินพุตไฟล์ */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePick} className="hidden" />

              {/* พื้นที่พรีวิว หรือ ข้อความแนะนำ */}
              <div className="flex min-h-[280px] items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="preview" className="max-h-[420px] w-full rounded-xl object-contain" />
                ) : formData.photo ? (
                  <div className="text-center text-sm text-slate-500">
                    เลือกรูปไว้แล้ว แต่ไม่พบตัวอย่าง (กรุณาอัปโหลดใหม่ถ้าต้องการแสดงตัวอย่าง)
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-slate-600">ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกรูป</div>
                    <div className="mt-1 text-xs text-slate-500">รองรับไฟล์ภาพเท่านั้น</div>
                  </div>
                )}
              </div>

              {/* ปุ่มควบคุมไฟล์ */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  เลือกรูป
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  disabled={!preview}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  เปิดดูรูปตัวอย่าง
                </button>
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={!formData.photo}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  ลบรูป
                </button>
              </div>
            </div>

            {/* ปุ่ม action: ย้อนกลับ เเละ บันทึก */}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/messagePage")}
                disabled={saving}
                className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={saving}
                aria-busy={saving}
                className="inline-flex items-center justify-center rounded-xl bg-[#5DE2FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 active:scale-[.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {contentKind === "short" ? "บันทึกข้อความ/บทความสั้น" : "บันทึกบทความ"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal แสดงรูปตัวอย่าง (คลิกพื้นหลังเพื่อปิด) */}
      {showPreviewModal && preview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setShowPreviewModal(false)}>
          <div className="max-h-[85vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Preview" className="mx-auto max-h-[80vh] w-full rounded-xl object-contain" />
            <div className="p-2 text-right">
              <button onClick={() => setShowPreviewModal(false)} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMessagePage;
