// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { message } from "antd"; // ใช้ระบบแจ้งเตือนของ Ant Design
// import {createWordHealingMessage,getArticleTypeOptionsDetailed,} from "../../../../services/https/message";
// import { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
// import createMessageIcon from "../../../../assets/createMessageIcon.png";

// // ประเภทตัวเลือกบทความ (ไม่ใช้ AntD) + เพิ่ม description สำหรับแสดงใน dropdown
// type ArticleTypeOption = { value: string; label: string; description?: string };

// // โครงข้อมูลฟอร์ม (เก็บรูปเป็น base64)
// interface FormDataType extends Omit<WordHealingContent, "photo"> {
//   photo: string | null;
//   error: (message: string) => unknown;
//   idts?: number;
//   content: string;
//   articleType: string;
//   viewCount: number;
// }

// const CreateMessagePage: React.FC = () => {
//   const navigate = useNavigate();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [msgApi, msgCtx] = message.useMessage(); // context ของ antd message

//   // วันที่วันนี้ (YYYY-MM-DD) ใช้จำกัดไม่ให้เลือกอนาคต
//   const todayStr = (() => {
//     const d = new Date();
//     const y = d.getFullYear();
//     const m = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${y}-${m}-${day}`;
//   })();

//   const [formData, setFormData] = useState<FormDataType>({
//     id: 0,
//     name: "",
//     author: "",
//     no_of_like: 0,
//     date: "",
//     photo: null,
//     content: "",
//     articleType: "OpinionPiece",
//     error: (message: string) => console.error(message),
//     idts: undefined,
//     viewCount: 0,
//   });

//   const [preview, setPreview] = useState<string>("");
//   const [showPreviewModal, setShowPreviewModal] = useState(false);

//   // โหลดประเภทบทความ (แปลง label/description ให้เป็น string กัน [object Object])
//   const [articleTypeOptions, setArticleTypeOptions] = useState<ArticleTypeOption[]>([]);
//   const [articleTypeLoading, setArticleTypeLoading] = useState<boolean>(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         setArticleTypeLoading(true);
//         const detailed = await getArticleTypeOptionsDetailed();
//         const opts: ArticleTypeOption[] = (detailed || []).map((o: any) => {
//           const labelText =
//             typeof o?.label === "string" ? o.label :
//             typeof o?.label?.th === "string" ? o.label.th :
//             typeof o?.name === "string" ? o.name :
//             typeof o?.title === "string" ? o.title :
//             typeof o?.raw?.label === "string" ? o.raw.label :
//             typeof o?.raw?.name === "string" ? o.raw.name :
//             String(o?.value ?? "");
//           const descText =
//             typeof o?.description === "string" ? o.description :
//             typeof o?.raw?.description === "string" ? o.raw.description :
//             typeof o?.detail === "string" ? o.detail :
//             typeof o?.raw?.detail === "string" ? o.raw.detail :
//             typeof o?.raw?.desc === "string" ? o.raw.desc :
//             "";
//           return { value: String(o?.value ?? labelText), label: labelText, description: descText };
//         });
//         setArticleTypeOptions(opts);

//         // ถ้าค่าเดิมไม่อยู่ในรายการ → ตั้งเป็นตัวแรก
//         if (opts.length && !opts.some((x) => x.value === String(formData.articleType))) {
//           setFormData((prev) => ({ ...prev, articleType: opts[0].value }));
//         }
//       } catch (err) {
//         msgApi.error("โหลดประเภทบทความไม่สำเร็จ");
//       } finally {
//         setArticleTypeLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ----- Custom dropdown (ไม่ใช้ AntD) -----
//   const [typeOpen, setTypeOpen] = useState(false);
//   const [typeQuery, setTypeQuery] = useState("");
//   const typeRef = useRef<HTMLDivElement>(null);

//   // ปิดเมื่อคลิกนอกกรอบ
//   useEffect(() => {
//     const onDocClick = (e: MouseEvent) => {
//       if (!typeRef.current) return;
//       if (!typeRef.current.contains(e.target as Node)) setTypeOpen(false);
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, []);

//   // ปิดด้วย Esc
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setTypeOpen(false);
//     };
//     if (typeOpen) document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [typeOpen]);

//   const filteredTypeOptions = useMemo(() => {
//     const q = typeQuery.trim().toLowerCase();
//     if (!q) return articleTypeOptions;
//     return articleTypeOptions.filter(
//       (o) => o.label.toLowerCase().includes(q) || (o.description?.toLowerCase() || "").includes(q)
//     );
//   }, [typeQuery, articleTypeOptions]);

