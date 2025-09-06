
// // UserMessagePage.tsx
// // ============================================================
// // หน้า: บทความสั้น / บทความ / ที่ถูกใจ
// // - เพิ่ม ShortBubble.layout = "card" (กล่องเน้นข้อความกึ่งกลาง)
// // - ถ้ามีรูป: รูปอยู่ซ้าย เนื้อหากึ่งกลางแนวตั้ง-แนวนอน
// // - ถ้าไม่มีรูป: เนื้อหายังกึ่งกลางเหมือนกัน (min-h คงที่)
// // - จำกัดขนาด/สัดส่วนภาพ + line-clamp เนื้อหาให้ไม่ยืดยาวเกิน
// // - Modal อ่าน + นับวิว (อ่านถึง ~90% หรือจบหน้า + เวลา >=70%)
// // ============================================================

// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { Modal } from "antd";
// import { AiOutlineArrowLeft, AiOutlineEye, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
// import { BookOpen } from "lucide-react";
// import {
//   getAllWordHealingMessagesForUser,
//   likeMessage,
//   unlikeMessage,
//   checkIfLikedArticle,
//   updateViewCount,
// } from "../../../services/https/message";
// import type { WordHealingContent } from "../../../interfaces/IWordHealingContent";
// import AmbientBackground from "./AmbientBackground";

// /* ============================ Helpers ============================
//    ฟังก์ชันช่วย: แยกชนิดรูป, จัดรูปวันที่, ประเมินเวลาอ่าน ฯลฯ
//    --------------------------------------------------------------- */
// const isPdf = (s?: string | null) =>
//   !!s && (s.includes("application/pdf") || /\.pdf($|\?)/i.test(s || ""));
// const isImage = (s?: string | null) =>
//   !!s && (s.startsWith("data:image/") || /image\//i.test(s) || /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(s || ""));
// const hasImage = (s?: string | null) => !!s && !isPdf(s) && isImage(s);

// const fmtDate = (d?: string) => {
//   if (!d) return "ไม่มีวันที่";
//   const dd = new Date(d);
//   if (Number.isNaN(dd.getTime())) return "ไม่มีวันที่";
//   return dd.toLocaleDateString();
// };
// const fmtDuration = (ms: number) => {
//   const s = Math.floor(ms / 1000);
//   const m = Math.floor(s / 60);
//   const rs = s % 60;
//   return `${m}:${rs.toString().padStart(2, "0")}`;
// };
// const estimateRequiredMs = (text: string, imageCount = 0) => {
//   // ประเมินเวลาอ่านแบบหยาบ: base + ตามความยาวข้อความ + จำนวนรูป
//   const wordLike = Math.max(
//     text.trim().split(/\s+/).filter(Boolean).length,
//     Math.round((text || "").length / 6) // ภาษาไทยติดกัน → ใช้ความยาวตัวอักษรช่วย
//   );
//   const WPM = 200;
//   const base = 5000;
//   const textMs = (wordLike / WPM) * 60_000;
//   const imgMs = Math.min(imageCount, 10) * 3000;
//   const total = base + textMs + imgMs;
//   return Math.max(8000, Math.min(total * 0.7, 300_000)); // ขั้นต่ำ 8s สูงสุด 5 นาที
// };

// /* ====================== ShortBubble (การ์ด/ฟอง) ======================
//    - คอมโพเนนต์ที่แสดง "บทความสั้น" จริง ๆ
//    - layout:
//       * "card"   → รูป (ถ้ามี) + กล่องเน้นข้อความกึ่งกลาง (แนะนำ)
//       * "bubble" → ฟองแชต (คงไว้ใช้ได้)
//    ------------------------------------------------------------------- */
// type ShortBubbleProps = {
//   content: string;
//   author?: string;
//   dateStr?: string;
//   photo?: string | null;
//   isRight?: boolean;
//   liked?: boolean;
//   likeCount?: number;
//   viewCount?: number;
//   onLike?: () => void;
//   onImageClick?: (src: string) => void;
//   onOpen?: () => void;
//   layout?: "bubble" | "card";
// };

// const ShortBubble: React.FC<ShortBubbleProps> = ({
//   content,
//   author = "ไม่ระบุผู้เขียน",
//   dateStr,
//   photo,
//   isRight = false,
//   liked = false,
//   likeCount = 0,
//   viewCount = 0,
//   onLike,
//   onImageClick,
//   onOpen,
//   layout = "card", // ✅ ให้ "การ์ดเน้นข้อความ" เป็นค่าเริ่มต้น
// }) => {
//   // โทนสีด้านซ้าย/ขวา
//   const bubbleColor = isRight
//     ? "bg-gradient-to-br from-[#5DE2FF] to-[#49C3D6] text-white"
//     : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100";
//   const metaColor = isRight ? "text-white/90" : "text-slate-500 dark:text-slate-300";
//   const tailColor = isRight ? "bg-[#49C3D6]" : "bg-white dark:bg-slate-800";
//   const ringColor = isRight ? "ring-white/30" : "ring-slate-200 dark:ring-slate-600";
//   const ghostBtn = isRight
//     ? "border-white/60 hover:bg-white/20 text-white"
//     : "border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-100";
//   const readBtn =
//     "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5DE2FF] text-white hover:bg-[#4AC5D9] transition";

//   /* =========================== Layout: CARD ===========================
//      เป้าหมาย: ข้อความ "โดดเด่น + กึ่งกลางเสมอ"
//      วิธี:
//      - ใช้ grid: [รูป | เนื้อหา] โดยจัด items-center
//      - กล่องเน้นข้อความ (พื้นหลังอ่อน + ring + blur) ให้อ่านง่ายขึ้น
//      - min-h ของกล่องเนื้อหา = ความสูงรูป → กึ่งกลางได้แม้มีรูป
//      ================================================================== */
//   if (layout === "card") {
//     // ความสูงรูปมาตรฐาน (ต้องสอดคล้องกับ class ของ <img>)
//     const imgH = "h-[96px] sm:h-[112px]";
//     // โทนกล่องเน้นข้อความ (ตัดกับฟอง)
//     const emphasisBg = isRight ? "bg-white/20" : "bg-black/5 dark:bg-white/10";
//     const emphasisRing = isRight ? "ring-white/25" : "ring-black/5 dark:ring-white/10";

//     return (
//       <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
//         {/* จำกัดความกว้างเพื่อความสมส่วน */}
//         <div className="flex items-stretch gap-3 max-w-[820px] w-full animate-[fadeSlide_.25s_ease-out]">
//           {/* ฟองหลัก */}
//           <div className={`relative rounded-2xl px-3 py-3 shadow ${bubbleColor} flex-1`} role="group">
//             {/* โครง: ซ้ายรูป / ขวาเนื้อหา (หรือคอลัมน์เดียวถ้าไม่มีรูป) */}
//             <div
//               className={`grid ${photo ? "grid-cols-[auto,1fr]" : "grid-cols-1"} gap-3 items-center`}
//               onClick={onOpen}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e)=> (e.key==="Enter"||e.key===" ") && onOpen?.()}
//               title="คลิกเพื่ออ่าน"
//             >
//               {/* รูป (ถ้ามี) */}
//               {!!photo && (
//                 <button
//                   onClick={(e)=>{ e.stopPropagation(); onImageClick?.(photo!); }}
//                   className="shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5"
//                   title="คลิกดูรูปใหญ่"
//                 >
//                   <img
//                     src={photo!}
//                     alt=""
//                     className={`w-[128px] ${imgH} object-cover`}
//                     loading="lazy"
//                     decoding="async"
//                     onError={(e)=> ((e.currentTarget as HTMLImageElement).style.display="none")}
//                   />
//                 </button>
//               )}

//               {/* กล่องเนื้อหา "เน้น" + กึ่งกลางเสมอ */}
//               <div className={`min-h-[96px] sm:min-h-[112px] flex items-center justify-center`}>
//                 <div
//                   className={[
//                     "w-full rounded-xl px-3 py-2",
//                     emphasisBg,                 // ✅ พื้นหลังอ่อนให้ข้อความเด่น
//                     "ring", emphasisRing,       // ✅ เส้นขอบจาง ๆ เพิ่มมิติ
//                     "backdrop-blur-[1px]",     // ✅ เบลอเล็กน้อยให้อ่านง่ายบนพื้นลาย/ไล่สี
//                   ].join(" ")}
//                 >
//                   {/* ข้อความหลัก: เด่น + ตัด 3 บรรทัด + จัดกึ่งกลาง */}
//                   <p
//                     className="text-center font-semibold text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
//                     style={{
//                       display: "-webkit-box",
//                       WebkitLineClamp: 3,
//                       WebkitBoxOrient: "vertical",
//                       overflow: "hidden",
//                       textShadow: isRight ? "0 1px 0 rgba(0,0,0,.06)" : "none",
//                     }}
//                   >
//                     {content}
//                   </p>

//                   {/* เมตา (เล็ก ไม่แย่งสายตา) */}
//                   <div className={`mt-1 text-[11px] sm:text-[12px] ${metaColor} text-center`}>
//                     {author} • {dateStr}
//                   </div>

//                   {/* แถบเครื่องมือ: จำนวนดู/ถูกใจ/อ่าน (จัดกึ่งกลาง) */}
//                   <div className="mt-2 flex items-center justify-center gap-4 text-[12px]">
//                     <span className="inline-flex items-center gap-1">
//                       <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
//                       <span className={isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-200 tabular-nums"}>
//                         {viewCount}
//                       </span>
//                     </span>

//                     <button
//                       onClick={(e)=>{ e.stopPropagation(); onLike?.(); }}
//                       className="inline-flex items-center gap-1"
//                       aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
//                       title="ถูกใจ"
//                     >
//                       {liked ? <AiFillHeart size={18}/> : <AiOutlineHeart size={18}/>}
//                       <span className={isRight ? "text-white text-[12px]" : "text-slate-700 dark:text-slate-200 text-[12px]"}>
//                         {likeCount}
//                       </span>
//                     </button>

//                     <button className={readBtn} onClick={(e)=>{ e.stopPropagation(); onOpen?.(); }}>
//                       <BookOpen className="w-3.5 h-3.5" />
//                       อ่าน
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* หางฟอง (คุมธีมแชต) */}
//             <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
//           </div>

//           {/* ปุ่มถูกใจลอยข้าง (กดเร็ว) */}
//           <button
//             onClick={() => onLike?.()}
//             className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(" ")}
//             aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
//             title="ถูกใจ"
//           >
//             {liked ? <AiFillHeart size={20}/> : <AiOutlineHeart size={20}/>}
//           </button>
//         </div>

//         {/* แอนิเมชันเข้าเบา ๆ */}
//         <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
//       </div>
//     );
//   }

//   /* ======================= Layout: BUBBLE (คงเดิม) ======================= */
//   return (
//     <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
//       <div className="flex items-end gap-2 max-w-[780px] w-full animate-[fadeSlide_.25s_ease-out]">
//         <div
//           className={`relative rounded-2xl px-4 py-2 shadow ${bubbleColor}`}
//           onDoubleClick={onLike}
//           onClick={onOpen}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
//           title="คลิกเพื่ออ่าน"
//         >
//           <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
//           <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">{content}</p>

//           {!!photo && (
//             <button
//               onClick={(e) => { e.stopPropagation(); onImageClick?.(photo!); }}
//               className="mt-2 block relative overflow-hidden rounded-xl group"
//               title="คลิกเพื่อดูรูปใหญ่"
//             >
//               <img
//                 src={photo!}
//                 alt=""
//                 className="w-full max-h-56 sm:max-h-64 object-cover"
//                 loading="lazy"
//                 decoding="async"
//                 onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//               />
//               <span className={`pointer-events-none absolute inset-0 rounded-xl ring-1 ${ringColor}`} />
//               <span className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
//             </button>
//           )}

//           <div className={`mt-1 text-[12px] ${metaColor}`}>{author} • {dateStr}</div>

//           <div className="mt-2 flex items-center justify-between text-[12px]">
//             <div className="flex items-center gap-1 opacity-90">
//               <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
//               <span className={isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-200 tabular-nums"}>{viewCount}</span>
//             </div>
//             <button className={readBtn} onClick={(e) => { e.stopPropagation(); onOpen?.(); }}>
//               <BookOpen className="w-3.5 h-3.5" />
//               อ่าน
//             </button>
//           </div>
//         </div>

//         <button
//           onClick={(e) => { e.stopPropagation(); onLike?.(); }}
//           className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(" ")}
//           aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
//           title="ถูกใจ"
//         >
//           {liked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
//           <span className={["ml-1 text-[12px] tabular-nums", isRight ? "text-white" : "text-slate-700 dark:text-slate-200"].join(" ")}>
//             {likeCount}
//           </span>
//         </button>
//       </div>

//       <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
//     </div>
//   );
// };

// /* ============================= Page =============================
//    คอมโพเนนต์หน้าหลัก: โหลดข้อมูล → แยกแท็บ → แสดงผล + Modal
//    --------------------------------------------------------------- */
// type PageMode = "shorts" | "articles" | "liked";

// export default function UserMessagePage() {
//   // โหมดหน้า + ค้นหา
//   const [mode, setMode] = useState<PageMode>("shorts");
//   const [searchQuery, setSearchQuery] = useState("");

//   // ข้อมูล/ถูกใจ/ล็อกอิน
//   const [messages, setMessages] = useState<WordHealingContent[]>([]);
//   const [liked, setLiked] = useState<Record<number, boolean>>({});
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // เพจจิ้งแต่ละแท็บ
//   const [shortPage, setShortPage] = useState(1);
//   const [articlePage, setArticlePage] = useState(1);
//   const [likedPage, setLikedPage] = useState(1);
//   const SHORTS_PER_PAGE = 9;
//   const ARTICLES_PER_PAGE = 5;
//   const LIKED_PER_PAGE = 10;

//   // Lightbox รูปของบทความสั้น
//   const [shortImagePreview, setShortImagePreview] = useState<string | null>(null);

//   // Modal อ่าน
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);

