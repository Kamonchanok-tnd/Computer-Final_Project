import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { FileText, MessageSquare, Pencil, Trash2, Plus } from "lucide-react";
import { createWordHealingMessage } from "../../../../services/https/message";
import {getAllArticleTypes,createArticleType,updateArticleType,deleteArticleType,} from "../../../../services/https/articletype";
import type { ArticleType } from "../../../../interfaces/IArticleType";
import createMessageIcon from "../../../../assets/createMessageIcon.png";

/* Utils */
type ArticleTypeOption = { id: number; label: string; description?: string };

const SHORT_FALLBACK_ID = 29; // id ของบทความประเภทข้อความใน BE
const SHORT_FALLBACK_NAME = "ข้อความ";

const fmtYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const isTouchDevice = () =>
  (typeof window !== "undefined" &&
    (window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window)) ||
  false;

function resolveShortTypeId(options: ArticleTypeOption[]) {
  const byId = options.find((o) => o.id === SHORT_FALLBACK_ID);
  if (byId) return byId.id;
  const byName = options.find((o) => o.label === SHORT_FALLBACK_NAME);
  if (byName) return byName.id;
  return undefined;
}

/* Types */
type ContentKind = "long" | "short";

interface FormDataType {
  id: number;
  name: string;
  author: string;
  no_of_like: number;
  date: string;
  photo: string | null; // base64
  content: string;
  article_type_id: number | null;
  viewCount: number;
  error: (message: string) => unknown;
  idts?: number;
}

/* DatePicker (mobile smart drop-up) */
type CardRefLike = { current: HTMLDivElement | null } | null | undefined;