//   const selectedTypeLabel = useMemo(() => {
//     if (articleTypeLoading) return "กำลังโหลดประเภทบทความ...";
//     const f = articleTypeOptions.find((o) => o.value === String(formData.articleType));
//     return f?.label || "เลือกประเภทบทความ";
//   }, [articleTypeLoading, articleTypeOptions, formData.articleType]);

//   // ตัวที่เลือกไว้ (ไว้แสดงคำอธิบายใต้ dropdown)
//   const selectedType = useMemo(
//     () => articleTypeOptions.find((o) => o.value === String(formData.articleType)),
//     [articleTypeOptions, formData.articleType]
//   );

//   // บันทึกข้อมูล
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) return msgApi.error("กรุณากรอกชื่อบทความ");
//     if (!formData.author.trim()) return msgApi.error("กรุณากรอกชื่อผู้เขียน");
//     if (!formData.date) return msgApi.error("กรุณาเลือกวันที่เผยแพร่");
//     if (!formData.content.trim()) return msgApi.error("กรุณากรอกเนื้อหาบทความ");

//     // ตรวจวัน (ห้ามอนาคต)
//     const picked = new Date(`${formData.date}T00:00:00`);
//     const today = new Date(`${todayStr}T00:00:00`);
//     if (isNaN(picked.getTime())) return msgApi.error("วันที่ไม่ถูกต้อง");
//     if (picked > today) return msgApi.error("เลือกวันที่ในอนาคตไม่ได้");

//     const form = new FormData();
//     form.append("name", formData.name);
//     form.append("author", formData.author);
//     form.append("no_of_like", String(formData.no_of_like));
//     form.append("date", formData.date);
//     form.append("content", formData.content);
//     form.append("article_type", formData.articleType);
//     if (formData.photo) form.append("photo", formData.photo);

//     try {
//       const success = await createWordHealingMessage(form);
//       if (success) {
//         // แสดงข้อความสำเร็จด้วย AntD แล้วค่อย navigate กลับ
//         msgApi.success("บันทึกข้อมูลบทความสำเร็จ!");
//         setTimeout(() => navigate("/admin/messagePage"), 800);
//       } else {
//         msgApi.error("เกิดข้อผิดพลาดในการบันทึกบทความ");
//       }
//     } catch (err) {
//       console.error(err);
//       msgApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
//     }
//   };

//   // เลือกไฟล์ (preview เฉพาะรูป)
//   const handleFilePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const isImage = file.type.startsWith("image/");
//     const isPDF = file.type === "application/pdf";

//     if (!isImage && !isPDF) return msgApi.error("กรุณาเลือกไฟล์รูปภาพหรือ PDF เท่านั้น");
//     if (file.size / 1024 / 1024 >= 5) return msgApi.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");

//     setPreview("");
//     setFormData((prev) => ({ ...prev, photo: null }));

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64 = reader.result as string;
//       setFormData((prev) => ({ ...prev, photo: base64 }));
//       if (isImage) setPreview(base64);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeFile = () => {
//     setPreview("");
//     setFormData((prev) => ({ ...prev, photo: null }));
//   };

//   return (
//     <div className="w-full min-h-screen bg-slate-100 p-6 lg:p-8">
//       {msgCtx}{/* context ของ antd message */}

//       {/* Header */}
//        <div className="mb-3 flex items-center gap-1 sm:gap-2">
//         <img
//           src={createMessageIcon}
//           alt="manage icon"
//           className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 inline-block"
//         />
//         <h1 className="text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
//           สร้างบทความให้กำลังใจ
//         </h1>
//       </div>


//       {/* Form card */}
//       <div className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-5 shadow-sm lg:p-8 xl:p-10">
//         <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-2">
//           {/* Left column */}
//           <div className="space-y-5">
//             <div className="space-y-2">
//               <label htmlFor="name" className="block text-sm font-medium text-slate-700">
//                 ชื่อบทความ <span className="text-rose-500">*</span>
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
//                 placeholder="เช่น กำลังใจในวันที่เหนื่อยล้า"
//               />
//             </div>