//   // สถานะการอ่าน (ไว้นับวิว)
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const [readMs, setReadMs] = useState(0);
//   const [requiredMs, setRequiredMs] = useState(15000);
//   const [isActive, setIsActive] = useState(true);
//   const [hasCountedView, setHasCountedView] = useState<Record<number, boolean>>({});
//   const scrollBodyRef = useRef<HTMLDivElement | null>(null);
//   const lastActivityRef = useRef(Date.now());

//   /* กันพื้นหลัง "แทรกแว๊บ" โดย preload */
//   useEffect(() => {
//     ["/ambient/day-clouds.jpg", "/ambient/milkyway.jpg"].forEach((u) => {
//       const img = new Image();
//       img.src = u;
//     });
//   }, []);

//   /* โหลดข้อมูล + sync สถานะถูกใจ */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsLoggedIn(!!token);

//     const fetchMessages = async () => {
//       const data = await getAllWordHealingMessagesForUser();
//       setMessages(data);

//       if (token) {
//         const uid = localStorage.getItem("id");
//         if (uid) {
//           for (const m of data) {
//             const { isLiked } = await checkIfLikedArticle(m.id, uid);
//             setLiked((prev) => ({ ...prev, [m.id]: isLiked }));
//           }
//         }
//       }
//     };

//     fetchMessages();
//     const interval = setInterval(fetchMessages, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   /* ค้นหา + แยกสั้น/ยาว/ถูกใจ */
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     setShortPage(1); setArticlePage(1); setLikedPage(1);
//   };

//   const baseFiltered = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return messages.filter((m) =>
//       [m.name, m.author, m.articleType ?? "", m.content ?? ""].join(" ").toLowerCase().includes(q)
//     );
//   }, [messages, searchQuery]);

//   const byDateDesc = (a: WordHealingContent, b: WordHealingContent) =>
//     new Date(b.date as any).getTime() - new Date(a.date as any).getTime();

//   // ✅ คัด "บทความสั้น" ด้วย articleType === "บทความสั้น"
//   const shortsAll = useMemo(
//     () => baseFiltered.filter((m) => (m.articleType ?? "").trim() === "บทความสั้น").sort(byDateDesc),
//     [baseFiltered]
//   );
//   const articlesAll = useMemo(
//     () => baseFiltered.filter((m) => (m.articleType ?? "").trim() !== "บทความสั้น").sort(byDateDesc),
//     [baseFiltered]
//   );
//   const likedAll = useMemo(
//     () => baseFiltered.filter((m) => liked[m.id]).sort(byDateDesc),
//     [baseFiltered, liked]
//   );

//   // เพจจิ้ง
//   const shortsTotalPages = Math.max(1, Math.ceil(shortsAll.length / SHORTS_PER_PAGE));
//   const articlesTotalPages = Math.max(1, Math.ceil(articlesAll.length / ARTICLES_PER_PAGE));
//   const likedTotalPages = Math.max(1, Math.ceil(likedAll.length / LIKED_PER_PAGE));

//   const shortsPageItems = useMemo(
//     () => shortsAll.slice((shortPage - 1) * SHORTS_PER_PAGE, shortPage * SHORTS_PER_PAGE),
//     [shortsAll, shortPage]
//   );
//   const articlesPageItems = useMemo(
//     () => articlesAll.slice((articlePage - 1) * ARTICLES_PER_PAGE, articlePage * ARTICLES_PER_PAGE),
//     [articlesAll, articlePage]
//   );
//   const likedPageItems = useMemo(
//     () => likedAll.slice((likedPage - 1) * LIKED_PER_PAGE, likedPage * LIKED_PER_PAGE),
//     [likedAll, likedPage]
//   );

//   // นับจำนวนถูกใจทั้งหมด
//   const likedCount = useMemo(
//     () => messages.reduce((acc, m) => acc + (liked[m.id] ? 1 : 0), 0),
//     [messages, liked]
//   );

//   // Toggle ถูกใจ (optimistic + rollback)
//   const toggleLike = async (id: number) => {
//     if (!isLoggedIn) return alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ");
//     const currentlyLiked = !!liked[id];
//     const uid = localStorage.getItem("id");
//     if (!uid) return alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ");

//     setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) } : m
//       )
//     );

//     const ok = currentlyLiked ? await unlikeMessage(id, uid) : await likeMessage(id, uid);
//     if (!ok) {
//       setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) } : m
//         )
//       );
//     }
//   };

//   // เปิด/ปิด Modal อ่าน
//   const showModal = (message: WordHealingContent) => {
//     setSelectedMessage(message);
//     setIsModalVisible(true);
//     setHasCountedView((prev) => ({ ...prev, [message.id]: false }));

//     const imgCount = hasImage(message.photo) ? 1 : 0;
//     setRequiredMs(estimateRequiredMs(message.content || "", imgCount));
//   };
//   const handleCancel = () => { setIsModalVisible(false); setSelectedMessage(null); };

//   // คำนวณ % อ่านจากการสกรอลล์
//   const computeContentPct = () => {
//     const el = scrollBodyRef.current;
//     if (!el) return 0;
//     const { scrollTop, clientHeight, scrollHeight } = el;
//     if (scrollHeight <= clientHeight + 2) return 100;
//     return Math.min(100, Math.max(0, ((scrollTop + clientHeight) / Math.max(1, scrollHeight)) * 100));
//   };

//   // เกณฑ์นับวิวแบบยุติธรรม
//   const checkAndCountView = () => {
//     if (!selectedMessage || hasCountedView[selectedMessage.id]) return;
//     const pct = computeContentPct();
//     setScrollProgress(pct);
//     const el = scrollBodyRef.current;
//     const scrollable = el ? el.scrollHeight > el.clientHeight + 2 : false;

//     const contentLen = (selectedMessage.content || "").trim().length;
//     const isVeryShort = contentLen <= 60;
//     const contentOk = scrollable ? pct >= 90 : true;           // ถ้ามีสกรอลล์ → อ่านถึง ~90%
//     const timeOk = isVeryShort ? true : readMs >= requiredMs * 0.7; // เวลาอ่านถึง ~70%

//     if (contentOk && timeOk) {
//       updateViewCount(String(selectedMessage.id)).then((ok) => {
//         if (!ok) return;
//         setHasCountedView((prev) => ({ ...prev, [selectedMessage.id]: true }));
//         setSelectedMessage((prev) => (prev ? { ...prev, viewCount: prev.viewCount + 1 } : prev));
//         setMessages((prev) =>
//           prev.map((m) => (m.id === selectedMessage.id ? { ...m, viewCount: m.viewCount + 1 } : m))
//         );
//       });
//     }
//   };

//   // จับ activity (นับเฉพาะ tab โฟกัส + ผู้ใช้ขยับ)
//   useEffect(() => {
//     if (!isModalVisible) return;
//     setScrollProgress(0); setReadMs(0); setIsActive(true);
//     if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;

//     const onAct = () => (lastActivityRef.current = Date.now());
//     window.addEventListener("mousemove", onAct);
//     window.addEventListener("keydown", onAct);
//     window.addEventListener("wheel", onAct, { passive: true });
//     window.addEventListener("touchmove", onAct, { passive: true });

//     const timer = setInterval(() => {
//       const visible = !document.hidden;
//       const active = Date.now() - lastActivityRef.current < 15_000;
//       setIsActive(visible && active);
//       if (visible && active) setReadMs((t) => t + 1000);
//     }, 1000);

//     return () => {
//       clearInterval(timer);
//       window.removeEventListener("mousemove", onAct);
//       window.removeEventListener("keydown", onAct);
//       window.removeEventListener("wheel", onAct);
//       window.removeEventListener("touchmove", onAct);
//     };
//   }, [isModalVisible]);

//   // เรียกเช็กเกณฑ์นับวิวทุกครั้งที่เวลาเดิน
//   useEffect(() => {
//     if (!isModalVisible || !selectedMessage) return;
//     checkAndCountView();
//   }, [readMs, isModalVisible, selectedMessage, requiredMs]);

//   const onModalBodyScroll: React.UIEventHandler<HTMLDivElement> = () => {
//     lastActivityRef.current = Date.now();
//     checkAndCountView();
//   };

//   const handleBack = () => window.history.back();

//   // จัดกลุ่มตามวัน (สำหรับไทม์ไลน์บทความสั้น)
//   function groupByDay(items: { date: string }[]) {
//     const groups: Record<string, typeof items> = {};
//     for (const it of items) {
//       const d = new Date(it.date);
//       const key = d.toDateString();
//       (groups[key] ||= []).push(it);
//     }
//     return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
//   }
//   function humanDay(label: string) {
//     const d = new Date(label);
//     const today = new Date(); today.setHours(0,0,0,0);
//     const that = new Date(d); that.setHours(0,0,0,0);
//     const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
//     if (diff === 0) return "วันนี้";
//     if (diff === 1) return "เมื่อวาน";
//     return d.toLocaleDateString();
//   }

//   /* ================================ UI ================================ */
//   return (
//     <div
//       className="font-ibmthai relative flex flex-col items-center p-6 min-h-screen
//                  bg-gradient-to-b from-[#C2F4FF] to-[#5DE2FF]
//                  dark:bg-gradient-to-b dark:from-[#1B2538] dark:to-[#0E1626]
//                  transition-all duration-300"
//     >
//       {/* พื้นหลัง Ambient (เฟด opacity กันแว๊บ) */}
//       <div
//         aria-hidden
//         className={[
//           "pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ease-out",
//           mode === "liked" ? "opacity-0" : "opacity-100",
//         ].join(" ")}
//       >
//         <AmbientBackground
//           scope="page"
//           dayCloudsSrc="/ambient/day-clouds.jpg"
//           nightStyle="milkyway"
//           milkyWaySrc="/ambient/milkyway.jpg"
//         />
//       </div>

//       <div className="relative z-10 w-full">
//         {/* Header: ปุ่มกลับ + ช่องค้นหา */}
//         <div className="w-full max-w-5xl mx-auto mb-4 flex items-center">
//           <button
//             onClick={handleBack}
//             className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300"
//             aria-label="ย้อนกลับ"
//           >
//             <AiOutlineArrowLeft size={24} />
//           </button>
//           <input
//             type="text"
//             placeholder="ค้นหา (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
//             value={searchQuery}
//             onChange={handleSearch}
//             className="w-full p-2 rounded-lg border border-gray-300 ml-4 dark:text-white dark:bg-gray-800"
//           />
//         </div>

//         {/* ตัวสลับแท็บ */}
//         <div className="w-full max-w-5xl mx-auto mb-6">
//           <div className="mx-auto inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/70 p-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
//             {([
//               { key: "shorts", label: "บทความสั้น", count: shortsAll.length },
//               { key: "articles", label: "บทความ", count: articlesAll.length },
//               { key: "liked", label: "ที่ถูกใจ", count: likedCount },
//             ] as const).map((b) => {
//               const active = mode === b.key;
//               return (
//                 <button
//                   key={b.key}
//                   onClick={() => setMode(b.key)}
//                   className={[
//                     "relative px-4 py-2 text-sm font-medium rounded-full transition",
//                     active ? "bg-[#5DE2FF] text-white shadow" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
//                   ].join(" ")}
//                 >
//                   {b.label}
//                   <span
//                     className={[
//                       "ml-2 inline-flex items-center justify-center h-5 rounded-full text-[11px] tabular-nums min-w-[2.25rem]",
//                       active ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100",
//                     ].join(" ")}
//                   >
//                     {b.count}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* ============================== CONTENT ============================== */}
//         {/* แท็บ: บทความสั้น */}
//         <section className={mode === "shorts" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "shorts"}>
//           <div className="w-full max-w-5xl mx-auto mb-10">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">บทความสั้น ({shortsAll.length})</h3>
//             </div>

//             {shortsPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ไม่มีบทความสั้น
//               </div>
//             ) : (
//               groupByDay(shortsPageItems).map(([dayKey, items]) => (
//                 <div key={dayKey} className="mb-6">
//                   {/* วันที่ */}
//                   <div className="sticky top-2 z-10 flex items-center justify-center my-2">
//                     <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
//                       {humanDay(dayKey)}
//                     </span>
//                   </div>

//                   {items.map((s: any, idx: number) => {
//                     const isRight = (s.author ?? "").includes("ทีมงานดูแลใจ") || ((idx % 2) === 1);
//                     return (
//                       <ShortBubble
//                         key={s.id}
//                         content={s.content}
//                         author={s.author}
//                         dateStr={fmtDate(s.date)}
//                         photo={hasImage(s.photo) ? String(s.photo) : undefined}
//                         isRight={!!isRight}
//                         liked={!!liked[s.id]}
//                         likeCount={s.no_of_like}
//                         viewCount={s.viewCount}
//                         onLike={() => toggleLike(s.id)}
//                         onImageClick={(src) => setShortImagePreview(src)}
//                         onOpen={() => showModal(s)}
//                         layout="card"   // ✅ ใช้การ์ดเน้นข้อความกึ่งกลาง
//                       />
//                     );
//                   })}
//                 </div>
//               ))
//             )}

//             {/* เพจจิ้งบทความสั้น */}
//             {shortsAll.length > SHORTS_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setShortPage((p) => Math.max(1, p - 1))} disabled={shortPage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${shortPage} จาก ${shortsTotalPages}`}</span>
//                 <button
//                   onClick={() => setShortPage((p) => Math.min(shortsTotalPages, p + 1))}
//                   disabled={shortPage === shortsTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* แท็บ: บทความยาว */}
//         <section className={mode === "articles" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "articles"}>
//           <div className="w-full max-w-5xl mx-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">บทความ ({articlesAll.length})</h3>
//             </div>

//             {articlesPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ไม่มีบทความตามเงื่อนไข
//               </div>
//             ) : (
//               <div className="grid gap-4 grid-cols-1">
//                 {articlesPageItems.map((m) => (
//                   <div
//                     key={m.id}
//                     className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300"
//                   >
//                     <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