const MobileDateField: React.FC<{
  value: string;
  max: string;
  onChange: (ymd: string) => void;
  cardRef?: CardRefLike;
}> = ({ value, max, onChange, cardRef }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [menuMaxH, setMenuMaxH] = useState(320);

  const today = useMemo(() => new Date(`${max}T00:00:00`), [max]);
  const initial = useMemo(() => (value ? new Date(`${value}T00:00:00`) : today), [value, today]);
  const [viewMonth, setViewMonth] = useState<Date>(new Date(initial));

  const weeks = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startIdx = first.getDay();
    const total = last.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const out: (Array<Date | null>)[] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [viewMonth]);

  const calcDrop = () => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    let below = window.innerHeight - rect.bottom;
    let above = rect.top;
    const cardRect = cardRef?.current?.getBoundingClientRect();
    if (cardRect) {
      below = Math.min(below, cardRect.bottom - rect.bottom);
      above = Math.min(above, rect.top - cardRect.top);
    }
    const IDEAL = 320;
    const preferUp = below < IDEAL && above > below;
    setDropUp(preferUp);
    const room = (preferUp ? above : below) - 12;
    setMenuMaxH(Math.max(220, Math.min(IDEAL, room)));
  };

  useEffect(() => {
    if (!open) return;
    const recalc = () => calcDrop();
    recalc();

    const onDoc = (e: MouseEvent) => {
      if (!fieldRef.current) return;
      if (!fieldRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    cardRef?.current?.addEventListener?.("scroll", recalc, true);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      cardRef?.current?.removeEventListener?.("scroll", recalc, true);
    };
  }, [open, cardRef]);

  const selectDate = (d: Date) => {
    if (d.getTime() > today.getTime()) return;
    onChange(fmtYMD(d));
    setOpen(false);
  };

  return (
    <div ref={fieldRef} className="relative">
      <button
        type="button"
        onClick={() => {
          calcDrop();
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-slate-900"
      >
        <span>{value || "เลือกวันที่ (แตะเพื่อเลือก)"}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 opacity-60" fill="currentColor">
          <path d="M6 8l4 4 4-4H6z" />
        </svg>
      </button>

      {open && (
        <div
          className={[
            "absolute z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg",
            dropUp ? "bottom-full mb-1" : "top-full mt-1",
          ].join(" ")}
          style={{ maxHeight: menuMaxH }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <button type="button" className="rounded-md px-2 py-1 text-sm hover:bg-slate-100" onClick={() => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
            <div className="text-sm font-medium">
              {viewMonth.toLocaleString("en-US", { month: "long" })} {viewMonth.getFullYear()}
            </div>
            <button type="button" className="rounded-md px-2 py-1 text-sm hover:bg-slate-100" onClick={() => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
          </div>

          <div className="grid grid-cols-7 px-2 pt-2 text-center text-xs text-slate-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 p-2">
            {weeks.map((row, i) =>
              row.map((cell, j) => {
                if (!cell) return <div key={`${i}-${j}`} className="h-9" />;
                const disabled = cell.getTime() > today.getTime();
                const isSelected = value && fmtYMD(cell) === value;
                return (
                  <button
                    key={`${i}-${j}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(cell)}
                    className={[
                      "h-9 rounded-lg text-sm",
                      disabled ? "cursor-not-allowed text-slate-300" : "hover:bg-slate-100",
                      isSelected ? "bg-slate-900 text-white hover:bg-slate-900" : "text-slate-700",
                    ].join(" ")}
                  >
                    {cell.getDate()}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-sm">
            <button type="button" className="rounded-md px-2 py-1 hover:bg-slate-100" onClick={() => { onChange(""); setViewMonth(new Date(today)); }}>Clear</button>
            <button type="button" className="rounded-md px-2 py-1 hover:bg-slate-100" onClick={() => { onChange(fmtYMD(today)); setViewMonth(new Date(today)); }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Main */
const CreateMessagePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msgApi, msgCtx] = message.useMessage();

  const todayStr = fmtYMD(new Date());
  const [contentKind, setContentKind] = useState<ContentKind>("long");

  const [formData, setFormData] = useState<FormDataType>({
    id: 0,
    name: "",
    author: "",
    no_of_like: 0,
    date: "",
    photo: null,
    content: "",
    article_type_id: null,
    error: (message: string) => console.error(message),
    idts: undefined,
    viewCount: 0,
  });

  const [preview, setPreview] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [articleTypeOptions, setArticleTypeOptions] = useState<ArticleTypeOption[]>([]);
  const [articleTypeLoading, setArticleTypeLoading] = useState<boolean>(false);
  const [shortTypeId, setShortTypeId] = useState<number | undefined>(undefined);

  /* Create Update Delete states for dropdown */
  const [opLoading, setOpLoading] = useState<boolean>(false);
  const [manageMode, setManageMode] = useState<"none" | "create" | "edit">("none");
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");

  /* Load article types */
  useEffect(() => {
    (async () => {
      try {
        setArticleTypeLoading(true);
        const list: ArticleType[] = await getAllArticleTypes();
        const opts: ArticleTypeOption[] = (list || []).map((t) => ({
          id: Number(t.id!),
          label: t.name,
          description: t.description || "",
        }));
        setArticleTypeOptions(opts);
        setShortTypeId(resolveShortTypeId(opts));
        if (!formData.article_type_id && opts.length) {
          setFormData((p) => ({ ...p, article_type_id: opts[0].id }));
        }
      } catch {
        msgApi.error("โหลดประเภทบทความไม่สำเร็จ");
      } finally {
        setArticleTypeLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* dropdown positioning */
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [menuMaxH, setMenuMaxH] = useState<number>(280);
  const typeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const IDEAL_MENU_H = 280;

  const VISIBLE_ITEMS = 5;
  const ITEM_ROW_H = 44;
  const listMaxH = Math.min(menuMaxH, VISIBLE_ITEMS * ITEM_ROW_H + 8);

  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const calcDropDirection = () => {
    const fieldRect = typeRef.current?.getBoundingClientRect();
    if (!fieldRect) return;

    let spaceBelow = window.innerHeight - fieldRect.bottom;
    let spaceAbove = fieldRect.top;

    const cardRect = cardRef.current?.getBoundingClientRect();
    if (cardRect) {
      spaceBelow = Math.min(spaceBelow, cardRect.bottom - fieldRect.bottom);
      spaceAbove = Math.min(spaceAbove, fieldRect.top - cardRect.top);
    }

    const preferUp = spaceBelow < IDEAL_MENU_H && spaceAbove > spaceBelow;
    setDropUp(preferUp);

    const room = (preferUp ? spaceAbove : spaceBelow) - 12;
    setMenuMaxH(Math.max(160, Math.min(IDEAL_MENU_H, room)));
  };

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

  const filteredTypeOptions = useMemo(() => {
    const q = typeQuery.trim().toLowerCase();
    if (!q) return articleTypeOptions;
    return articleTypeOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase() || "").includes(q)
    );
  }, [typeQuery, articleTypeOptions]);

  useEffect(() => {
    if (articleTypeLoading) return;
    if (!typeOpen) return;
    if (filteredTypeOptions.length === 0) {
      setActiveIdx(-1);
      return;
    }
    setActiveIdx((i) => {
      if (i < 0) return 0;
      if (i > filteredTypeOptions.length - 1) return filteredTypeOptions.length - 1;
      return i;
    });
  }, [filteredTypeOptions, typeOpen, articleTypeLoading]);

  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  /* switch UI thumb */
  const [thumb, setThumb] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const pillRef = useRef<HTMLDivElement>(null);
  const longRef = useRef<HTMLButtonElement>(null);
  const shortRef = useRef<HTMLButtonElement>(null);
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
  useEffect(() => { updateThumb(); }, [contentKind]);
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

  /* file handler */
  const handleFilePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) return msgApi.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    if (file.size / 1024 / 1024 >= 5) return msgApi.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");

    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, photo: base64 }));
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };
  const removeFile = () => {
    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));
    msgApi.info("ลบรูปแล้ว");
  };

  /* Create Update Delete helpers */
  const resetManage = () => {
    setManageMode("none");
    setEditTargetId(null);
    setNameInput("");
    setDescInput("");
  };
  const beginCreate = () => {
    setManageMode("create");
    setEditTargetId(null);
    setNameInput(typeQuery.trim() || "");
    setDescInput("");
  };
  const beginEdit = (opt: ArticleTypeOption) => {
    setManageMode("edit");
    setEditTargetId(opt.id);
    setNameInput(opt.label);
    setDescInput(opt.description || "");
  };
  const handleCreate = async () => {
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
    } catch (e: any) {
      msgApi.error(e?.message || "สร้างประเภทบทความไม่สำเร็จ");
    } finally {
      setOpLoading(false);
    }
  };
  const handleEdit = async () => {
    if (!editTargetId) return;
    const name = nameInput.trim();
    if (!name) return msgApi.warning("กรุณาระบุชื่อประเภท");
    try {
      setOpLoading(true);
      const updated = await updateArticleType(editTargetId, { name, description: descInput.trim() });
      setArticleTypeOptions((prev) =>
        prev.map((o) =>
          o.id === editTargetId ? { ...o, label: updated.name, description: updated.description || "" } : o
        )
      );
      msgApi.success("แก้ไขประเภทบทความสำเร็จ");
      resetManage();
      setTypeOpen(false);
    } catch (e: any) {
      msgApi.error(e?.message || "แก้ไขประเภทบทความไม่สำเร็จ");
    } finally {
      setOpLoading(false);
    }
  };
  const handleDelete = async (opt: ArticleTypeOption) => {
    try {
      setOpLoading(true);
      await deleteArticleType(opt.id);
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
      msgApi.error(e?.message || "ลบประเภทบทความไม่สำเร็จ");
    } finally {
      setOpLoading(false);
    }
  };

  /* mobile datepicker? */
  const [useMobilePicker, setUseMobilePicker] = useState(false);
  useEffect(() => {
    setUseMobilePicker(isTouchDevice() || window.innerWidth < 640);
    const onResize = () => setUseMobilePicker(isTouchDevice() || window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() === "") return msgApi.warning("กรุณากรอกชื่อบทความ/ข้อความ");
    if (formData.author.trim() === "") return msgApi.warning("กรุณากรอกชื่อผู้เขียน/แหล่งที่มา");
    if (!formData.date) return msgApi.warning("กรุณาเลือกวันที่เผยแพร่");
    if (formData.content.trim() === "") return msgApi.warning("กรุณากรอกเนื้อหา");
    if (!formData.photo) return msgApi.warning("กรุณาอัปโหลดรูปภาพประกอบ (จำเป็น)");

    const picked = new Date(`${formData.date}T00:00:00`);
    const today = new Date(`${todayStr}T00:00:00`);
    if (isNaN(picked.getTime())) return msgApi.warning("วันที่ไม่ถูกต้อง");
    if (picked > today) return msgApi.warning("เลือกวันที่ในอนาคตไม่ได้");

    // resolve article_type_id
    const resolvedArticleTypeId =
      contentKind === "short"
        ? shortTypeId
        : formData.article_type_id ?? undefined;

    if (!resolvedArticleTypeId) {
      msgApi.warning("ไม่พบประเภท ID 29 หรือชื่อ 'ข้อความ' โปรดสร้างหรือเลือกประเภทก่อน");
      return;
    }

    const form = new FormData();
    form.append("name", formData.name.trim());
    form.append("author", formData.author.trim());
    form.append("no_of_like", String(formData.no_of_like ?? 0));
    form.append("date", formData.date);
    form.append("content", formData.content.trim());
    form.append("viewCount", String(formData.viewCount ?? 0));
    form.append("article_type_id", String(resolvedArticleTypeId));
    form.append("photo", formData.photo!);

    try {
      setSaving(true);
      const ok = await createWordHealingMessage(form);
      if (!ok) throw new Error("เพิ่มข้อมูลไม่สำเร็จ");
      await new Promise<void>((resolve) =>
        msgApi.success({ content: "เพิ่มข้อมูลสำเร็จ", duration: 1.2, onClose: resolve })
      );
      navigate("/admin/messagePage", {
        replace: true,
        state: { flash: { type: "success", content: "เพิ่มข้อมูลสำเร็จ" } },
      });
    } catch (err) {
      console.error(err);
      msgApi.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  /* saving spinner */
  const [saving, setSaving] = useState(false);

  return (
    <div className="w-full min-h-screen bg-slate-100 p-6 lg:p-8">
      {msgCtx}
      <Spin spinning={saving} fullscreen tip="กำลังบันทึกข้อมูล..." />

      <div className="mb-3 flex items-center gap-1 sm:gap-2">
        <img src={createMessageIcon} alt="manage icon" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 inline-block" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">สร้างข้อความให้กำลังใจ</h1>
      </div>

      <div ref={cardRef} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-5 shadow-sm lg:p-8 xl:p-10">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          
          {/* ฝั่งซ้าย */}
          <div className="space-y-5">
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

            {/* Switch */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">โหมดเนื้อหา (เลือกประเภทเนื้อหาที่ต้องการสร้าง)</label>
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

            {/* ประเภทบทความ */}
            {contentKind === "long" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  ประเภทบทความ <span className="text-rose-500">*</span>
                </label>
                <div ref={typeRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      calcDropDirection();
                      setTypeOpen((o) => !o);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-slate-900"
                  >
                    <span>
                      {articleTypeLoading
                        ? "กำลังโหลดประเภทบทความ..."
                        : (articleTypeOptions.find((o) => o.id === formData.article_type_id)?.label ||
                          "เลือกประเภทบทความ")}
                    </span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4 opacity-60">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {typeOpen && (
                    <div className={["absolute z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg", dropUp ? "bottom-full mb-1" : "top-full mt-1"].join(" ")}>
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

                      <ul
                        role="listbox"
                        ref={listRef}
                        className="overflow-y-auto py-1"
                        style={{ maxHeight: listMaxH }}
                      >
                        {articleTypeLoading && <li className="px-3 py-2 text-sm text-slate-500">กำลังโหลด...</li>}
                        {!articleTypeLoading && filteredTypeOptions.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">ไม่พบประเภทบทความ</li>}

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
                                  onClick={(e) => { e.stopPropagation(); handleDelete(o); }}
                                  className="rounded-md p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

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
                            <button
                              type="button"
                              onClick={resetManage}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                              disabled={opLoading}
                            >
                              ยกเลิก
                            </button>
                            {manageMode === "create" ? (
                              <button
                                type="button"
                                onClick={handleCreate}
                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                                disabled={opLoading}
                              >
                                {opLoading ? "กำลังสร้าง..." : "สร้าง"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleEdit}
                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                                disabled={opLoading}
                              >
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

            {/* เนื้อหา */}
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

          {/* ฝั่งขวา */}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              อัปโหลดรูปภาพประกอบ <span className="text-rose-500">*</span>
            </label>

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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFilePick}
                className="hidden"
              />

              <div className="flex min-h-[280px] items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="preview" className="max-h-[420px] w-full rounded-xl object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-slate-600">ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกรูป</div>
                    <div className="mt-1 text-xs text-slate-500">รองรับไฟล์ภาพเท่านั้น</div>
                  </div>
                )}
              </div>

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

            {/* วันที่เผยแพร่ */}
            <div className="mt-5 space-y-2">
              <label className="block text-sm font-medium text-slate-700">วันที่เผยแพร่ <span className="text-rose-500">*</span></label>
              {useMobilePicker ? (
                <MobileDateField value={formData.date} max={todayStr} onChange={(ymd) => setFormData((prev) => ({ ...prev, date: ymd }))} cardRef={cardRef} />
              ) : (
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  max={todayStr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/messagePage")}
                className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700"
              >
                ย้อนกลับ
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#5DE2FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 active:scale-[.99]"
              >
                {contentKind === "short" ? "บันทึกข้อความ/บทความสั้น" : "บันทึกบทความ"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && preview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setShowPreviewModal(false)}>
          <div className="max-h-[85vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Preview" className="mx-auto max-h-[80vh] w-full rounded-xl object-contain" />
            <div className="p-2 text-right">
              <button onClick={() => setShowPreviewModal(false)} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMessagePage;