//             {/* ผู้เขียน & ไลก์ แยกบรรทัด */}
//             <div className="grid grid-cols-1 gap-5">
//               <div className="space-y-2">
//                 <label htmlFor="author" className="block text-sm font-medium text-slate-700">
//                   ผู้เขียน/อ้างอิง/แหล่งที่มา <span className="text-rose-500">*</span>
//                 </label>
//                 <textarea
//                   id="author"
//                   name="author"
//                   value={formData.author}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
//                   placeholder="เช่น ทีมงานดูแลใจ"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="no_of_like" className="block text-sm font-medium text-slate-700">
//                   จำนวนไลก์ (ตัวเลข)
//                 </label>
//                 <input
//                   id="no_of_like"
//                   name="no_of_like"
//                   type="number"
//                   value={formData.no_of_like}
//                   disabled
//                   className="w-full cursor-not-allowed select-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 outline-none"
//                 />
//               </div>
//             </div>

//             {/* ประเภทบทความ - Custom Dropdown แสดงคำอธิบาย */}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-700">
//                 ประเภทบทความ <span className="text-rose-500">*</span>
//               </label>
//               <div ref={typeRef} className="relative">
//                 <button
//                   type="button"
//                   onClick={() => setTypeOpen((o) => !o)}
//                   className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-slate-900"
//                 >
//                   <span className={articleTypeLoading ? "text-slate-400" : ""}>{selectedTypeLabel}</span>
//                   <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4 opacity-60">
//                     <path
//                       fillRule="evenodd"
//                       d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>

//                 {typeOpen && (
//                   <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
//                     <div className="p-2">
//                       <input
//                         value={typeQuery}
//                         onChange={(e) => setTypeQuery(e.target.value)}
//                         placeholder="ค้นหา..."
//                         className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
//                       />
//                     </div>
//                     <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
//                       {articleTypeLoading && (
//                         <li className="px-3 py-2 text-sm text-slate-500">กำลังโหลด...</li>
//                       )}
//                       {!articleTypeLoading && filteredTypeOptions.length === 0 && (
//                         <li className="px-3 py-2 text-sm text-slate-500">ไม่พบประเภทบทความ</li>
//                       )}
//                       {filteredTypeOptions.map((o) => (
//                         <li key={o.value}>
//                           <button
//                             type="button"
//                             role="option"
//                             aria-selected={o.value === String(formData.articleType)}
//                             className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
//                               o.value === String(formData.articleType) ? "bg-slate-50 font-medium" : ""
//                             }`}
//                             onClick={() => {
//                               setFormData((prev) => ({ ...prev, articleType: o.value }));
//                               setTypeOpen(false);
//                               setTypeQuery("");
//                             }}
//                           >
//                             <div className="flex flex-col">
//                               <span className="text-sm">{o.label}</span>
//                               {o.description && (
//                                 <span className="text-xs text-slate-500 line-clamp-2">{o.description}</span>
//                               )}
//                             </div>
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//               {selectedType?.description && (
//                 <p className="mt-1.5 text-xs text-slate-500">{selectedType.description}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="content" className="block text-sm font-medium text-slate-700">
//                 เนื้อหาบทความ <span className="text-rose-500">*</span>
//               </label>
//               <textarea
//                 id="content"
//                 name="content"
//                 value={formData.content}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
//                 className="min-h-40 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
//                 placeholder="พิมพ์ข้อความให้กำลังใจที่นี่..."
//               />
//             </div>

//             <div className="grid grid-cols-1 gap-5">
//               <div className="space-y-2">
//                 <label htmlFor="date" className="block text-sm font-medium text-slate-700">
//                   วันที่เผยแพร่ <span className="text-rose-500">*</span>
//                 </label>
//                 <input
//                   id="date"
//                   name="date"
//                   type="date"
//                   value={formData.date}
//                   max={todayStr} // จำกัดไม่ให้เลือกอนาคต
//                   onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-slate-700">ยอดเข้าชม</label>
//                 <input
//                   value={formData.viewCount}
//                   readOnly
//                   className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
//               <button
//                 type="button"
//                 onClick={() => navigate("/admin/messagePage")}
//                 className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700"
//               >
//                 ย้อนกลับ
//               </button>
//               <button
//                 type="submit"
//                 className="inline-flex items-center justify-center rounded-xl bg-[#5DE2FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 active:scale-[.99] disabled:opacity-50"
//               >
//                 บันทึกบทความ
//               </button>
//             </div>
//           </div>

//           {/* Right column (Upload) */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               อัปโหลดรูปภาพประกอบบทความ
//             </label>