//                     {hasImage(m.photo) && (
//                       <figure className="mb-4 overflow-hidden rounded-lg">
//                         <img
//                           src={m.photo!}
//                           alt=""
//                           className="w-full aspect-[16/9] object-cover"
//                           loading="lazy"
//                           decoding="async"
//                           onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//                         />
//                       </figure>
//                     )}

//                     <div className="flex items-center gap-2">
//                       {m.articleType && (
//                         <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                           {m.articleType}
//                         </span>
//                       )}
//                       <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
//                     </div>

//                     <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
//                       {m.content}
//                     </p>

//                     <div className="flex items-center justify-between mt-auto">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => toggleLike(m.id)}
//                           className="text-red-500 text-3xl"
//                           aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
//                         >
//                           {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
//                         </button>
//                         <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
//                         <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
//                         <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
//                       </div>
//                       <button
//                         onClick={() => showModal(m)}
//                         className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
//                       >
//                         <BookOpen className="w-5 h-5" />
//                         <span>อ่าน</span>
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {articlesAll.length > ARTICLES_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setArticlePage((p) => Math.max(1, p - 1))} disabled={articlePage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${articlePage} จาก ${articlesTotalPages}`}</span>
//                 <button
//                   onClick={() => setArticlePage((p) => Math.min(articlesTotalPages, p + 1))}
//                   disabled={articlePage === articlesTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* แท็บ: ที่ถูกใจ */}
//         <section className={mode === "liked" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "liked"}>
//           <div className="w-full max-w-5xl mx-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">ที่ถูกใจทั้งหมด ({likedAll.length})</h3>
//             </div>

//             {likedPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ยังไม่มีบทความที่คุณถูกใจ
//               </div>
//             ) : (
//               <>
//                 {/* บทความสั้นที่ถูกใจ */}
//                 <div className="mb-6">
//                   <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">บทความสั้นที่ถูกใจ</h4>
//                   {likedPageItems.filter((m) => (m.articleType ?? "") === "บทความสั้น").length === 0 ? (
//                     <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">— ไม่มี —</div>
//                   ) : (
//                     groupByDay(likedPageItems.filter((m) => (m.articleType ?? "") === "บทความสั้น")).map(([dayKey, items]) => (
//                       <div key={dayKey} className="mb-4">
//                         <div className="sticky top-2 z-10 flex items-center justify-center my-2">
//                           <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
//                             {humanDay(dayKey)}
//                           </span>
//                         </div>
//                         {items.map((s: any, idx: number) => {
//                           const isRight = (s.author ?? "").includes("ทีมงานดูแลใจ") || ((idx % 2) === 1);
//                           return (
//                             <ShortBubble
//                               key={s.id}
//                               content={s.content}
//                               author={s.author}
//                               dateStr={fmtDate(s.date)}
//                               photo={hasImage(s.photo) ? String(s.photo) : undefined}
//                               isRight={!!isRight}
//                               liked={!!liked[s.id]}
//                               likeCount={s.no_of_like}
//                               viewCount={s.viewCount}
//                               onLike={() => toggleLike(s.id)}
//                               onImageClick={(src) => setShortImagePreview(src)}
//                               onOpen={() => showModal(s)}
//                               layout="card"   // ✅ ใช้การ์ดเน้นข้อความ
//                             />
//                           );
//                         })}
//                       </div>
//                     ))
//                   )}
//                 </div>

//                 {/* บทความยาวที่ถูกใจ */}
//                 <div className="mb-2">
//                   <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">บทความที่ถูกใจ</h4>
//                   {likedPageItems.filter((m) => (m.articleType ?? "") !== "บทความสั้น").length === 0 ? (
//                     <div className="text-sm text-slate-500 dark:text-slate-400">— ไม่มี —</div>
//                   ) : (
//                     <div className="grid gap-4 grid-cols-1">
//                       {likedPageItems
//                         .filter((m) => (m.articleType ?? "") !== "บทความสั้น")
//                         .map((m) => (
//                           <div
//                             key={m.id}
//                             className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300"
//                           >
//                             <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

//                             {hasImage(m.photo) && (
//                               <figure className="mb-4 overflow-hidden rounded-lg">
//                                 <img
//                                   src={m.photo!}
//                                   alt=""
//                                   className="w-full aspect-[16/9] object-cover"
//                                   loading="lazy"
//                                   decoding="async"
//                                   onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//                                 />
//                               </figure>
//                             )}

//                             <div className="flex items-center gap-2">
//                               {m.articleType && (
//                                 <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                                   {m.articleType}
//                                 </span>
//                               )}
//                               <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
//                             </div>

//                             <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
//                               {m.content}
//                             </p>

//                             <div className="flex items-center justify-between mt-auto">
//                               <div className="flex items-center gap-2">
//                                 <button
//                                   onClick={() => toggleLike(m.id)}
//                                   className="text-red-500 text-3xl"
//                                   aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
//                                 >
//                                   {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
//                                 </button>
//                                 <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
//                                 <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
//                                 <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
//                               </div>
//                               <button
//                                 onClick={() => showModal(m)}
//                                 className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
//                               >
//                                 <BookOpen className="w-5 h-5" />
//                                 <span>อ่าน</span>
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* เพจจิ้งของที่ถูกใจ */}
//             {likedAll.length > LIKED_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setLikedPage((p) => Math.max(1, p - 1))} disabled={likedPage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${likedPage} จาก ${likedTotalPages}`}</span>
//                 <button
//                   onClick={() => setLikedPage((p) => Math.min(likedTotalPages, p + 1))}
//                   disabled={likedPage === likedTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ========================= Modal อ่านบทความ ========================= */}
//         <Modal
//           open={isModalVisible}
//           onCancel={handleCancel}
//           footer={null}
//           width={1000}
//           centered
//           destroyOnClose
//           styles={{
//             mask: { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)" },
//             content: { padding: 0, background: "transparent", boxShadow: "none", border: "none", overflow: "hidden" },
//             body: { padding: 0 },
//             header: { display: "none" },
//             footer: { display: "none" },
//           }}
//           closeIcon={<span style={{ color: "#e50c0cff", fontSize: 20, lineHeight: 1 }}>✕</span>}
//         >
//           {selectedMessage && (
//             <ArticleReader
//               message={selectedMessage}
//               scrollBodyRef={scrollBodyRef}
//               onModalBodyScroll={onModalBodyScroll}
//               scrollProgress={scrollProgress}
//               isActive={isActive}
//               readMs={readMs}
//               requiredMs={requiredMs}
//             />
//           )}
//         </Modal>

//         {/* ========================= Lightbox รูปของบทความสั้น ========================= */}
//         <Modal
//           open={!!shortImagePreview}
//           onCancel={() => setShortImagePreview(null)}
//           footer={null}
//           centered
//           destroyOnClose
//           width={720}
//           styles={{
//             mask: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" },
//             content: { padding: 0, background: "transparent", boxShadow: "none", border: "none" },
//             body: { padding: 0 },
//           }}
//           closeIcon={<span style={{ color: "#fff", fontSize: 22 }}>✕</span>}
//         >
//           {shortImagePreview && (
//             <div className="p-2">
//               <img
//                 src={shortImagePreview}
//                 alt=""
//                 className="w-full h-auto rounded-2xl object-contain bg-black/20"
//                 onError={() => setShortImagePreview(null)}
//               />
//             </div>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// /* ---------------------- ArticleReader (ใน Modal) ----------------------
//    - แถบสรุปด้านบน: % อ่าน + สถานะ active + เวลาอ่าน
//    - เนื้อหา/รูป/เมตา + ยอดถูกใจ/ชม (จัดกลางตามคำขอ)
//    -------------------------------------------------------------------- */
// function ArticleReader({
//   message,
//   scrollBodyRef,
//   onModalBodyScroll,
//   scrollProgress,
//   isActive,
//   readMs,
//   requiredMs,
// }: {
//   message: WordHealingContent;
//   scrollBodyRef: React.MutableRefObject<HTMLDivElement | null>;
//   onModalBodyScroll: React.UIEventHandler<HTMLDivElement>;
//   scrollProgress: number;
//   isActive: boolean;
//   readMs: number;
//   requiredMs: number;
// }) {
//   const contentLen = (message?.content || "").trim().length;
//   const isVeryShort = contentLen <= 60;
//   const isShortish = contentLen > 60 && contentLen <= 240;

//   const contentWidthClass = isVeryShort || isShortish ? "max-w-2xl" : "max-w-3xl";
//   const contentPadYClass = isVeryShort ? "py-10" : "py-4";
//   const contentTextSize =
//     isVeryShort ? "text-2xl sm:text-3xl leading-9" : isShortish ? "text-xl leading-8" : "text-lg leading-7";
//   const contentAlignClass = isVeryShort || isShortish ? "text-center" : "text-left";

//   return (
//     <div className="font-ibmthai relative h-[calc(100dvh-120px)] md:h-[calc(100dvh-160px)] overflow-hidden">
//       <div
//         ref={scrollBodyRef}
//         onScroll={onModalBodyScroll}
//         className="h-full overflow-y-auto overscroll-contain bg-[#F4FFFF] dark:bg-[#1B2538] dark:text-white"
//         style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//       >
//         {/* แถบสรุปด้านบน */}
//         <div className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
//           <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-2">
//             <div className="flex items-center justify-between text-[13px] sm:text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="font-medium">อ่านแล้ว {Math.round(scrollProgress)}%</span>
//                 <span
//                   className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
//                     isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
//                   }`}
//                   title="นับเวลาเฉพาะตอนหน้าจอเปิดและมีการใช้งาน"
//                 >
//                   <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-500"}`} />
//                   {isActive ? "กำลังอ่าน" : "พัก"}
//                 </span>
//               </div>

//               <div className="text-right">
//                 <div className="font-medium">เวลาอ่าน {fmtDuration(readMs)} / {fmtDuration(requiredMs)}</div>
//                 <div className="text-[12px] opacity-70">คงเหลือ ~ {fmtDuration(Math.max(0, requiredMs - readMs))}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* เนื้อหาใน modal */}
//         <div className={`${contentWidthClass} mx-auto w-full px-4 sm:px-6 ${contentPadYClass}`}>
//           <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
//             {message.name}
//           </h1>

//           {hasImage(message.photo) && (
//             <div className="mt-4 flex justify-center">
//               <img
//                 src={message.photo!}
//                 alt=""
//                 className="w-full sm:w-[520px] h-auto rounded-xl object-cover shadow"
//                 onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//               />
//             </div>
//           )}

//           <article className="prose prose-slate dark:prose-invert max-w-none mt-4">
//             <p className={`whitespace-pre-wrap break-words ${contentTextSize} ${contentAlignClass}`}>
//               {message.content || "-"}
//             </p>
//           </article>

//           <div className="mt-4 flex flex-col gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-white">
//             <div className="flex items-center gap-2">
//               {message.articleType && (
//                 <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                   {message.articleType}
//                 </span>
//               )}
//               <span>{fmtDate(message.date)}</span>
//             </div>

//             <div><span className="opacity-80">ผู้เขียน: {message.author}</span></div>

//             {/* ยอดต่าง ๆ กึ่งกลาง */}
//             <div className="flex items-center justify-center gap-6 opacity-90 text-center mt-4">
//               <span>ถูกใจทั้งหมด: {message.no_of_like}</span>
//               <span>การเข้าชม: {message.viewCount}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ปิดช่อง scrollbar gap ฝั่งขวา (สว่าง/มืด) */}
//       <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 dark:hidden" style={{ background: "#F4FFFF" }} />
//       <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 hidden dark:block" style={{ background: "#1B2538" }} />
//     </div>
//   );
// }




// // UserMessagePage.tsx
// // ===================================================================================
// // หน้า: บทความสั้น / บทความ / ที่ถูกใจ(บทสั้น) / ที่ถูกใจ(บทความ)
// // - ปรับ ShortBubble.layout="card" ให้เป็นซ้ายรูป | ขวาเนื้อหา (กึ่งกลางในกรอบ)
// // - แยกหน้า "ที่ถูกใจ" ออกเป็น 2 แท็บ: likedShorts และ likedArticles
// // - หน้าบทความสั้น: แสดง 10 รายการ/หน้า (SHORTS_PER_PAGE = 10)
// // ===================================================================================

// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { Modal } from "antd";
// import { AiOutlineArrowLeft, AiOutlineEye, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
// import { BookOpen } from "lucide-react";
// import {
//   getAllWordHealingMessagesForUser,
//   likeMessage,
//   unlikeMessage,
//   checkIfLikedArticle,
//   updateViewCount,
// } from "../../../services/https/message";
// import type { WordHealingContent } from "../../../interfaces/IWordHealingContent";
// import AmbientBackground from "./AmbientBackground";

// /* ============================ Helpers ============================ */
// const isPdf = (s?: string | null) =>
//   !!s && (s.includes("application/pdf") || /\.pdf($|\?)/i.test(s || ""));
// const isImage = (s?: string | null) =>
//   !!s && (s.startsWith("data:image/") || /image\//i.test(s) || /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(s || ""));
// const hasImage = (s?: string | null) => !!s && !isPdf(s) && isImage(s);

// const fmtDate = (d?: string) => {
//   if (!d) return "ไม่มีวันที่";
//   const dd = new Date(d);
//   if (Number.isNaN(dd.getTime())) return "ไม่มีวันที่";
//   return dd.toLocaleDateString();
// };
// const fmtDuration = (ms: number) => {
//   const s = Math.floor(ms / 1000);
//   const m = Math.floor(s / 60);
//   const rs = s % 60;
//   return `${m}:${rs.toString().padStart(2, "0")}`;
// };
// const estimateRequiredMs = (text: string, imageCount = 0) => {
//   const wordLike = Math.max(
//     text.trim().split(/\s+/).filter(Boolean).length,
//     Math.round((text || "").length / 6)
//   );
//   const WPM = 200;
//   const base = 5000;
//   const textMs = (wordLike / WPM) * 60_000;
//   const imgMs = Math.min(imageCount, 10) * 3000;
//   const total = base + textMs + imgMs;
//   return Math.max(8000, Math.min(total * 0.7, 300_000));
// };

