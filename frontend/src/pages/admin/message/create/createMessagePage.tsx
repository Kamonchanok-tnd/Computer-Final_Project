import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FileText, MessageSquare } from "lucide-react";
import { createWordHealingMessage, getArticleTypeOptionsDetailed } from "../../../../services/https/message";
import { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import createMessageIcon from "../../../../assets/createMessageIcon.png";

/* Types & Utils */
type ArticleTypeOption = { value: string; label: string; description?: string };

interface FormDataType extends Omit<WordHealingContent, "photo" | "article_type"> {
  photo: string | null;
  error: (message: string) => unknown;
  idts?: number;
  content: string;
  articleType: string;
  viewCount: number;
}
type ContentKind = "long" | "short";

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

/** ให้รองรับทั้ง RefObject และ MutableRefObject */
type CardRefLike = { current: HTMLDivElement | null } | null | undefined;

/* Mobile DatePicker (smart drop-up) */
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
            <button type="button" className="rounded-md px-2 py-1 hover:bg-slate-100" onClick={() => { onChange(""); setViewMonth(new Date(today)); setOpen(false); }}>Clear</button>
            <button type="button" className="rounded-md px-2 py-1 hover:bg-slate-100" onClick={() => { onChange(fmtYMD(today)); setViewMonth(new Date(today)); setOpen(false); }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Main*/
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
    articleType: "OpinionPiece",
    error: (message: string) => console.error(message),
    idts: undefined,
    viewCount: 0,
  });

  const [preview, setPreview] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [articleTypeOptions, setArticleTypeOptions] = useState<ArticleTypeOption[]>([]);
  const [articleTypeLoading, setArticleTypeLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setArticleTypeLoading(true);
        const detailed = await getArticleTypeOptionsDetailed();
        const opts: ArticleTypeOption[] = (detailed || []).map((o: any) => {
          const labelText =
            typeof o?.label === "string" ? o.label :
            typeof o?.label?.th === "string" ? o.label.th :
            typeof o?.name === "string" ? o.name :
            typeof o?.title === "string" ? o.title :
            typeof o?.raw?.label === "string" ? o.raw.label :
            typeof o?.raw?.name === "string" ? o.raw.name :
            String(o?.value ?? "");
          const descText =
            typeof o?.description === "string" ? o.description :
            typeof o?.raw?.description === "string" ? o.raw.description :
            typeof o?.detail === "string" ? o.detail :
            typeof o?.raw?.detail === "string" ? o.raw.detail :
            typeof o?.raw?.desc === "string" ? o.raw.desc :
            "";
          return { value: String(o?.value ?? labelText), label: labelText, description: descText };
        });
        setArticleTypeOptions(opts);
        if (opts.length && !opts.some((x) => x.value === String(formData.articleType))) {
          setFormData((prev) => ({ ...prev, articleType: opts[0].value }));
        }
      } catch {
        msgApi.error("โหลดประเภทบทความไม่สำเร็จ");
      } finally {
        setArticleTypeLoading(false);
      }
    })();
  }, []);

  /* Smart drop-up ของ dropdown ประเภทบทความ */
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [menuMaxH, setMenuMaxH] = useState<number>(280);
  const typeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const IDEAL_MENU_H = 280;

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
      if (!typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTypeOpen(false); };
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
      (o) => o.label.toLowerCase().includes(q) || (o.description?.toLowerCase() || "").includes(q)
    );
  }, [typeQuery, articleTypeOptions]);

  const selectedTypeLabel = useMemo(() => {
    if (articleTypeLoading) return "กำลังโหลดประเภทบทความ...";
    const f = articleTypeOptions.find((o) => o.value === String(formData.articleType));
    return f?.label || "เลือกประเภทบทความ";
  }, [articleTypeLoading, articleTypeOptions, formData.articleType]);

  /* ========================== สวิตช์โหมด ========================== */
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

  /*  บันทึก */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return msgApi.error("กรุณากรอกชื่อบทความ");
    if (!formData.author.trim()) return msgApi.error("กรุณากรอกชื่อผู้เขียน");
    if (!formData.date) return msgApi.error("กรุณาเลือกวันที่เผยแพร่");
    if (!formData.content.trim()) return msgApi.error("กรุณากรอกเนื้อหา");

    const picked = new Date(`${formData.date}T00:00:00`);
    const today = new Date(`${todayStr}T00:00:00`);
    if (isNaN(picked.getTime())) return msgApi.error("วันที่ไม่ถูกต้อง");
    if (picked > today) return msgApi.error("เลือกวันที่ในอนาคตไม่ได้");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("author", formData.author);
    form.append("no_of_like", String(formData.no_of_like));
    form.append("date", formData.date);
    form.append("content", formData.content);
    form.append("viewCount", String(formData.viewCount ?? 0));
    form.append("article_type", contentKind === "short" ? "บทความสั้น" : formData.articleType);
    if (formData.photo) form.append("photo", formData.photo);

    try {
      const ok = await createWordHealingMessage(form);
      if (ok) {
        msgApi.success(contentKind === "short" ? "บันทึกบทความสั้นสำเร็จ!" : "บันทึกบทความสำเร็จ!");
        setTimeout(() => navigate("/admin/messagePage"), 800);
      } else {
        msgApi.error("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      console.error(err);
      msgApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  /* เลือกไฟล์ */
  const handleFilePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    if (!isImage && !isPDF) return msgApi.error("กรุณาเลือกไฟล์รูปภาพหรือ PDF เท่านั้น");
    if (file.size / 1024 / 1024 >= 5) return msgApi.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");

    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, photo: base64 }));
      if (isImage) setPreview(base64);
    };
    reader.readAsDataURL(file);
  };
  const removeFile = () => {
    setPreview("");
    setFormData((prev) => ({ ...prev, photo: null }));
  };

  const [useMobilePicker, setUseMobilePicker] = useState(false);
  useEffect(() => {
    setUseMobilePicker(isTouchDevice() || window.innerWidth < 640);
    const onResize = () => setUseMobilePicker(isTouchDevice() || window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-100 p-6 lg:p-8">
      {msgCtx}

      <div className="mb-3 flex items-center gap-1 sm:gap-2">
        <img src={createMessageIcon} alt="manage icon" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 inline-block" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 leading-tight">สร้างบทความให้กำลังใจ</h1>
      </div>

      <div ref={cardRef} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-5 shadow-sm lg:p-8 xl:p-10">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                ชื่อบทความ <span className="text-rose-500">*</span>
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
                        บทความสั้น
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ประเภทบทความ  */}
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
                    <span className={articleTypeLoading ? "text-slate-400" : ""}>{selectedTypeLabel}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4 opacity-60">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {typeOpen && (
                    <div className={["absolute z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg", dropUp ? "bottom-full mb-1" : "top-full mt-1"].join(" ")}>
                      <div className="p-2">
                        <input
                          value={typeQuery}
                          onChange={(e) => setTypeQuery(e.target.value)}
                          placeholder="ค้นหา..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                        />
                      </div>
                      <ul role="listbox" className="overflow-y-auto py-1" style={{ maxHeight: menuMaxH }}>
                        {articleTypeLoading && <li className="px-3 py-2 text-sm text-slate-500">กำลังโหลด...</li>}
                        {!articleTypeLoading && filteredTypeOptions.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">ไม่พบประเภทบทความ</li>}
                        {filteredTypeOptions.map((o) => (
                          <li key={o.value}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={o.value === String(formData.articleType)}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${o.value === String(formData.articleType) ? "bg-slate-50 font-medium" : ""}`}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, articleType: o.value }));
                                setTypeOpen(false);
                                setTypeQuery("");
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm">{o.label}</span>
                                {o.description && <span className="text-xs text-slate-500 line-clamp-2">{o.description}</span>}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                เนื้อหา{contentKind === "short" ? " (บทความสั้น)" : "บทความ"} <span className="text-rose-500">*</span>
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

          {/* Right */}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-slate-700">อัปโหลดรูปภาพประกอบบทความ (ถ้ามี)</label>

            <div
              className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) {
                  const evt = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFilePick(evt);
                }
              }}
            >
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFilePick} className="hidden" />

              <div className="flex min-h-[280px] items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="preview" className="max-h-[420px] w-full rounded-xl object-contain" />
                ) : formData.photo ? (
                  <div className="text-center text-sm text-slate-500">เลือกไฟล์ PDF แล้ว (ไม่มีตัวอย่างภาพ)</div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-slate-600">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (รองรับรูปภาพ)</div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">เลือกไฟล์</button>
                <button type="button" onClick={() => setShowPreviewModal(true)} disabled={!preview} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50">เปิดดูรูปตัวอย่าง</button>
                <button type="button" onClick={removeFile} disabled={!formData.photo} className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-50">ลบไฟล์</button>
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
              <button type="button" onClick={() => navigate("/admin/messagePage")} className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700">ย้อนกลับ</button>
              <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-[#5DE2FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 active:scale-[.99] disabled:opacity-50">{contentKind === "short" ? "บันทึกบทความสั้น" : "บันทึกบทความ"}</button>
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