//             {/* Dropzone + ปุ่มเลือกไฟล์ */}
//             <div
//               className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4"
//               onDragOver={(e) => e.preventDefault()}
//               onDrop={(e) => {
//                 e.preventDefault();
//                 const f = e.dataTransfer.files?.[0];
//                 if (f) {
//                   const evt = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
//                   handleFilePick(evt);
//                 }
//               }}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/*,application/pdf"
//                 onChange={handleFilePick}
//                 className="hidden"
//               />

//               <div
//                 className="flex min-h-[280px] items-center justify-center"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 {preview ? (
//                   <img src={preview} alt="preview" className="max-h-[420px] w-full rounded-xl object-contain" />
//                 ) : formData.photo ? (
//                   <div className="text-center text-sm text-slate-500">เลือกไฟล์ PDF แล้ว (ไม่มีตัวอย่างภาพ)</div>
//                 ) : (
//                   <div className="text-center">
//                     <div className="text-sm text-slate-600">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (รองรับรูปภาพ)</div>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 flex flex-wrap items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={() => fileInputRef.current?.click()}
//                   className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
//                 >
//                   เลือกไฟล์
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowPreviewModal(true)}
//                   disabled={!preview}
//                   className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
//                 >
//                   เปิดดูรูปตัวอย่าง
//                 </button>
//                 <button
//                   type="button"
//                   onClick={removeFile}
//                   disabled={!formData.photo}
//                   className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-50"
//                 >
//                   ลบไฟล์
//                 </button>
//               </div>
//             </div>

//             <p className="mt-3 text-xs text-slate-500">
//               * ระบบจะบันทึกไฟล์เป็น Base64 ในคีย์ <code>photo</code> เพื่อส่งไปยัง Back-end
//             </p>
//           </div>
//         </form>
//       </div>

//       {/* Preview Modal */}
//       {showPreviewModal && preview && (
//         <div
//           className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
//           role="dialog"
//           aria-modal="true"
//           onClick={() => setShowPreviewModal(false)}
//         >
//           <div
//             className="max-h-[85vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={preview}
//               alt="Preview"
//               className="mx-auto max-h-[80vh] w-full rounded-xl object-contain"
//             />
//             <div className="p-2 text-right">
//               <button
//                 onClick={() => setShowPreviewModal(false)}
//                 className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
//               >
//                 ปิด
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateMessagePage;



import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  createWordHealingMessage,
  getArticleTypeOptionsDetailed,
} from "../../../../services/https/message";
import { WordHealingContent } from "../../../../interfaces/IWordHealingContent";
import createMessageIcon from "../../../../assets/createMessageIcon.png";

type ArticleTypeOption = { value: string; label: string; description?: string };

// โครงข้อมูลฟอร์ม (เก็บรูปเป็น base64)
interface FormDataType extends Omit<WordHealingContent, "photo" | "article_type"> {
  photo: string | null;
  error: (message: string) => unknown;
  idts?: number;
  content: string;
  articleType: string;     // ใช้เฉพาะโหมด "บทความ" (long)
  viewCount: number;
}

type ContentKind = "long" | "short"; // long = บทความ, short = บทความสั้น

const CreateMessagePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msgApi, msgCtx] = message.useMessage();

  // วันที่วันนี้ (YYYY-MM-DD)
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  // โหมดเนื้อหา
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

  // โหลดประเภทบทความ
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Custom dropdown
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!typeRef.current) return;
      if (!typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTypeOpen(false);
    };
    if (typeOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

  const selectedType = useMemo(
    () => articleTypeOptions.find((o) => o.value === String(formData.articleType)),
    [articleTypeOptions, formData.articleType]
  );

  // บันทึก
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

    // ต่างกันเฉพาะ article_type: โหมดบทความสั้นส่งค่า "บทความสั้น" (ภาษาไทย)
    if (contentKind === "short") {
      form.append("article_type", "บทความสั้น");
    } else {
      form.append("article_type", formData.articleType);
    }

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

  // เลือกไฟล์
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

  // UI
  return (
    <div className="w-full min-h-screen bg-slate-100 p-6 lg:p-8">
      {msgCtx}

      {/* Header */}
      <div className="mb-3 flex items-center gap-1 sm:gap-2">
        <img
          src={createMessageIcon}
          alt="manage icon"
          className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 inline-block"
        />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
          สร้างบทความให้กำลังใจ
        </h1>
      </div>

      {/* Toggle โหมด — แบบ pill ตามภาพ */}
      <div className="mb-4">
        {/* <div className="w-full flex justify-center"> */}
        <div className="inline-flex items-center rounded-full bg-[#5DE2FF] p-1 shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setContentKind("long")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
              contentKind === "long"
                ? "bg-white text-slate-900 shadow ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
            ].join(" ")}
            aria-pressed={contentKind === "long"}
          >
            บทความ
          </button>

          <button
            type="button"
            onClick={() => setContentKind("short")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
              contentKind === "short"
                ? "bg-white text-slate-900 shadow ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
            ].join(" ")}
            aria-pressed={contentKind === "short"}
          >
            บทความสั้น
          </button>
          {/* </div> */}
        </div>
      </div>

      {/* Card ฟอร์ม */}
      <div className="mt-3 w-full rounded-2xl border border-slate-300 bg-white p-5 shadow-sm lg:p-8 xl:p-10">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left column */}
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

            <div className="grid grid-cols-1 gap-5">
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

              {/* จำนวนไลก์ — readonly */}
              <div className="space-y-2">
                <label htmlFor="no_of_like" className="block text-sm font-medium text-slate-700">
                  จำนวนไลก์ (ตัวเลข)
                </label>
                <input
                  id="no_of_like"
                  name="no_of_like"
                  type="number"
                  value={formData.no_of_like}
                  disabled
                  className="w-full cursor-not-allowed select-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 outline-none"
                />
              </div>
            </div>

            {/* ประเภทบทความ — แสดงเฉพาะโหมด "บทความ" */}
            {contentKind === "long" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  ประเภทบทความ <span className="text-rose-500">*</span>
                </label>
                <div ref={typeRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setTypeOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-slate-900"
                  >
                    <span className={articleTypeLoading ? "text-slate-400" : ""}>{selectedTypeLabel}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4 opacity-60">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {typeOpen && (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                      <div className="p-2">
                        <input
                          value={typeQuery}
                          onChange={(e) => setTypeQuery(e.target.value)}
                          placeholder="ค้นหา..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
                        />
                      </div>
                      <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
                        {articleTypeLoading && (
                          <li className="px-3 py-2 text-sm text-slate-500">กำลังโหลด...</li>
                        )}
                        {!articleTypeLoading && filteredTypeOptions.length === 0 && (
                          <li className="px-3 py-2 text-sm text-slate-500">ไม่พบประเภทบทความ</li>
                        )}
                        {filteredTypeOptions.map((o) => (
                          <li key={o.value}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={o.value === String(formData.articleType)}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                                o.value === String(formData.articleType) ? "bg-slate-50 font-medium" : ""
                              }`}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, articleType: o.value }));
                                setTypeOpen(false);
                                setTypeQuery("");
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm">{o.label}</span>
                                {o.description && (
                                  <span className="text-xs text-slate-500 line-clamp-2">{o.description}</span>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {selectedType?.description && (
                  <p className="mt-1.5 text-xs text-slate-500">{selectedType.description}</p>
                )}
              </div>
            )}

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

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-slate-700">
                  วันที่เผยแพร่ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  max={todayStr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              {/* ยอดเข้าชม — แสดงในทั้งสองโหมด */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">ยอดเข้าชม</label>
                <input
                  value={formData.viewCount}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/messagePage")}
                className="rounded-xl border-slate-300 !bg-black px-5 py-2.5 !text-white shadow-sm transition-colors hover:border-black hover:!bg-gray-700"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#5DE2FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 active:scale-[.99] disabled:opacity-50"
              >
                {contentKind === "short" ? "บันทึกบทความสั้น" : "บันทึกบทความ"}
              </button>
            </div>
          </div>

          {/* Right column (Upload) — แสดงในทั้งสองโหมด */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              อัปโหลดรูปภาพประกอบบทความ
            </label>

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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFilePick}
                className="hidden"
              />

              <div
                className="flex min-h-[280px] items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="max-h-[420px] w-full rounded-xl object-contain" />
                ) : formData.photo ? (
                  <div className="text-center text-sm text-slate-500">เลือกไฟล์ PDF แล้ว (ไม่มีตัวอย่างภาพ)</div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-slate-600">
                      ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (รองรับรูปภาพ)
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  เลือกไฟล์
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
                  ลบไฟล์
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              * ระบบจะบันทึกไฟล์เป็น Base64 ในคีย์ <code>photo</code> เพื่อส่งไปยัง Back-end
            </p>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && preview && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[80vh] w-full rounded-xl object-contain"
            />
            <div className="p-2 text-right">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMessagePage;