// /* ====================== ShortBubble (การ์ด/ฟอง) ====================== */
// type ShortBubbleProps = {
//   content: string;
//   author?: string;
//   dateStr?: string;
//   photo?: string | null;
//   isRight?: boolean;
//   liked?: boolean;
//   likeCount?: number;
//   viewCount?: number;
//   onLike?: () => void;
//   onImageClick?: (src: string) => void;
//   onOpen?: () => void;
//   layout?: "bubble" | "card";
// };

// const ShortBubble: React.FC<ShortBubbleProps> = ({
//   content,
//   author = "ไม่ระบุผู้เขียน",
//   dateStr,
//   photo,
//   isRight = false,
//   liked = false,
//   likeCount = 0,
//   viewCount = 0,
//   onLike,
//   onImageClick,
//   onOpen,
//   layout = "card",
// }) => {
//   const bubbleColor = isRight
//     ? "bg-gradient-to-br from-[#5DE2FF] to-[#49C3D6] text-white"
//     : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100";
//   const metaColor = isRight ? "text-white/90" : "text-slate-500 dark:text-slate-300";
//   const tailColor = isRight ? "bg-[#49C3D6]" : "bg-white dark:bg-slate-800";
//   const ringColor = isRight ? "ring-white/30" : "ring-slate-200 dark:ring-slate-600";
//   const ghostBtn = isRight
//     ? "border-white/60 hover:bg-white/20 text-white"
//     : "border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-100";
//   const readBtn =
//     "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5DE2FF] text-white hover:bg-[#4AC5D9] transition";

//   /* ============ Layout: CARD → ซ้ายรูป | ขวาเนื้อหา (เนื้อหากึ่งกลางเสมอ) ============ */
//   if (layout === "card") {
//     const IMG_W = "w-[128px] sm:w-[136px]";
//     const IMG_H = "h-[96px] sm:h-[112px]";
//     const emphasisBg = isRight ? "bg-white/20" : "bg-black/5 dark:bg-white/10";
//     const emphasisRing = isRight ? "ring-white/25" : "ring-black/5 dark:ring-white/10";

//     return (
//       <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
//         <div className="flex items-stretch gap-3 max-w-[820px] w-full animate-[fadeSlide_.25s_ease-out]">
//           <div className={`relative rounded-2xl px-3 py-3 shadow ${bubbleColor} flex-1`} role="group">
//             {/* ซ้าย–ขวาเสมอ */}
//             <div
//               className="flex items-center gap-3"
//               onClick={onOpen}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e)=> (e.key==="Enter"||e.key===" ") && onOpen?.()}
//               title="คลิกเพื่ออ่าน"
//             >
//               {!!photo && (
//                 <button
//                   onClick={(e)=>{ e.stopPropagation(); onImageClick?.(photo!); }}
//                   className="shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5"
//                   title="คลิกดูรูปใหญ่"
//                 >
//                   <img
//                     src={photo!}
//                     alt=""
//                     className={`${IMG_W} ${IMG_H} object-cover`}
//                     loading="lazy"
//                     decoding="async"
//                     onError={(e)=> ((e.currentTarget as HTMLImageElement).style.display="none")}
//                   />
//                 </button>
//               )}

//               {/* เนื้อหา: กึ่งกลางในกรอบของตัวเอง */}
//               <div className={`flex-1 min-h-[96px] sm:min-h-[112px] flex items-center`}>
//                 <div className={["w-full rounded-xl px-3 py-2", emphasisBg, "ring", emphasisRing, "backdrop-blur-[1px]"].join(" ")}>
//                   <p
//                     className="text-center font-semibold text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
//                     style={{
//                       display: "-webkit-box",
//                       WebkitLineClamp: 3,
//                       WebkitBoxOrient: "vertical",
//                       overflow: "hidden",
//                       textShadow: isRight ? "0 1px 0 rgba(0,0,0,.06)" : "none",
//                     }}
//                   >
//                     {content}
//                   </p>

//                   <div className={`mt-1 text-[11px] sm:text-[12px] ${metaColor} text-center`}>
//                     {author} • {dateStr}
//                   </div>

//                   <div className="mt-2 flex items-center justify-center gap-4 text-[12px]">
//                     <span className="inline-flex items-center gap-1">
//                       <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
//                       <span className={isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-200 tabular-nums"}>
//                         {viewCount}
//                       </span>
//                     </span>

//                     <button
//                       onClick={(e)=>{ e.stopPropagation(); onLike?.(); }}
//                       className="inline-flex items-center gap-1"
//                       aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
//                       title="ถูกใจ"
//                     >
//                       {liked ? <AiFillHeart size={18}/> : <AiOutlineHeart size={18}/>}
//                       <span className={isRight ? "text-white text-[12px]" : "text-slate-700 dark:text-slate-200 text-[12px]"}>{likeCount}</span>
//                     </button>

//                     <button className={readBtn} onClick={(e)=>{ e.stopPropagation(); onOpen?.(); }}>
//                       <BookOpen className="w-3.5 h-3.5" />
//                       อ่าน
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
//           </div>

//           <button
//             onClick={() => onLike?.()}
//             className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(" ")}
//             aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
//             title="ถูกใจ"
//           >
//             {liked ? <AiFillHeart size={20}/> : <AiOutlineHeart size={20}/>}
//           </button>
//         </div>

//         <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
//       </div>
//     );
//   }

//   /* =========================== Layout: BUBBLE (เดิม) =========================== */
//   return (
//     <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
//       <div className="flex items-end gap-2 max-w-[780px] w-full animate-[fadeSlide_.25s_ease-out]">
//         <div
//           className={`relative rounded-2xl px-4 py-2 shadow ${bubbleColor}`}
//           onDoubleClick={onLike}
//           onClick={onOpen}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
//           title="คลิกเพื่ออ่าน"
//         >
//           <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
//           <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">{content}</p>

//           {!!photo && (
//             <button
//               onClick={(e) => { e.stopPropagation(); onImageClick?.(photo!); }}
//               className="mt-2 block relative overflow-hidden rounded-xl group"
//               title="คลิกเพื่อดูรูปใหญ่"
//             >
//               <img
//                 src={photo!}
//                 alt=""
//                 className="w-full max-h-56 sm:max-h-64 object-cover"
//                 loading="lazy"
//                 decoding="async"
//                 onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//               />
//               <span className={`pointer-events-none absolute inset-0 rounded-xl ring-1 ${ringColor}`} />
//               <span className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
//             </button>
//           )}

//           <div className={`mt-1 text-[12px] ${metaColor}`}>{author} • {dateStr}</div>

//           <div className="mt-2 flex items-center justify-between text-[12px]">
//             <div className="flex items-center gap-1 opacity-90">
//               <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
//               <span className={isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-200 tabular-nums"}>{viewCount}</span>
//             </div>
//             <button className={readBtn} onClick={(e) => { e.stopPropagation(); onOpen?.(); }}>
//               <BookOpen className="w-3.5 h-3.5" />
//               อ่าน
//             </button>
//           </div>
//         </div>

//         <button
//           onClick={(e) => { e.stopPropagation(); onLike?.(); }}
//           className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(" ")}
//           aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
//           title="ถูกใจ"
//         >
//           {liked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
//           <span className={["ml-1 text-[12px] tabular-nums", isRight ? "text-white" : "text-slate-700 dark:text-slate-200"].join(" ")}>
//             {likeCount}
//           </span>
//         </button>
//       </div>

//       <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
//     </div>
//   );
// };

// /* ============================= Page ============================= */
// type PageMode = "shorts" | "articles" | "likedShorts" | "likedArticles";

// export default function UserMessagePage() {
//   const [mode, setMode] = useState<PageMode>("shorts");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [messages, setMessages] = useState<WordHealingContent[]>([]);
//   const [liked, setLiked] = useState<Record<number, boolean>>({});
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // ✅ เปลี่ยน: บทความสั้น 10 รายการ/หน้า
//   const [shortPage, setShortPage] = useState(1);
//   const [articlePage, setArticlePage] = useState(1);
//   const [likedShortsPage, setLikedShortsPage] = useState(1);
//   const [likedArticlesPage, setLikedArticlesPage] = useState(1);

//   const SHORTS_PER_PAGE = 10;                 // ✅ 10
//   const ARTICLES_PER_PAGE = 5;
//   const LIKED_SHORTS_PER_PAGE = 10;
//   const LIKED_ARTICLES_PER_PAGE = 10;

//   const [shortImagePreview, setShortImagePreview] = useState<string | null>(null);

//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);

//   const [scrollProgress, setScrollProgress] = useState(0);
//   const [readMs, setReadMs] = useState(0);
//   const [requiredMs, setRequiredMs] = useState(15000);
//   const [isActive, setIsActive] = useState(true);
//   const [hasCountedView, setHasCountedView] = useState<Record<number, boolean>>({});
//   const scrollBodyRef = useRef<HTMLDivElement | null>(null);
//   const lastActivityRef = useRef(Date.now());

//   useEffect(() => {
//     ["/ambient/day-clouds.jpg", "/ambient/milkyway.jpg"].forEach((u) => {
//       const img = new Image();
//       img.src = u;
//     });
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsLoggedIn(!!token);

//     const fetchMessages = async () => {
//       const data = await getAllWordHealingMessagesForUser();
//       setMessages(data);

//       if (token) {
//         const uid = localStorage.getItem("id");
//         if (uid) {
//           for (const m of data) {
//             const { isLiked } = await checkIfLikedArticle(m.id, uid);
//             setLiked((prev) => ({ ...prev, [m.id]: isLiked }));
//           }
//         }
//       }
//     };

//     fetchMessages();
//     const interval = setInterval(fetchMessages, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   /* ------------------------------ Search + Split ------------------------------ */
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     setShortPage(1);
//     setArticlePage(1);
//     setLikedShortsPage(1);
//     setLikedArticlesPage(1);
//   };

//   const baseFiltered = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return messages.filter((m) =>
//       [m.name, m.author, m.articleType ?? "", m.content ?? ""].join(" ").toLowerCase().includes(q)
//     );
//   }, [messages, searchQuery]);

//   const byDateDesc = (a: WordHealingContent, b: WordHealingContent) =>
//     new Date(b.date as any).getTime() - new Date(a.date as any).getTime();

//   const shortsAll = useMemo(
//     () => baseFiltered.filter((m) => (m.articleType ?? "").trim() === "บทความสั้น").sort(byDateDesc),
//     [baseFiltered]
//   );
//   const articlesAll = useMemo(
//     () => baseFiltered.filter((m) => (m.articleType ?? "").trim() !== "บทความสั้น").sort(byDateDesc),
//     [baseFiltered]
//   );

//   // ✅ แยก liked เป็น 2 กลุ่ม
//   const likedShortsAll = useMemo(
//     () => baseFiltered.filter((m) => liked[m.id] && (m.articleType ?? "") === "บทความสั้น").sort(byDateDesc),
//     [baseFiltered, liked]
//   );
//   const likedArticlesAll = useMemo(
//     () => baseFiltered.filter((m) => liked[m.id] && (m.articleType ?? "") !== "บทความสั้น").sort(byDateDesc),
//     [baseFiltered, liked]
//   );

//   // Pagination totals
//   const shortsTotalPages = Math.max(1, Math.ceil(shortsAll.length / SHORTS_PER_PAGE));
//   const articlesTotalPages = Math.max(1, Math.ceil(articlesAll.length / ARTICLES_PER_PAGE));
//   const likedShortsTotalPages = Math.max(1, Math.ceil(likedShortsAll.length / LIKED_SHORTS_PER_PAGE));
//   const likedArticlesTotalPages = Math.max(1, Math.ceil(likedArticlesAll.length / LIKED_ARTICLES_PER_PAGE));

//   // Page items
//   const shortsPageItems = useMemo(
//     () => shortsAll.slice((shortPage - 1) * SHORTS_PER_PAGE, shortPage * SHORTS_PER_PAGE),
//     [shortsAll, shortPage]
//   );
//   const articlesPageItems = useMemo(
//     () => articlesAll.slice((articlePage - 1) * ARTICLES_PER_PAGE, articlePage * ARTICLES_PER_PAGE),
//     [articlesAll, articlePage]
//   );
//   const likedShortsPageItems = useMemo(
//     () => likedShortsAll.slice((likedShortsPage - 1) * LIKED_SHORTS_PER_PAGE, likedShortsPage * LIKED_SHORTS_PER_PAGE),
//     [likedShortsAll, likedShortsPage]
//   );
//   const likedArticlesPageItems = useMemo(
//     () =>
//       likedArticlesAll.slice(
//         (likedArticlesPage - 1) * LIKED_ARTICLES_PER_PAGE,
//         likedArticlesPage * LIKED_ARTICLES_PER_PAGE
//       ),
//     [likedArticlesAll, likedArticlesPage]
//   );

//   /* --------------------------------- Like --------------------------------- */
//   const toggleLike = async (id: number) => {
//     if (!isLoggedIn) {
//       alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ");
//       return;
//     }
//     const currentlyLiked = !!liked[id];
//     const uid = localStorage.getItem("id");
//     if (!uid) {
//       alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ");
//       return;
//     }
//     setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) } : m
//       )
//     );
//     const ok = currentlyLiked ? await unlikeMessage(id, uid) : await likeMessage(id, uid);
//     if (!ok) {
//       setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) } : m
//         )
//       );
//     }
//   };

//   /* ---------------------------- Reader (Articles/Shorts) ---------------------------- */
//   const showModal = (message: WordHealingContent) => {
//     setSelectedMessage(message);
//     setIsModalVisible(true);
//     setHasCountedView((prev) => ({ ...prev, [message.id]: false }));
//     const imgCount = hasImage(message.photo) ? 1 : 0;
//     setRequiredMs(estimateRequiredMs(message.content || "", imgCount));
//   };
//   const handleCancel = () => {
//     setIsModalVisible(false);
//     setSelectedMessage(null);
//   };

//   const computeContentPct = () => {
//     const el = scrollBodyRef.current;
//     if (!el) return 0;
//     const { scrollTop, clientHeight, scrollHeight } = el;
//     if (scrollHeight <= clientHeight + 2) return 100;
//     return Math.min(100, Math.max(0, ((scrollTop + clientHeight) / Math.max(1, scrollHeight)) * 100));
//   };

//   const checkAndCountView = () => {
//     if (!selectedMessage || hasCountedView[selectedMessage.id]) return;
//     const pct = computeContentPct();
//     setScrollProgress(pct);
//     const el = scrollBodyRef.current;
//     const scrollable = el ? el.scrollHeight > el.clientHeight + 2 : false;

//     const contentLen = (selectedMessage.content || "").trim().length;
//     const isVeryShort = contentLen <= 60;
//     const contentOk = scrollable ? pct >= 90 : true;
//     const timeOk = isVeryShort ? true : readMs >= requiredMs * 0.7;

//     if (contentOk && timeOk) {
//       updateViewCount(String(selectedMessage.id)).then((ok) => {
//         if (!ok) return;
//         setHasCountedView((prev) => ({ ...prev, [selectedMessage.id]: true }));
//         setSelectedMessage((prev) => (prev ? { ...prev, viewCount: prev.viewCount + 1 } : prev));
//         setMessages((prev) =>
//           prev.map((m) => (m.id === selectedMessage.id ? { ...m, viewCount: m.viewCount + 1 } : m))
//         );
//       });
//     }
//   };

//   useEffect(() => {
//     if (!isModalVisible) return;
//     setScrollProgress(0);
//     setReadMs(0);
//     setIsActive(true);
//     if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;

//     const onAct = () => (lastActivityRef.current = Date.now());
//     window.addEventListener("mousemove", onAct);
//     window.addEventListener("keydown", onAct);
//     window.addEventListener("wheel", onAct, { passive: true });
//     window.addEventListener("touchmove", onAct, { passive: true });

//     const timer = setInterval(() => {
//       const visible = !document.hidden;
//       const active = Date.now() - lastActivityRef.current < 15_000;
//       setIsActive(visible && active);
//       if (visible && active) setReadMs((t) => t + 1000);
//     }, 1000);

//     return () => {
//       clearInterval(timer);
//       window.removeEventListener("mousemove", onAct);
//       window.removeEventListener("keydown", onAct);
//       window.removeEventListener("wheel", onAct);
//       window.removeEventListener("touchmove", onAct);
//     };
//   }, [isModalVisible]);

//   useEffect(() => {
//     if (!isModalVisible || !selectedMessage) return;
//     checkAndCountView();
//   }, [readMs, isModalVisible, selectedMessage, requiredMs]);

//   const onModalBodyScroll: React.UIEventHandler<HTMLDivElement> = () => {
//     lastActivityRef.current = Date.now();
//     checkAndCountView();
//   };

//   const handleBack = () => window.history.back();

//   /* ----------------- Group by day (for shorts chat timeline) ----------------- */
//   function groupByDay(items: { date: string }[]) {
//     const groups: Record<string, typeof items> = {};
//     for (const it of items) {
//       const d = new Date(it.date);
//       const key = d.toDateString();
//       (groups[key] ||= []).push(it);
//     }
//     return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
//   }
//   function humanDay(label: string) {
//     const d = new Date(label);
//     const today = new Date(); today.setHours(0,0,0,0);
//     const that = new Date(d); that.setHours(0,0,0,0);
//     const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
//     if (diff === 0) return "วันนี้";
//     if (diff === 1) return "เมื่อวาน";
//     return d.toLocaleDateString();
//   }

//   const isLikedMode = mode === "likedShorts" || mode === "likedArticles";

//   /* ================================ UI ================================ */
//   return (
//     <div
//       className="font-ibmthai relative flex flex-col items-center p-6 min-h-screen
//                  bg-gradient-to-b from-[#C2F4FF] to-[#5DE2FF]
//                  dark:bg-gradient-to-b dark:from-[#1B2538] dark:to-[#0E1626]
//                  transition-all duration-300"
//     >
//       {/* AmbientBackground: ซ่อนเบา ๆ ตอนอยู่หน้า liked ถ้าต้องการ */}
//       <div
//         aria-hidden
//         className={[
//           "pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ease-out",
//           isLikedMode ? "opacity-0" : "opacity-100",
//         ].join(" ")}
//       >
//         <AmbientBackground
//           scope="page"
//           dayCloudsSrc="/ambient/day-clouds.jpg"
//           nightStyle="milkyway"
//           milkyWaySrc="/ambient/milkyway.jpg"
//         />
//       </div>

//       <div className="relative z-10 w-full">
//         {/* Header */}
//         <div className="w-full max-w-5xl mx-auto mb-4 flex items-center">
//           <button
//             onClick={handleBack}
//             className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300"
//             aria-label="ย้อนกลับ"
//           >
//             <AiOutlineArrowLeft size={24} />
//           </button>
//           <input
//             type="text"
//             placeholder="ค้นหา (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
//             value={searchQuery}
//             onChange={handleSearch}
//             className="w-full p-2 rounded-lg border border-gray-300 ml-4 dark:text-white dark:bg-gray-800"
//           />
//         </div>

//         {/* Segmented toggle */}
//         <div className="w-full max-w-5xl mx-auto mb-6">
//           <div className="mx-auto inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/70 p-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
//             {([
//               { key: "shorts",        label: "บทความสั้น",          count: shortsAll.length },
//               { key: "articles",      label: "บทความ",              count: articlesAll.length },
//               { key: "likedShorts",   label: "ที่ถูกใจ (บทสั้น)",   count: likedShortsAll.length },
//               { key: "likedArticles", label: "ที่ถูกใจ (บทความ)",   count: likedArticlesAll.length },
//             ] as { key: PageMode; label: string; count: number }[]).map((b) => {
//               const active = mode === b.key;
//               return (
//                 <button
//                   key={b.key}
//                   onClick={() => setMode(b.key)}
//                   className={[
//                     "relative px-4 py-2 text-sm font-medium rounded-full transition",
//                     active ? "bg-[#5DE2FF] text-white shadow" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
//                   ].join(" ")}
//                 >
//                   {b.label}
//                   <span
//                     className={[
//                       "ml-2 inline-flex items-center justify-center h-5 rounded-full text-[11px] tabular-nums min-w-[2.25rem]",
//                       active ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100",
//                     ].join(" ")}
//                   >
//                     {b.count}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* ============================== CONTENT ============================== */}
//         {/* ---- Mode: บทความสั้น (10 รายการ/หน้า) ---- */}
//         <section className={mode === "shorts" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "shorts"}>
//           <div className="w-full max-w-5xl mx-auto mb-10">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">บทความสั้น ({shortsAll.length})</h3>
//             </div>

//             {shortsPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ไม่มีบทความสั้น
//               </div>
//             ) : (
//               groupByDay(shortsPageItems).map(([dayKey, items]) => (
//                 <div key={dayKey} className="mb-6">
//                   <div className="sticky top-2 z-10 flex items-center justify-center my-2">
//                     <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
//                       {humanDay(dayKey)}
//                     </span>
//                   </div>

//                   {items.map((s: any, idx: number) => {
//                     const isRight =
//                       (s.author ?? "").includes("ทีมงานดูแลใจ") || ((idx % 2) === 1);
//                     return (
//                       <ShortBubble
//                         key={s.id}
//                         content={s.content}
//                         author={s.author}
//                         dateStr={fmtDate(s.date)}
//                         photo={hasImage(s.photo) ? String(s.photo) : undefined}
//                         isRight={!!isRight}
//                         liked={!!liked[s.id]}
//                         likeCount={s.no_of_like}
//                         viewCount={s.viewCount}
//                         onLike={() => toggleLike(s.id)}
//                         onImageClick={(src) => setShortImagePreview(src)}
//                         onOpen={() => showModal(s)}
//                         layout="card"
//                       />
//                     );
//                   })}
//                 </div>
//               ))
//             )}

//             {/* pagination (10 ต่อหน้า) */}
//             {shortsAll.length > SHORTS_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setShortPage((p) => Math.max(1, p - 1))} disabled={shortPage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${shortPage} จาก ${shortsTotalPages}`}</span>
//                 <button
//                   onClick={() => setShortPage((p) => Math.min(shortsTotalPages, p + 1))}
//                   disabled={shortPage === shortsTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ---- Mode: บทความ ---- */}
//         <section className={mode === "articles" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "articles"}>
//           <div className="w-full max-w-5xl mx-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">บทความ ({articlesAll.length})</h3>
//             </div>

//             {articlesPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ไม่มีบทความตามเงื่อนไข
//               </div>
//             ) : (
//               <div className="grid gap-4 grid-cols-1">
//                 {articlesPageItems.map((m) => (
//                   <div
//                     key={m.id}
//                     className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300"
//                   >
//                     <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

//                     {hasImage(m.photo) && (
//                       <figure className="mb-4 overflow-hidden rounded-lg">
//                         <img
//                           src={m.photo!}
//                           alt=""
//                           className="w-full aspect-[16/9] object-cover"
//                           loading="lazy"
//                           decoding="async"
//                           onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).style.display = "none";
//                           }}
//                         />
//                       </figure>
//                     )}

//                     <div className="flex items-center gap-2">
//                       {m.articleType && (
//                         <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                           {m.articleType}
//                         </span>
//                       )}
//                       <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
//                     </div>

//                     <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
//                       {m.content}
//                     </p>

//                     <div className="flex items-center justify-between mt-auto">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => toggleLike(m.id)}
//                           className="text-red-500 text-3xl"
//                           aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
//                         >
//                           {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
//                         </button>
//                         <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
//                         <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
//                         <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
//                       </div>
//                       <button
//                         onClick={() => showModal(m)}
//                         className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
//                       >
//                         <BookOpen className="w-5 h-5" />
//                         <span>อ่าน</span>
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {articlesAll.length > ARTICLES_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setArticlePage((p) => Math.max(1, p - 1))} disabled={articlePage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${articlePage} จาก ${articlesTotalPages}`}</span>
//                 <button
//                   onClick={() => setArticlePage((p) => Math.min(articlesTotalPages, p + 1))}
//                   disabled={articlePage === articlesTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ---- Mode: ที่ถูกใจ (บทสั้น) ---- */}
//         <section className={mode === "likedShorts" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "likedShorts"}>
//           <div className="w-full max-w-5xl mx-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">ที่ถูกใจ (บทสั้น) ({likedShortsAll.length})</h3>
//             </div>

//             {likedShortsPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ยังไม่มีบทความสั้นที่คุณถูกใจ
//               </div>
//             ) : (
//               groupByDay(likedShortsPageItems).map(([dayKey, items]) => (
//                 <div key={dayKey} className="mb-6">
//                   <div className="sticky top-2 z-10 flex items-center justify-center my-2">
//                     <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
//                       {humanDay(dayKey)}
//                     </span>
//                   </div>
//                   {items.map((s: any, idx: number) => {
//                     const isRight =
//                       (s.author ?? "").includes("ทีมงานดูแลใจ") || ((idx % 2) === 1);
//                     return (
//                       <ShortBubble
//                         key={s.id}
//                         content={s.content}
//                         author={s.author}
//                         dateStr={fmtDate(s.date)}
//                         photo={hasImage(s.photo) ? String(s.photo) : undefined}
//                         isRight={!!isRight}
//                         liked={!!liked[s.id]}
//                         likeCount={s.no_of_like}
//                         viewCount={s.viewCount}
//                         onLike={() => toggleLike(s.id)}
//                         onImageClick={(src) => setShortImagePreview(src)}
//                         onOpen={() => showModal(s)}
//                         layout="card"
//                       />
//                     );
//                   })}
//                 </div>
//               ))
//             )}

//             {likedShortsAll.length > LIKED_SHORTS_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setLikedShortsPage((p) => Math.max(1, p - 1))} disabled={likedShortsPage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${likedShortsPage} จาก ${likedShortsTotalPages}`}</span>
//                 <button
//                   onClick={() => setLikedShortsPage((p) => Math.min(likedShortsTotalPages, p + 1))}
//                   disabled={likedShortsPage === likedShortsTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ---- Mode: ที่ถูกใจ (บทความ) ---- */}
//         <section className={mode === "likedArticles" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "likedArticles"}>
//           <div className="w-full max-w-5xl mx-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-slate-900 dark:text-white">ที่ถูกใจ (บทความ) ({likedArticlesAll.length})</h3>
//             </div>

//             {likedArticlesPageItems.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
//                 ยังไม่มีบทความที่คุณถูกใจ
//               </div>
//             ) : (
//               <div className="grid gap-4 grid-cols-1">
//                 {likedArticlesPageItems.map((m) => (
//                   <div
//                     key={m.id}
//                     className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300"
//                   >
//                     <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

//                     {hasImage(m.photo) && (
//                       <figure className="mb-4 overflow-hidden rounded-lg">
//                         <img
//                           src={m.photo!}
//                           alt=""
//                           className="w-full aspect-[16/9] object-cover"
//                           loading="lazy"
//                           decoding="async"
//                           onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).style.display = "none";
//                           }}
//                         />
//                       </figure>
//                     )}

//                     <div className="flex items-center gap-2">
//                       {m.articleType && (
//                         <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                           {m.articleType}
//                         </span>
//                       )}
//                       <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
//                     </div>

//                     <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
//                       {m.content}
//                     </p>

//                     <div className="flex items-center justify-between mt-auto">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => toggleLike(m.id)}
//                           className="text-red-500 text-3xl"
//                           aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
//                         >
//                           {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
//                         </button>
//                         <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
//                         <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
//                         <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
//                       </div>
//                       <button
//                         onClick={() => showModal(m)}
//                         className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
//                       >
//                         <BookOpen className="w-5 h-5" />
//                         <span>อ่าน</span>
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {likedArticlesAll.length > LIKED_ARTICLES_PER_PAGE && (
//               <div className="mt-4 text-center space-x-4 dark:text-white">
//                 <button onClick={() => setLikedArticlesPage((p) => Math.max(1, p - 1))} disabled={likedArticlesPage === 1}>
//                   ก่อนหน้า
//                 </button>
//                 <span>{`หน้า ${likedArticlesPage} จาก ${likedArticlesTotalPages}`}</span>
//                 <button
//                   onClick={() => setLikedArticlesPage((p) => Math.min(likedArticlesTotalPages, p + 1))}
//                   disabled={likedArticlesPage === likedArticlesTotalPages}
//                 >
//                   ถัดไป
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ========================= Reader Modal ========================= */}
//         <Modal
//           open={isModalVisible}
//           onCancel={handleCancel}
//           footer={null}
//           width={1000}
//           centered
//           destroyOnClose
//           styles={{
//             mask: { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)" },
//             content: { padding: 0, background: "transparent", boxShadow: "none", border: "none", overflow: "hidden" },
//             body: { padding: 0, paddingRight: 0, paddingBottom: 0 },
//             header: { display: "none" },
//             footer: { display: "none" },
//           }}
//           closeIcon={<span style={{ color: "#e50c0cff", fontSize: 20, lineHeight: 1 }}>✕</span>}
//         >
//           {selectedMessage && (
//             <ArticleReader
//               message={selectedMessage}
//               scrollBodyRef={scrollBodyRef}
//               onModalBodyScroll={onModalBodyScroll}
//               scrollProgress={scrollProgress}
//               isActive={isActive}
//               readMs={readMs}
//               requiredMs={requiredMs}
//             />
//           )}
//         </Modal>

//         {/* ========================= Lightbox รูปของบทความสั้น ========================= */}
//         <Modal
//           open={!!shortImagePreview}
//           onCancel={() => setShortImagePreview(null)}
//           footer={null}
//           centered
//           destroyOnClose
//           width={720}
//           styles={{
//             mask: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" },
//             content: { padding: 0, background: "transparent", boxShadow: "none", border: "none" },
//             body: { padding: 0 },
//           }}
//           closeIcon={<span style={{ color: "#fff", fontSize: 22 }}>✕</span>}
//         >
//           {shortImagePreview && (
//             <div className="p-2">
//               <img
//                 src={shortImagePreview}
//                 alt=""
//                 className="w-full h-auto rounded-2xl object-contain bg-black/20"
//                 onError={() => setShortImagePreview(null)}
//               />
//             </div>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }

// /* ---------------------- Extracted: ArticleReader ---------------------- */
// function ArticleReader({
//   message,
//   scrollBodyRef,
//   onModalBodyScroll,
//   scrollProgress,
//   isActive,
//   readMs,
//   requiredMs,
// }: {
//   message: WordHealingContent;
//   scrollBodyRef: React.MutableRefObject<HTMLDivElement | null>;
//   onModalBodyScroll: React.UIEventHandler<HTMLDivElement>;
//   scrollProgress: number;
//   isActive: boolean;
//   readMs: number;
//   requiredMs: number;
// }) {
//   const contentLen = (message?.content || "").trim().length;
//   const isVeryShort = contentLen <= 60;
//   const isShortish = contentLen > 60 && contentLen <= 240;

//   const contentWidthClass = isVeryShort || isShortish ? "max-w-2xl" : "max-w-3xl";
//   const contentPadYClass = isVeryShort ? "py-10" : "py-4";
//   const contentTextSize =
//     isVeryShort ? "text-2xl sm:text-3xl leading-9" : isShortish ? "text-xl leading-8" : "text-lg leading-7";
//   const contentAlignClass = isVeryShort || isShortish ? "text-center" : "text-left";

//   return (
//     <div className="font-ibmthai relative h-[calc(100dvh-120px)] md:h-[calc(100dvh-160px)] overflow-hidden">
//       <div
//         ref={scrollBodyRef}
//         onScroll={onModalBodyScroll}
//         className="h-full overflow-y-auto overscroll-contain bg-[#F4FFFF] dark:bg-[#1B2538] dark:text-white"
//         style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//       >
//         {/* summary bar */}
//         <div className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
//           <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-2">
//             <div className="flex items-center justify-between text-[13px] sm:text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="font-medium">อ่านแล้ว {Math.round(scrollProgress)}%</span>
//                 <span
//                   className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
//                     isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
//                   }`}
//                   title="นับเวลาเฉพาะตอนหน้าจอเปิดและมีการใช้งาน"
//                 >
//                   <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-500"}`} />
//                   {isActive ? "กำลังอ่าน" : "พัก"}
//                 </span>
//               </div>

//               <div className="text-right">
//                 <div className="font-medium">เวลาอ่าน {fmtDuration(readMs)} / {fmtDuration(requiredMs)}</div>
//                 <div className="text-[12px] opacity-70">คงเหลือ ~ {fmtDuration(Math.max(0, requiredMs - readMs))}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={`${contentWidthClass} mx-auto w-full px-4 sm:px-6 ${contentPadYClass}`}>
//           <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
//             {message.name}
//           </h1>

//           {hasImage(message.photo) && (
//             <div className="mt-4 flex justify-center">
//               <img
//                 src={message.photo!}
//                 alt=""
//                 className="w-full sm:w-[520px] h-auto rounded-xl object-cover shadow"
//                 onError={(e) => {
//                   (e.currentTarget as HTMLImageElement).style.display = "none";
//                 }}
//               />
//             </div>
//           )}

//           <article className="prose prose-slate dark:prose-invert max-w-none mt-4">
//             <p className={`whitespace-pre-wrap break-words ${contentTextSize} ${contentAlignClass}`}>
//               {message.content || "-"}
//             </p>
//           </article>

//           <div className="mt-4 flex flex-col gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-white">
//             <div className="flex items-center gap-2">
//               {message.articleType && (
//                 <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
//                   {message.articleType}
//                 </span>
//               )}
//               <span>{fmtDate(message.date)}</span>
//             </div>

//             <div>
//               <span className="opacity-80">ผู้เขียน: {message.author}</span>
//             </div>

//             <div className="flex items-center justify-center gap-6 opacity-90 text-center mt-4">
//               <span>ถูกใจทั้งหมด: {message.no_of_like}</span>
//               <span>การเข้าชม: {message.viewCount}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 dark:hidden" style={{ background: "#F4FFFF" }} />
//       <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 hidden dark:block" style={{ background: "#1B2538" }} />
//     </div>
//   );
// }






// UserMessagePage.tsx
// ===================================================================================
// หน้า: บทความสั้น / บทความ / ที่ถูกใจ(บทสั้น) / ที่ถูกใจ(บทความ)
// - ShortBubble.layout="card": ซ้ายรูป | ขวาเนื้อหา
// - แยกแท็บที่ถูกใจเป็น likedShorts / likedArticles
// - บทความสั้น: 10 รายการ/หน้า
// - รูปแบบวันที่: วันนี้ / เมื่อวาน / dd/mm/yyyy (en-GB)
// - นับวิวด้วย countViewMessage (ต้องผ่านเงื่อนไขก่อน และบันทึกตอนปิดโมดอล)
// ===================================================================================

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Modal } from "antd";
import { AiOutlineArrowLeft, AiOutlineEye, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BookOpen } from "lucide-react";
import {
  getAllWordHealingMessagesForUser,
  likeMessage,
  unlikeMessage,
  checkIfLikedArticle,
  // ใช้ตัวนี้นับวิว
  countViewMessage,
} from "../../../services/https/message";
import type { WordHealingContent } from "../../../interfaces/IWordHealingContent";
import AmbientBackground from "./AmbientBackground";

/* ============================ Helpers ============================ */
const isPdf = (s?: string | null) =>
  !!s && (s.includes("application/pdf") || /\.pdf($|\?)/i.test(s || ""));
const isImage = (s?: string | null) =>
  !!s &&
  (s.startsWith("data:image/") ||
    /image\//i.test(s) ||
    /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(s || ""));
const hasImage = (s?: string | null) => !!s && !isPdf(s) && isImage(s);

/** วันที่แบบมนุษย์: วันนี้ / เมื่อวาน / dd/mm/yyyy (สากล) */
const fmtDate = (d?: string | Date) => {
  if (!d) return "ไม่มีวันที่";
  const dd = new Date(d);
  if (Number.isNaN(dd.getTime())) return "ไม่มีวันที่";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(dd);
  that.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - that.getTime()) / 86_400_000);
  if (diffDays === 0) return "วันนี้";
  if (diffDays === 1) return "เมื่อวาน";
  return dd.toLocaleDateString("en-GB");
};

const fmtDuration = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}:${rs.toString().padStart(2, "0")}`;
};

const estimateRequiredMs = (text: string, imageCount = 0) => {
  const wordLike = Math.max(
    text.trim().split(/\s+/).filter(Boolean).length,
    Math.round((text || "").length / 6)
  );
  const WPM = 200; // words per minute
  const base = 5000; // base + รูปภาพ
  const textMs = (wordLike / WPM) * 60_000;
  const imgMs = Math.min(imageCount, 10) * 3000;
  const total = base + textMs + imgMs;
  return Math.max(8000, Math.min(total * 0.7, 300_000)); // แนะนำ 70% ของเวลาอ่านโดยประมาณ
};

/* ====================== ShortBubble ====================== */
type ShortBubbleProps = {
  content: string;
  author?: string;
  dateStr?: string;
  photo?: string | null;
  isRight?: boolean;
  liked?: boolean;
  likeCount?: number;
  viewCount?: number;
  onLike?: () => void;
  onImageClick?: (src: string) => void;
  onOpen?: () => void;
  layout?: "bubble" | "card";
};

const ShortBubble: React.FC<ShortBubbleProps> = ({
  content,
  author = "ไม่ระบุผู้เขียน",
  dateStr,
  photo,
  isRight = false,
  liked = false,
  likeCount = 0,
  viewCount = 0,
  onLike,
  onImageClick,
  onOpen,
  layout = "card",
}) => {
  const bubbleColor = isRight
    ? "bg-gradient-to-br from-[#5DE2FF] to-[#49C3D6] text-white"
    : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100";
  const metaColor = isRight ? "text-white/90" : "text-slate-500 dark:text-slate-300";
  const tailColor = isRight ? "bg-[#49C3D6]" : "bg-white dark:bg-slate-800";
  const ringColor = isRight ? "ring-white/30" : "ring-slate-200 dark:ring-slate-600";
  const ghostBtn =
    isRight
      ? "border-white/60 hover:bg-white/20 text-white"
      : "border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-100";
  const readBtn =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5DE2FF] text-white hover:bg-[#4AC5D9] transition";

  if (layout === "card") {
    const IMG_W = "w-[128px] sm:w-[136px]";
    const IMG_H = "h-[96px] sm:h-[112px]";
    const emphasisBg = isRight ? "bg-white/20" : "bg-black/5 dark:bg-white/10";
    const emphasisRing = isRight ? "ring-white/25" : "ring-black/5 dark:ring-white/10";

    return (
      <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
        <div className="flex items-stretch gap-3 max-w-[820px] w-full animate-[fadeSlide_.25s_ease-out]">
          <div className={["relative rounded-2xl px-3 py-3 shadow", bubbleColor, "flex-1"].join(" ")} role="group">
            <div
              className="flex items-center gap-3"
              onClick={onOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
              title="คลิกเพื่ออ่าน"
            >
              {!!photo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick?.(photo!);
                  }}
                  className="shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5"
                  title="คลิกดูรูปใหญ่"
                >
                  <img
                    src={photo!}
                    alt=""
                    className={`${IMG_W} ${IMG_H} object-cover`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                </button>
              )}

              <div className="flex-1 min-h-[96px] sm:min-h-[112px] flex items-center">
                <div
                  className={[
                    "w-full rounded-xl px-3 py-2",
                    emphasisBg,
                    "ring",
                    emphasisRing,
                    "backdrop-blur-[1px]",
                  ].join(" ")}
                >
                  <p
                    className="text-center font-semibold text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textShadow: isRight ? "0 1px 0 rgba(0,0,0,.06)" : "none",
                    }}
                  >
                    {content}
                  </p>

                  <div className={`mt-1 text-[11px] sm:text-[12px] ${metaColor} text-center`}>
                    {author} • {dateStr}
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-4 text-[12px]">
                    <span className="inline-flex items-center gap-1">
                      <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
                      <span
                        className={
                          isRight
                            ? "text-white tabular-nums"
                            : "text-slate-700 dark:text-slate-200 tabular-nums"
                        }
                      >
                        {viewCount}
                      </span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike?.();
                      }}
                      className="inline-flex items-center gap-1"
                      aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
                      title="ถูกใจ"
                    >
                      {liked ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                      <span
                        className={
                          isRight
                            ? "text-white text-[12px]"
                            : "text-slate-700 dark:text-slate-200 text-[12px]"
                        }
                      >
                        {likeCount}
                      </span>
                    </button>

                    <button
                      className={readBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen?.();
                      }}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      อ่าน
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
          </div>

          <button
            onClick={() => onLike?.()}
            className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(
              " "
            )}
            aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
            title="ถูกใจ"
          >
            {liked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
          </button>
        </div>

        <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // bubble เดิม
  return (
    <div className={`mb-3 flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-[780px] w-full animate-[fadeSlide_.25s_ease-out]">
        <div
          className={`relative rounded-2xl px-4 py-2 shadow ${bubbleColor}`}
          onDoubleClick={onLike}
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
          title="คลิกเพื่ออ่าน"
        >
          <div className={`absolute w-3 h-3 rotate-45 -bottom-1 ${isRight ? "right-3" : "left-3"} ${tailColor} shadow`} />
          <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">{content}</p>

          {!!photo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.(photo!);
              }}
              className="mt-2 block relative overflow-hidden rounded-xl group"
              title="คลิกเพื่อดูรูปใหญ่"
            >
              <img
                src={photo!}
                alt=""
                className="w-full max-h-56 sm:max-h-64 object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
              <span className={`pointer-events-none absolute inset-0 rounded-xl ring-1 ${ringColor}`} />
              <span className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </button>
          )}

          <div className={`mt-1 text-[12px] ${metaColor}`}>{author} • {dateStr}</div>

          <div className="mt-2 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1 opacity-90">
              <AiOutlineEye className={isRight ? "text-white" : "text-[#5DE2FF]"} />
              <span
                className={
                  isRight ? "text-white tabular-nums" : "text-slate-700 dark:text-slate-200 tabular-nums"
                }
              >
                {viewCount}
              </span>
            </div>
            <button
              className={readBtn}
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.();
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              อ่าน
            </button>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          className={["shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border transition", ghostBtn].join(
            " "
          )}
          aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
          title="ถูกใจ"
        >
          {liked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
          <span
            className={["ml-1 text-[12px] tabular-nums", isRight ? "text-white" : "text-slate-700 dark:text-slate-200"].join(
              " "
            )}
          >
            {likeCount}
          </span>
        </button>
      </div>

      <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

/* ============================= Page ============================= */
type PageMode = "shorts" | "articles" | "likedShorts" | "likedArticles";

export default function UserMessagePage() {
  const [mode, setMode] = useState<PageMode>("shorts");
  const [searchQuery, setSearchQuery] = useState("");

  const [messages, setMessages] = useState<WordHealingContent[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // บทความสั้น 10 รายการ/หน้า
  const [shortPage, setShortPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const [likedShortsPage, setLikedShortsPage] = useState(1);
  const [likedArticlesPage, setLikedArticlesPage] = useState(1);

  const SHORTS_PER_PAGE = 10;
  const ARTICLES_PER_PAGE = 5;
  const LIKED_SHORTS_PER_PAGE = 10;
  const LIKED_ARTICLES_PER_PAGE = 10;

  const [shortImagePreview, setShortImagePreview] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WordHealingContent | null>(null);

  // Reader states
  const [scrollProgress, setScrollProgress] = useState(0); // 0–100 (จริงเท่าที่เลื่อน)
  const [readMs, setReadMs] = useState(0); // เวลาจริงที่อ่าน
  const [requiredMs, setRequiredMs] = useState(15000);
  const [isActive, setIsActive] = useState(true);

  const scrollBodyRef = useRef<HTMLDivElement | null>(null);
  const lastActivityRef = useRef(Date.now());

  // flags กันส่งซ้ำ & บอกว่าผ่านเงื่อนไขแล้วหรือยัง
  const passedRef = useRef(false);
  const sentRef = useRef(false);

  useEffect(() => {
    ["/ambient/day-clouds.jpg", "/ambient/milkyway.jpg"].forEach((u) => {
      const img = new Image();
      img.src = u;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchMessages = async () => {
      const data = await getAllWordHealingMessagesForUser();
      setMessages(data);

      if (token) {
        const uid = localStorage.getItem("id");
        if (uid) {
          for (const m of data) {
            const { isLiked } = await checkIfLikedArticle(m.id, uid);
            setLiked((prev) => ({ ...prev, [m.id]: isLiked }));
          }
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------------------ Search + Split ------------------------------ */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShortPage(1);
    setArticlePage(1);
    setLikedShortsPage(1);
    setLikedArticlesPage(1);
  };

  const baseFiltered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return messages.filter((m) =>
      [m.name, m.author, m.articleType ?? "", m.content ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const byDateDesc = (a: WordHealingContent, b: WordHealingContent) =>
    new Date(b.date as any).getTime() - new Date(a.date as any).getTime();

  const shortsAll = useMemo(
    () => baseFiltered.filter((m) => (m.articleType ?? "").trim() === "บทความสั้น").sort(byDateDesc),
    [baseFiltered]
  );
  const articlesAll = useMemo(
    () => baseFiltered.filter((m) => (m.articleType ?? "").trim() !== "บทความสั้น").sort(byDateDesc),
    [baseFiltered]
  );

  const likedShortsAll = useMemo(
    () => baseFiltered.filter((m) => liked[m.id] && (m.articleType ?? "") === "บทความสั้น").sort(byDateDesc),
    [baseFiltered, liked]
  );
  const likedArticlesAll = useMemo(
    () => baseFiltered.filter((m) => liked[m.id] && (m.articleType ?? "") !== "บทความสั้น").sort(byDateDesc),
    [baseFiltered, liked]
  );

  // Pagination totals
  const shortsTotalPages = Math.max(1, Math.ceil(shortsAll.length / SHORTS_PER_PAGE));
  const articlesTotalPages = Math.max(1, Math.ceil(articlesAll.length / ARTICLES_PER_PAGE));
  const likedShortsTotalPages = Math.max(1, Math.ceil(likedShortsAll.length / LIKED_SHORTS_PER_PAGE));
  const likedArticlesTotalPages = Math.max(1, Math.ceil(likedArticlesAll.length / LIKED_ARTICLES_PER_PAGE));

  // Page items
  const shortsPageItems = useMemo(
    () => shortsAll.slice((shortPage - 1) * SHORTS_PER_PAGE, shortPage * SHORTS_PER_PAGE),
    [shortsAll, shortPage]
  );
  const articlesPageItems = useMemo(
    () => articlesAll.slice((articlePage - 1) * ARTICLES_PER_PAGE, articlePage * ARTICLES_PER_PAGE),
    [articlesAll, articlePage]
  );
  const likedShortsPageItems = useMemo(
    () => likedShortsAll.slice((likedShortsPage - 1) * LIKED_SHORTS_PER_PAGE, likedShortsPage * LIKED_SHORTS_PER_PAGE),
    [likedShortsAll, likedShortsPage]
  );
  const likedArticlesPageItems = useMemo(
    () =>
      likedArticlesAll.slice(
        (likedArticlesPage - 1) * LIKED_ARTICLES_PER_PAGE,
        likedArticlesPage * LIKED_ARTICLES_PER_PAGE
      ),
    [likedArticlesAll, likedArticlesPage]
  );

  /* --------------------------------- Like --------------------------------- */
  const toggleLike = async (id: number) => {
    if (!isLoggedIn) {
      alert("กรุณาล็อกอินเพื่อทำการกดถูกใจ");
      return;
    }
    const currentlyLiked = !!liked[id];
    const uid = localStorage.getItem("id");
    if (!uid) {
      alert("ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ");
      return;
    }
    setLiked((prev) => ({ ...prev, [id]: !currentlyLiked }));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? -1 : 1)) } : m
      )
    );
    const ok = currentlyLiked ? await unlikeMessage(id, uid) : await likeMessage(id, uid);
    if (!ok) {
      setLiked((prev) => ({ ...prev, [id]: currentlyLiked }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, no_of_like: Math.max(0, m.no_of_like + (currentlyLiked ? +1 : -1)) } : m
        )
      );
    }
  };

  /* ---------------------------- Reader ---------------------------- */
  const showModal = (message: WordHealingContent) => {
    setSelectedMessage(message);
    setIsModalVisible(true);

    // reset session flags & counters
    sentRef.current = false;
    passedRef.current = false;
    setScrollProgress(0);
    setReadMs(0);
    setIsActive(true);
    if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;

    const imgCount = hasImage(message.photo) ? 1 : 0;
    setRequiredMs(estimateRequiredMs(message.content || "", imgCount));
  };

  const computeContentPct = () => {
    const el = scrollBodyRef.current;
    if (!el) return 0;
    const { scrollTop, clientHeight, scrollHeight } = el;

    // ถึงก้นจริง => 100
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if (atBottom) return 100;

    // คิดเป็นเปอร์เซ็นต์ (ปัดลง) โดยไม่บังคับ 100
    const ratio = (scrollTop + clientHeight) / Math.max(1, scrollHeight);
    return Math.max(0, Math.min(99, Math.floor(ratio * 100)));
  };

  // ตรวจเงื่อนไขผ่านหรือยัง
  const evalPass = (msg: WordHealingContent | null, pct: number, ms: number) => {
    if (!msg) return false;
    const contentLen = (msg.content || "").trim().length;
    const isVeryShort = contentLen <= 60;
    const scrollable =
      scrollBodyRef.current
        ? scrollBodyRef.current.scrollHeight > scrollBodyRef.current.clientHeight + 2
        : false;

    const timeOk = isVeryShort ? true : ms >= requiredMs * 0.7;
    const contentOk = scrollable ? pct >= 90 : true;
    return timeOk && contentOk;
  };

  // activity tracking + นับเวลาจริง
  useEffect(() => {
    if (!isModalVisible) return;

    const onAct = () => (lastActivityRef.current = Date.now());
    window.addEventListener("mousemove", onAct);
    window.addEventListener("keydown", onAct);
    window.addEventListener("wheel", onAct, { passive: true });
    window.addEventListener("touchmove", onAct, { passive: true });

    const timer = setInterval(() => {
      const visible = !document.hidden;
      const active = Date.now() - lastActivityRef.current < 15_000;
      setIsActive(visible && active);
      if (visible && active) {
        setReadMs((t) => t + 1000);
      }
      // อัปเดตเปอร์เซ็นต์ทุกวินาที (ปัดลง)
      setScrollProgress(computeContentPct());
      // อัปเดตสถานะผ่าน/ไม่ผ่าน
      if (!passedRef.current && evalPass(selectedMessage, computeContentPct(), readMs + (visible && active ? 1000 : 0))) {
        passedRef.current = true;
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", onAct);
      window.removeEventListener("keydown", onAct);
      window.removeEventListener("wheel", onAct);
      window.removeEventListener("touchmove", onAct);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible, selectedMessage, requiredMs]);

  const onModalBodyScroll: React.UIEventHandler<HTMLDivElement> = () => {
    lastActivityRef.current = Date.now();
    // อัปเดต % ตามจริงเมื่อมีการเลื่อน
    setScrollProgress(computeContentPct());
    if (!passedRef.current && evalPass(selectedMessage, computeContentPct(), readMs)) {
      passedRef.current = true;
    }
  };

  // ปิด modal → ถ้าผ่านเงื่อนไข ให้บันทึกวิวหนึ่งครั้ง
  const handleCancel = async () => {
    if (selectedMessage && !sentRef.current && passedRef.current && isLoggedIn) {
      sentRef.current = true;
      const pctFinal = computeContentPct(); // ค่าล่าสุด (ไม่บังคับ 100)
      const msFinal = readMs;              // เวลาจริงที่อ่าน

      try {
        const res = await countViewMessage(selectedMessage.id, {
          readMs: msFinal,
          pctScrolled: Math.max(pctFinal, scrollProgress), // กันกรณีปัดลงล่าสุดน้อยกว่า state
        });

        const newCount =
          typeof res?.view_count === "number"
            ? res.view_count
            : (selectedMessage.viewCount || 0) + 1;

        // อัปเดต state ทั้งตัวที่เลือกและในรายการ
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessage.id ? { ...m, viewCount: newCount } : m))
        );
        setSelectedMessage((prev) => (prev ? { ...prev, viewCount: newCount } : prev));
      } catch {
        // ignore เงียบ ๆ
      }
    }

    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  const handleBack = () => window.history.back();

  /* ----------------- Group by day ----------------- */
  function groupByDay<T extends { date: string | Date }>(items: T[]) {
    const groups: Record<string, T[]> = {};
    for (const it of items) {
      const d = new Date(it.date);
      const key = d.toDateString();
      (groups[key] ||= []).push(it);
    }
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }
  function humanDay(label: string) {
    const d = new Date(label);
    const today = new Date(); today.setHours(0,0,0,0);
    const that = new Date(d); that.setHours(0,0,0,0);
    const diff = Math.round((today.getTime() - that.getTime()) / 86400000);
    if (diff === 0) return "วันนี้";
    if (diff === 1) return "เมื่อวาน";
    return d.toLocaleDateString("en-GB");
  }

  const isLikedMode = mode === "likedShorts" || mode === "likedArticles";

  /* ================================ UI ================================ */
  return (
    <div
      className="font-ibmthai relative flex flex-col items-center p-6 min-h-screen
                 bg-gradient-to-b from-[#C2F4FF] to-[#5DE2FF]
                 dark:bg-gradient-to-b dark:from-[#1B2538] dark:to-[#0E1626]
                 transition-all duration-300"
    >
      {/* Ambient */}
      <div
        aria-hidden
        className={[
          "pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ease-out",
          isLikedMode ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <AmbientBackground
          scope="page"
          dayCloudsSrc="/ambient/day-clouds.jpg"
          nightStyle="milkyway"
          milkyWaySrc="/ambient/milkyway.jpg"
        />
      </div>

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="w-full max-w-5xl mx-auto mb-4 flex items-center">
          <button
            onClick={handleBack}
            className="p-2 bg-[#5DE2FF] text-white rounded-full hover:bg-[#4AC5D9] transition duration-300"
            aria-label="ย้อนกลับ"
          >
            <AiOutlineArrowLeft size={24} />
          </button>
        </div>

        {/* Search + Tabs */}
        <div className="w-full max-w-5xl mx-auto mb-2">
          <input
            type="text"
            placeholder="ค้นหา (ชื่อ/ผู้เขียน/ประเภท/คำในเนื้อหา)..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-2 rounded-lg border border-gray-300 dark:text-white dark:bg-gray-800"
          />
        </div>

        <div className="w-full max-w-5xl mx-auto mb-6">
          <div className="mx-auto inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/70 p-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
            {([
              { key: "shorts",        label: "บทความสั้น",        count: shortsAll.length },
              { key: "articles",      label: "บทความ",            count: articlesAll.length },
              { key: "likedShorts",   label: "ที่ถูกใจ (บทสั้น)", count: likedShortsAll.length },
              { key: "likedArticles", label: "ที่ถูกใจ (บทความ)", count: likedArticlesAll.length },
            ] as { key: PageMode; label: string; count: number }[]).map((b) => {
              const active = mode === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => setMode(b.key)}
                  className={[
                    "relative px-4 py-2 text-sm font-medium rounded-full transition",
                    active
                      ? "bg-[#5DE2FF] text-white shadow"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
                  ].join(" ")}
                >
                  {b.label}
                  <span
                    className={[
                      "ml-2 inline-flex items-center justify-center h-5 rounded-full text-[11px] tabular-nums min-w-[2.25rem]",
                      active ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100",
                    ].join(" ")}
                  >
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================== CONTENT ============================== */}
        {/* ---- บทความสั้น ---- */}
        <section className={mode === "shorts" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "shorts"}>
          <div className="w-full max-w-5xl mx-auto mb-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">บทความสั้น ({shortsAll.length})</h3>
            </div>

            {shortsPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
                ไม่มีบทความสั้น
              </div>
            ) : (
              groupByDay(shortsPageItems).map(([dayKey, items]) => (
                <div key={dayKey} className="mb-6">
                  <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                    <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                      {humanDay(dayKey)}
                    </span>
                  </div>

                  {items.map((s: any, idx: number) => {
                    const isRight = (s.author ?? "").includes("ทีมงานดูแลใจ") || (idx % 2 === 1);
                    return (
                      <ShortBubble
                        key={s.id}
                        content={s.content}
                        author={s.author}
                        dateStr={fmtDate(s.date)}
                        photo={hasImage(s.photo) ? String(s.photo) : undefined}
                        isRight={!!isRight}
                        liked={!!liked[s.id]}
                        likeCount={s.no_of_like}
                        viewCount={s.viewCount}
                        onLike={() => toggleLike(s.id)}
                        onImageClick={(src) => setShortImagePreview(src)}
                        onOpen={() => showModal(s)}
                        layout="card"
                      />
                    );
                  })}
                </div>
              ))
            )}

            {shortsAll.length > SHORTS_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setShortPage((p) => Math.max(1, p - 1))} disabled={shortPage === 1}>
                  ก่อนหน้า
                </button>
                <span>{`หน้า ${shortPage} จาก ${shortsTotalPages}`}</span>
                <button
                  onClick={() => setShortPage((p) => Math.min(shortsTotalPages, p + 1))}
                  disabled={shortPage === shortsTotalPages}
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---- บทความ ---- */}
        <section className={mode === "articles" ? "" : "hidden w-0 h-0 overflow-hidden"} aria-hidden={mode !== "articles"}>
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">บทความ ({articlesAll.length})</h3>
            </div>

            {articlesPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
                ไม่มีบทความตามเงื่อนไข
              </div>
            ) : (
              groupByDay(articlesPageItems).map(([dayKey, items]) => (
                <div key={dayKey} className="mb-6">
                  <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                    <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                      {humanDay(dayKey)}
                    </span>
                  </div>

                  <div className="grid gap-4 grid-cols-1">
                    {items.map((m: WordHealingContent) => (
                      <div
                        key={m.id}
                        className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300"
                      >
                        <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

                        {hasImage(m.photo) && (
                          <figure className="mb-4 overflow-hidden rounded-lg">
                            <img
                              src={m.photo!}
                              alt=""
                              className="w-full aspect-[16/9] object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </figure>
                        )}

                        <div className="flex items-center gap-2">
                          {m.articleType && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{m.articleType}</span>
                          )}
                          <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
                        </div>

                        <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
                          {m.content}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLike(m.id)}
                              className="text-red-500 text-3xl"
                              aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
                            >
                              {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
                            </button>
                            <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
                            <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
                            <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
                          </div>
                          <button
                            onClick={() => showModal(m)}
                            className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
                          >
                            <BookOpen className="w-5 h-5" />
                            <span>อ่าน</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {articlesAll.length > ARTICLES_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setArticlePage((p) => Math.max(1, p - 1))} disabled={articlePage === 1}>
                  ก่อนหน้า
                </button>
                <span>{`หน้า ${articlePage} จาก ${articlesTotalPages}`}</span>
                <button
                  onClick={() => setArticlePage((p) => Math.min(articlesTotalPages, p + 1))}
                  disabled={articlePage === articlesTotalPages}
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---- ที่ถูกใจ (บทสั้น) ---- */}
        <section
          className={mode === "likedShorts" ? "" : "hidden w-0 h-0 overflow-hidden"}
          aria-hidden={mode !== "likedShorts"}
        >
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">ที่ถูกใจ (บทสั้น) ({likedShortsAll.length})</h3>
            </div>

            {likedShortsPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
                ยังไม่มีบทความสั้นที่คุณถูกใจ
              </div>
            ) : (
              groupByDay(likedShortsPageItems).map(([dayKey, items]) => (
                <div key={dayKey} className="mb-6">
                  <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                    <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                      {humanDay(dayKey)}
                    </span>
                  </div>
                  {items.map((s: any, idx: number) => {
                    const isRight = (s.author ?? "").includes("ทีมงานดูแลใจ") || (idx % 2 === 1);
                    return (
                      <ShortBubble
                        key={s.id}
                        content={s.content}
                        author={s.author}
                        dateStr={fmtDate(s.date)}
                        photo={hasImage(s.photo) ? String(s.photo) : undefined}
                        isRight={!!isRight}
                        liked={!!liked[s.id]}
                        likeCount={s.no_of_like}
                        viewCount={s.viewCount}
                        onLike={() => toggleLike(s.id)}
                        onImageClick={(src) => setShortImagePreview(src)}
                        onOpen={() => showModal(s)}
                        layout="card"
                      />
                    );
                  })}
                </div>
              ))
            )}

            {likedShortsAll.length > LIKED_SHORTS_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setLikedShortsPage((p) => Math.max(1, p - 1))} disabled={likedShortsPage === 1}>
                  ก่อนหน้า
                </button>
                <span>{`หน้า ${likedShortsPage} จาก ${likedShortsTotalPages}`}</span>
                <button
                  onClick={() => setLikedShortsPage((p) => Math.min(likedShortsTotalPages, p + 1))}
                  disabled={likedShortsPage === likedShortsTotalPages}
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---- ที่ถูกใจ (บทความ) ---- */}
        <section
          className={mode === "likedArticles" ? "" : "hidden w-0 h-0 overflow-hidden"}
          aria-hidden={mode !== "likedArticles"}
        >
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ที่ถูกใจ (บทความ) ({likedArticlesAll.length})
              </h3>
            </div>

            {likedArticlesPageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:text-gray-400">
                ยังไม่มีบทความที่คุณถูกใจ
              </div>
            ) : (
              groupByDay(likedArticlesPageItems).map(([dayKey, items]) => (
                <div key={dayKey} className="mb-6">
                  <div className="sticky top-2 z-10 flex items-center justify-center my-2">
                    <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                      {humanDay(dayKey)}
                    </span>
                  </div>

                  <div className="grid gap-4 grid-cols-1">
                    {items.map((m: WordHealingContent) => (
                      <div
                        key={m.id}
                        className="flex flex-col bg-white/80 rounded-xl shadow-lg lg:p-6 p-4 mx-auto dark:bg-[#1B2538] text-white w-full transition-all duration-300"
                      >
                        <h3 className="text-lg text-center mb-4 font-bold text-gray-800 dark:text-white">{m.name}</h3>

                        {hasImage(m.photo) && (
                          <figure className="mb-4 overflow-hidden rounded-lg">
                            <img
                              src={m.photo!}
                              alt=""
                              className="w-full aspect-[16/9] object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </figure>
                        )}

                        <div className="flex items-center gap-2">
                          {m.articleType && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{m.articleType}</span>
                          )}
                          <p className="text-gray-600 dark:text-white">{fmtDate(m.date)}</p>
                        </div>

                        <p className="text-lg font-bold text-gray-800 mb-4 text-center overflow-ellipsis overflow-hidden whitespace-nowrap dark:text-white">
                          {m.content}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLike(m.id)}
                              className="text-red-500 text-3xl"
                              aria-label={liked[m.id] ? "เลิกถูกใจ" : "ถูกใจ"}
                            >
                              {liked[m.id] ? <AiFillHeart /> : <AiOutlineHeart />}
                            </button>
                            <span className="text-gray-700 dark:text-white tabular-nums">{m.no_of_like}</span>
                            <AiOutlineEye className="text-xl" style={{ height: 35, width: 35, color: "#5DE2FF" }} />
                            <span className="text-gray-700 dark:text-white tabular-nums">{m.viewCount}</span>
                          </div>
                          <button
                            onClick={() => showModal(m)}
                            className="px-7 py-2 bg-[#5DE2FF] text-white rounded-lg flex items-center gap-4 hover:bg-[#4AC5D9] transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-700"
                          >
                            <BookOpen className="w-5 h-5" />
                            <span>อ่าน</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {likedArticlesAll.length > LIKED_ARTICLES_PER_PAGE && (
              <div className="mt-4 text-center space-x-4 dark:text-white">
                <button onClick={() => setLikedArticlesPage((p) => Math.max(1, p - 1))} disabled={likedArticlesPage === 1}>
                  ก่อนหน้า
                </button>
                <span>{`หน้า ${likedArticlesPage} จาก ${likedArticlesTotalPages}`}</span>
                <button
                  onClick={() => setLikedArticlesPage((p) => Math.min(likedArticlesTotalPages, p + 1))}
                  disabled={likedArticlesPage === likedArticlesTotalPages}
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================= Reader Modal ========================= */}
        <Modal
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={1000}
          centered
          destroyOnClose
          styles={{
            mask: { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)" },
            content: { padding: 0, background: "transparent", boxShadow: "none", border: "none", overflow: "hidden" },
            body: { padding: 0, paddingRight: 0, paddingBottom: 0 },
            header: { display: "none" },
            footer: { display: "none" },
          }}
          closeIcon={<span style={{ color: "#e50c0cff", fontSize: 20, lineHeight: 1 }}>✕</span>}
        >
          {selectedMessage && (
            <ArticleReader
              message={selectedMessage}
              scrollBodyRef={scrollBodyRef}
              onModalBodyScroll={onModalBodyScroll}
              scrollProgress={scrollProgress}
              isActive={isActive}
              readMs={readMs}
              requiredMs={requiredMs}
            />
          )}
        </Modal>

        {/* ========================= Lightbox รูปบทสั้น ========================= */}
        <Modal
          open={!!shortImagePreview}
          onCancel={() => setShortImagePreview(null)}
          footer={null}
          centered
          destroyOnClose
          width={720}
          styles={{
            mask: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" },
            content: { padding: 0, background: "transparent", boxShadow: "none", border: "none" },
            body: { padding: 0 },
          }}
          closeIcon={<span style={{ color: "#fff", fontSize: 22 }}>✕</span>}
        >
          {shortImagePreview && (
            <div className="p-2">
              <img
                src={shortImagePreview}
                alt=""
                className="w-full h-auto rounded-2xl object-contain bg-black/20"
                onError={() => setShortImagePreview(null)}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

/* ---------------------- ArticleReader ---------------------- */
function ArticleReader({
  message,
  scrollBodyRef,
  onModalBodyScroll,
  scrollProgress,
  isActive,
  readMs,
  requiredMs,
}: {
  message: WordHealingContent;
  scrollBodyRef: React.MutableRefObject<HTMLDivElement | null>;
  onModalBodyScroll: React.UIEventHandler<HTMLDivElement>;
  scrollProgress: number;
  isActive: boolean;
  readMs: number;
  requiredMs: number;
}) {
  const contentLen = (message?.content || "").trim().length;
  const isVeryShort = contentLen <= 60;
  const isShortish = contentLen > 60 && contentLen <= 240;

  const contentWidthClass = isVeryShort || isShortish ? "max-w-2xl" : "max-w-3xl";
  const contentPadYClass = isVeryShort ? "py-10" : "py-4";
  const contentTextSize =
    isVeryShort ? "text-2xl sm:text-3xl leading-9" : isShortish ? "text-xl leading-8" : "text-lg leading-7";
  const contentAlignClass = isVeryShort || isShortish ? "text-center" : "text-left";

  return (
    <div className="font-ibmthai relative h-[calc(100dvh-120px)] md:h-[calc(100dvh-160px)] overflow-hidden">
      <div
        ref={scrollBodyRef}
        onScroll={onModalBodyScroll}
        className="h-full overflow-y-auto overscroll-contain bg-[#F4FFFF] dark:bg-[#1B2538] dark:text-white"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* summary bar */}
        <div className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-2">
            <div className="flex items-center justify-between text-[13px] sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">อ่านแล้ว {Math.floor(scrollProgress)}%</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                  }`}
                  title="นับเวลาเฉพาะตอนหน้าจอเปิดและมีการใช้งาน"
                >
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-500"}`} />
                  {isActive ? "กำลังอ่าน" : "พัก"}
                </span>
              </div>

              <div className="text-right">
                <div className="font-medium">
                  เวลาอ่าน {fmtDuration(readMs)} / {fmtDuration(requiredMs)}
                </div>
                <div className="text-[12px] opacity-70">
                  คงเหลือ ~ {fmtDuration(Math.max(0, requiredMs - readMs))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${contentWidthClass} mx-auto w-full px-4 sm:px-6 ${contentPadYClass}`}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
            {message.name}
          </h1>

          {hasImage(message.photo) && (
            <div className="mt-4 flex justify-center">
              <img
                src={message.photo!}
                alt=""
                className="w-full sm:w-[520px] h-auto rounded-xl object-cover shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <article className="prose prose-slate dark:prose-invert max-w-none mt-4">
            <p className={`whitespace-pre-wrap break-words ${contentTextSize} ${contentAlignClass}`}>
              {message.content || "-"}
            </p>
          </article>

          <div className="mt-4 flex flex-col gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-white">
            <div className="flex items-center gap-2">
              {message.articleType && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">{message.articleType}</span>
              )}
              <span>{fmtDate(message.date)}</span>
            </div>

            <div>
              <span className="opacity-80">ผู้เขียน: {message.author}</span>
            </div>

            <div className="flex items-center justify-center gap-6 opacity-90 text-center mt-4">
              <span>ถูกใจทั้งหมด: {message.no_of_like}</span>
              <span>การเข้าชม: {message.viewCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 dark:hidden" style={{ background: "#F4FFFF" }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-10 hidden dark:block" style={{ background: "#1B2538" }} />
    </div>
  );
}

